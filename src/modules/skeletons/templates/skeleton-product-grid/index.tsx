import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

/** Loading grid. One status line for screen readers; the blocks are hidden. */
const SkeletonProductGrid = ({
  numberOfProducts = 9,
}: {
  numberOfProducts?: number
}) => {
  return (
    <div aria-busy="true" className="flex-1">
      <p role="status" className="sr-only">
        Đang tải sản phẩm…
      </p>
      <ul
        aria-hidden="true"
        className="grid grid-cols-2 gap-3 small:grid-cols-3 small:gap-5"
        data-testid="products-list-loader"
      >
        {repeat(numberOfProducts).map((index) => (
          <li key={index}>
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonProductGrid
