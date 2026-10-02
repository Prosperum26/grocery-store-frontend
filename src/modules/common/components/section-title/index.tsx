import { clx } from "@medusajs/ui"

// Montra's section heading: title with an orange gradient underline.
const SectionTitle = ({
  title,
  className,
}: {
  title: string
  className?: string
}) => {
  return (
    <h2
      className={clx(
        "relative text-2xl font-semibold text-headingColor before:absolute before:-bottom-2 before:left-0 before:h-1 before:w-32 before:rounded before:bg-gradient-to-tr before:from-orange-400 before:to-orange-600 before:content-['']",
        className
      )}
    >
      {title}
    </h2>
  )
}

export default SectionTitle
