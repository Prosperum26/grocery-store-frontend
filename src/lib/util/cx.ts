/**
 * Joins class names without merging them. Use this instead of `clx` from
 * @medusajs/ui when a component combines a custom shadow size with a shadow
 * colour (e.g. "shadow-sticker shadow-brand"): clx runs tailwind-merge, which
 * treats both as the same utility and silently drops one.
 */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}
