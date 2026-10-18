"use client"

import { clx } from "@medusajs/ui"
import React from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Button of the v2 design (btn() in ui.js), recoloured to the green palette.
export type ButtonVariant =
  | "primary" // buy actions
  | "secondary" // white with border
  | "deep" // dark green
  | "warn" // turmeric, e.g. "Mua ngay" on a green banner
  | "accent" // lime, Trợ lý Bếp / Mua lại
  | "danger"
  | "dangerSoft"
  | "ghost"
  | "onDark" // secondary button on a dark surface

export type ButtonSize = "xs" | "sm" | "md" | "lg"

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-mid active:bg-brand-deep",
  secondary: "bg-surface text-ink border border-line-2 hover:bg-page",
  deep: "bg-brand-deep text-white hover:bg-brand-mid",
  warn: "bg-warn text-ink hover:brightness-95",
  accent: "bg-accent text-ink hover:brightness-95",
  danger: "bg-sale-deep text-white hover:bg-sale",
  dangerSoft: "bg-surface text-sale-deep border border-sale-line hover:bg-sale-bg",
  ghost: "text-ink hover:bg-page-2",
  onDark: "bg-brand-mid text-white border border-dark-line hover:bg-brand",
}

// Heights 30/36/44/52px as in the design. xs/sm stay visually small but get
// a 44px hit area through .touch-target.
const SIZES: Record<ButtonSize, string> = {
  xs: "h-[30px] px-2.5 text-[13px] rounded-[10px] gap-1.5 touch-target",
  sm: "h-9 px-3.5 text-[13px] rounded-[10px] gap-1.5 touch-target",
  md: "h-11 px-[18px] text-[15px] rounded-btn gap-2",
  lg: "h-[52px] px-6 text-[15px] rounded-btn gap-2",
}

const ICON_ONLY: Record<ButtonSize, string> = {
  xs: "w-[30px] px-0",
  sm: "w-9 px-0",
  md: "w-11 px-0",
  lg: "w-[52px] px-0",
}

type CommonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  /**
   * An icon element, e.g. icon={<LuBell />}. Elements (not components) so
   * server components can pass them to this client component. react-icons
   * size themselves to 1em, so the wrapper font-size sets the icon size.
   */
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  fullWidth?: boolean
  pill?: boolean
  className?: string
  children?: React.ReactNode
  /** Required when the button has only an icon. */
  "aria-label"?: string
}

type AsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined
  }

type AsLink = CommonProps & {
  /** Path inside the store, without the country code (e.g. "/store"). */
  href: string
  onClick?: () => void
}

export type ButtonProps = AsButton | AsLink

export function buttonClasses({
  variant = "primary",
  size = "md",
  iconOnly = false,
  fullWidth = false,
  pill = false,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  iconOnly?: boolean
  fullWidth?: boolean
  pill?: boolean
  className?: string
}) {
  return clx(
    "relative inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold transition-colors",
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-50 disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    iconOnly && ICON_ONLY[size],
    pill && "!rounded-full",
    fullWidth && "w-full",
    className
  )
}

export default function Button(props: ButtonProps) {
  const {
    variant,
    size = "md",
    icon,
    iconRight,
    fullWidth,
    pill,
    className,
    children,
  } = props
  const iconSize = size === "xs" || size === "sm" ? "text-base" : "text-lg"
  const classes = buttonClasses({
    variant,
    size,
    iconOnly: !children,
    fullWidth,
    pill,
    className,
  })
  const content = (
    <>
      {icon && (
        <span aria-hidden="true" className={clx("flex", iconSize)}>
          {icon}
        </span>
      )}
      {children}
      {iconRight && (
        <span aria-hidden="true" className={clx("flex", iconSize)}>
          {iconRight}
        </span>
      )}
    </>
  )

  if (props.href !== undefined) {
    return (
      <LocalizedClientLink
        href={props.href}
        onClick={props.onClick}
        className={classes}
        aria-label={props["aria-label"]}
      >
        {content}
      </LocalizedClientLink>
    )
  }

  const {
    variant: _v,
    size: _s,
    icon: _i,
    iconRight: _ir,
    fullWidth: _f,
    pill: _p,
    className: _c,
    children: _ch,
    href: _h,
    type = "button",
    onClick,
    ...rest
  } = props as AsButton

  // aria-disabled keeps the button focusable so keyboard and screen-reader
  // users still find it (and can learn why it is off); we block the click.
  const ariaDisabled = rest["aria-disabled"] === true || rest["aria-disabled"] === "true"

  return (
    <button
      type={type}
      className={classes}
      onClick={(e) => {
        if (ariaDisabled) {
          e.preventDefault()
          return
        }
        onClick?.(e)
      }}
      {...rest}
    >
      {content}
    </button>
  )
}
