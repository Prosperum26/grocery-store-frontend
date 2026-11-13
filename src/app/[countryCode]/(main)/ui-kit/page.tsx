import { Metadata } from "next"
import { notFound } from "next/navigation"

import UiKitDemo from "@modules/ui-kit/demo"

// Temporary component gallery for design review (removed in FE-14).
export const metadata: Metadata = {
  title: "Thành phần giao diện · Com4Fud",
  robots: { index: false, follow: false },
}

export default function UiKitPage() {
  // Design review only: not part of the shop.
  if (process.env.NODE_ENV === "production") notFound()
  return <UiKitDemo />
}
