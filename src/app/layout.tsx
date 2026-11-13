import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "Com4Fud - Đi chợ online",
}

// Be Vietnam Pro (body), Bricolage Grotesque (headings), JetBrains Mono
// (prices, order codes): all three have Vietnamese glyphs. Loaded via <link>
// because next/font/google fails under Turbopack on Windows (Next 15.3).
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=JetBrains+Mono:wght@500;700&display=swap"

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-mode="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={FONT_URL} />
      </head>
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
