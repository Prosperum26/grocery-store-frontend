const path = require("path")

module.exports = {
  darkMode: "class",
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: "width margin",
        height: "height",
        bg: "background-color",
        display: "display opacity",
        visibility: "visibility",
        padding: "padding-top padding-right padding-bottom padding-left",
      },
      colors: {
        // Com4Fud palette: layout of the v2 design, green colours of v1
        // (docs/plans/2026-10-18-sync-ui-v2-frontend.md §1.2). Named by role,
        // not by hue, because v2 called the buy colour "red".
        brand: {
          DEFAULT: "#1F6B3A",
          deep: "#0F3D2E",
          mid: "#16503A",
          vivid: "#3C9A5B",
          bg: "#DCEFD9",
        },
        // Lime: only for "Mua lại" and "Trợ lý Bếp". Text on it is ink/accent-ink.
        accent: { DEFAULT: "#C8F169", soft: "#EEFAD0", ink: "#3D5A00" },
        sale: {
          DEFAULT: "#C8361F",
          vivid: "#E8492B",
          bg: "#FDE4DE",
          deep: "#9E2815",
          line: "#F3BFB3",
        },
        warn: { DEFAULT: "#E9A23B", bg: "#FCEFD6", ink: "#7A4B00" },
        ink: { DEFAULT: "#10241B", 2: "#4E5D55", 3: "#626E67" },
        page: { DEFAULT: "#F2F4EC", 2: "#E8ECDF" },
        surface: "#FFFFFF",
        line: { DEFAULT: "#DDE3D6", 2: "#C3CCBD" },
        "on-dark": "#B5C7BA",
        "dark-line": "#2C5A45",
        sky: { DEFAULT: "#2563A8", bg: "#DFEAF7" },
        plum: { DEFAULT: "#6B3FA0", bg: "#EDE4F7" },
        grey: {
          0: "#FFFFFF",
          5: "#F9FAFB",
          10: "#F3F4F6",
          20: "#E5E7EB",
          30: "#D1D5DB",
          40: "#9CA3AF",
          50: "#6B7280",
          60: "#4B5563",
          70: "#374151",
          80: "#1F2937",
          90: "#111827",
        },
      },
      boxShadow: {
        // Solid offset shadows of the v2 stickers and toasts; pick the colour
        // with shadow-{color}, e.g. "shadow-sticker shadow-ink".
        sticker: "2px 2px 0 0 var(--tw-shadow-color, #10241B)",
        toast: "4px 4px 0 0 var(--tw-shadow-color, #10241B)",
      },
      borderRadius: {
        none: "0px",
        soft: "2px",
        base: "4px",
        rounded: "8px",
        large: "16px",
        circle: "9999px",
        tag: "6px",
        chip: "7px",
        btn: "12px",
        card: "18px",
        banner: "24px",
      },
      maxWidth: {
        "8xl": "100rem",
      },
      screens: {
        "2xsmall": "320px",
        xsmall: "512px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
      },
      fontSize: {
        "3xl": "2rem",
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        // Headings and the logo.
        display: ["Bricolage Grotesque", "Be Vietnam Pro", "sans-serif"],
        // Prices and order codes.
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        ring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-top": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out-top": {
          "0%": {
            height: "100%",
          },
          "99%": {
            height: "0",
          },
          "100%": {
            visibility: "hidden",
          },
        },
        "accordion-slide-up": {
          "0%": {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          "100%": {
            height: "0",
            opacity: "0",
          },
        },
        "accordion-slide-down": {
          "0%": {
            "min-height": "0",
            "max-height": "0",
            opacity: "0",
          },
          "100%": {
            "min-height": "var(--radix-accordion-content-height)",
            "max-height": "none",
            opacity: "1",
          },
        },
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "fade-in-right":
          "fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in-top": "fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-out-top":
          "fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "accordion-open":
          "accordion-slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "accordion-close":
          "accordion-slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
      },
    },
  },
  plugins: [require("tailwindcss-radix")()],
}
