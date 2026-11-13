"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import React from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: any
}) => {
  const params = useParams()
  const pathname = usePathname()
  // The site-wide 404 page sits outside [countryCode], so there is no param: take the first part of the address
  // ("/vn/khong-ton-tai" -> "vn"), never print "undefined" into the link.
  const countryCode = (params?.countryCode as string | undefined) || pathname?.split("/")[1] || "vn"

  return (
    <Link href={`/${countryCode}${href}`} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
