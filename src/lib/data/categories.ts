import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { MOCK_CATEGORIES } from "@lib/mock/categories"
import { isMockMode } from "@lib/mock/mode"
import { getCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, any>) => {
  if (isMockMode()) return MOCK_CATEGORIES

  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  // Same contract as the Store API branch: undefined when no handle matches.
  if (isMockMode()) {
    return MOCK_CATEGORIES.find(
      (c) => c.handle === handle
    ) as HttpTypes.StoreProductCategory
  }

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
