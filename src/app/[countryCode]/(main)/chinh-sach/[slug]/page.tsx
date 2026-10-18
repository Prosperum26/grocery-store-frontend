import { Metadata } from "next"
import { notFound } from "next/navigation"

import { POLICIES, findPolicy } from "@lib/mock/site"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = { params: Promise<{ countryCode: string; slug: string }> }

export function generateStaticParams() {
  return POLICIES.map((p) => ({ countryCode: "vn", slug: p.slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const policy = findPolicy(slug)
  return { title: policy ? `${policy.title} · Com4Fud` : "Com4Fud" }
}

export default async function PolicyPage(props: Props) {
  const { slug } = await props.params
  const policy = findPolicy(slug)
  if (!policy) notFound()

  return (
    <div className="content-container flex flex-col gap-8 py-10 small:flex-row small:py-14">
      <nav aria-label="Chính sách" className="small:w-64 small:shrink-0">
        <ul className="flex flex-wrap gap-2 small:flex-col">
          {POLICIES.map((p) => (
            <li key={p.slug}>
              <LocalizedClientLink
                href={`/chinh-sach/${p.slug}`}
                aria-current={p.slug === slug ? "page" : undefined}
                className={
                  p.slug === slug
                    ? "block rounded-[10px] bg-brand-bg px-3 py-2.5 text-sm font-semibold text-brand-deep"
                    : "block rounded-[10px] px-3 py-2.5 text-sm text-ink hover:bg-page-2"
                }
              >
                {p.title}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </nav>
      <article className="flex max-w-2xl flex-col gap-4 rounded-card border border-line bg-surface p-6 small:p-8">
        <h1 className="text-3xl font-bold">{policy.title}</h1>
        {policy.paragraphs.map((text) => (
          <p key={text} className="text-base leading-7 text-ink-2">
            {text}
          </p>
        ))}
      </article>
    </div>
  )
}
