// Crawls the storefront from its start page and reports internal links that
// answer 400 or more (issue #11: no broken links). Run it against a running
// server: `yarn start` (after `yarn build`) or `yarn dev`.
//
//   node scripts/check-links.mjs                 # http://localhost:8000/vn
//   node scripts/check-links.mjs http://localhost:8000/vn 300
//
// The crawl reads the HTML only, so links in the hidden mobile menu are
// included, as the issue asks. Exit code 1 when anything is broken.

const start = new URL(process.argv[2] ?? "http://localhost:8000/vn")
const limit = Number(process.argv[3] ?? 300)
const origin = start.origin

// The middleware sets a cache cookie and redirects to the same URL once, so
// the checker keeps cookies and follows redirects itself (fetch would not).
const cookies = new Map()

async function get(url, hops = 0) {
  const target = new URL(url)
  const jar = cookies.get(target.host)
  const res = await fetch(url, {
    redirect: "manual",
    headers: jar ? { cookie: [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ") } : {},
  })
  for (const line of res.headers.getSetCookie?.() ?? []) {
    const [pair] = line.split(";")
    const eq = pair.indexOf("=")
    if (eq > 0) {
      if (!cookies.has(target.host)) cookies.set(target.host, new Map())
      cookies.get(target.host).set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim())
    }
  }
  const location = res.headers.get("location")
  if (location && res.status >= 300 && res.status < 400 && hops < 5) {
    return get(new URL(location, url).href, hops + 1)
  }
  return res
}

const seen = new Map() // url -> status
const queue = [start.href]
const broken = []
const referrers = new Map() // url -> pages that link to it

const hrefs = (html) =>
  [...html.matchAll(/\shref="([^"#]*)(#[^"]*)?"/g)].map((m) => m[1]).filter(Boolean)

while (queue.length && seen.size < limit) {
  const current = queue.shift()
  if (seen.has(current)) continue

  let res
  try {
    res = await get(current)
  } catch (error) {
    seen.set(current, "network error")
    broken.push({ url: current, status: "network error", from: referrers.get(current) ?? [] })
    continue
  }
  seen.set(current, res.status)

  if (res.status >= 400) {
    broken.push({ url: current, status: res.status, from: referrers.get(current) ?? [] })
    continue
  }

  const type = res.headers.get("content-type") ?? ""
  if (!type.includes("text/html")) continue

  const html = await res.text()
  for (const raw of hrefs(html)) {
    let target
    try {
      target = new URL(raw, current)
    } catch {
      continue
    }
    if (target.origin !== origin) continue
    if (!["http:", "https:"].includes(target.protocol)) continue
    target.hash = ""
    const key = target.href
    if (!referrers.has(key)) referrers.set(key, [])
    referrers.get(key).push(current)
    if (!seen.has(key) && !queue.includes(key)) queue.push(key)
  }
}

console.log(`Checked ${seen.size} internal URLs from ${start.href}`)
if (queue.length && seen.size >= limit) {
  console.log(`Stopped at the limit of ${limit} URLs; ${queue.length} left unchecked.`)
}

if (broken.length === 0) {
  console.log("No broken internal links.")
  process.exit(0)
}

console.log(`${broken.length} broken link(s):`)
for (const b of broken) {
  console.log(`  ${b.status}  ${b.url}`)
  for (const from of b.from.slice(0, 3)) console.log(`        linked from ${from}`)
}
process.exit(1)
