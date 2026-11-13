import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

// Be Vietnam Pro (body), Bricolage Grotesque (headings), JetBrains Mono (prices, order codes): all three have
// Vietnamese glyphs. Served from our own build (@fontsource, OFL fonts packaged for npm), not fetched from Google at
// run time: a network that blocks Google no longer drops the page to the system font. Only the weights in use.
// (next/font/google is not used: it fails under Turbopack on Windows with Next 15.3.)
import "@fontsource/be-vietnam-pro/400.css"
import "@fontsource/be-vietnam-pro/500.css"
import "@fontsource/be-vietnam-pro/600.css"
import "@fontsource/be-vietnam-pro/700.css"
import "@fontsource/bricolage-grotesque/600.css"
import "@fontsource/bricolage-grotesque/700.css"
import "@fontsource/bricolage-grotesque/800.css"
import "@fontsource/jetbrains-mono/500.css"
import "@fontsource/jetbrains-mono/700.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "Com4Fud - Đi chợ online",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-mode="light">
      <body className="bg-page font-sans text-ink antialiased">
        {/* Keyboard users can jump over the header. Every layout renders
            <main id="main">. */}
        <a href="#main" className="skip-link">
          Bỏ qua tới nội dung
        </a>
        <div className="relative">{props.children}</div>
      </body>
    </html>
  )
}
