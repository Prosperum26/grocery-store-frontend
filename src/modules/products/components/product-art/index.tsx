import { clx } from "@medusajs/ui"
import Image from "next/image"

import { tintColors } from "@lib/util/tint"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import type { ProductVM } from "types/viewmodels"

type ProductArtProps = {
  product: Pick<ProductVM, "title" | "art" | "tint" | "thumbnail">
  /** Dot pattern on the plate (the design drops it on small thumbnails). */
  dots?: boolean
  /** Illustration size relative to the plate. */
  scale?: number
  /**
   * True when the product name is printed right next to the image, so a
   * screen reader would hear it twice (WCAG: decorative images get alt="").
   */
  decorative?: boolean
  className?: string
  sizes?: string
  /** Overrides the tint plate colour, e.g. white circles on a dark banner. */
  plateColor?: string
  /**
   * How a photo fills the box. "cover" crops it to fill (banners, thumbnails
   * in rows); "contain" shows the whole pack on white, which product cards
   * need: retail photos are packshots and cropping cuts the label off.
   */
  fit?: "cover" | "contain"
}

/**
 * Product image of the v2 design: a real photo when the product has one,
 * otherwise its vector illustration on a tinted plate. Fills its parent, so
 * the parent sets size, aspect ratio and corner radius.
 */
export default function ProductArt({
  product,
  dots = true,
  scale = 0.68,
  decorative = false,
  className,
  sizes = "(max-width: 1024px) 50vw, 300px",
  plateColor,
  fit = "cover",
}: ProductArtProps) {
  const alt = decorative ? "" : product.title
  const { plate, dot } = tintColors(product.tint)

  if (product.thumbnail) {
    return (
      <div className={clx("relative h-full w-full overflow-hidden", fit === "contain" && "bg-white", className)}>
        <Image
          src={product.thumbnail}
          alt={alt}
          fill
          sizes={sizes}
          className={fit === "contain" ? "object-contain p-2" : "object-cover"}
        />
      </div>
    )
  }

  // Two staggered dot layers reproduce dotsBg() of the design (14px grid).
  const dotLayer = `radial-gradient(${dot} 1.2px, transparent 1.6px)`

  return (
    <div
      className={clx(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className
      )}
      style={{
        backgroundColor: plateColor ?? plate,
        backgroundImage: dots ? `${dotLayer}, ${dotLayer}` : undefined,
        backgroundSize: dots ? "14px 28px, 14px 28px" : undefined,
        backgroundPosition: dots ? "0 0, 7px 14px" : undefined,
      }}
    >
      {product.art ? (
        <div
          className="relative"
          style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
        >
          {/* SVGs are local and tiny, so skip the image optimizer. */}
          <Image
            src={`/art/${product.art}.svg`}
            alt={alt}
            fill
            unoptimized
            className="object-contain"
          />
        </div>
      ) : (
        <PlaceholderImage size={24} />
      )}
    </div>
  )
}
