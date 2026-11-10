import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"

import { getRecipe } from "@lib/data/kitchen"
import { isMockMode } from "@lib/mock/mode"
import Button from "@modules/common/components/button"
import { FailureNote } from "@modules/kitchen/failure"
import RecipeView from "@modules/kitchen/recipe-view"

type Props = {
  params: Promise<{ recipeId: string }>
  searchParams: Promise<{ nguoi?: string | string[]; q?: string | string[] }>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

/** ?nguoi=6 -> 6; anything that is not a whole number from 1 to 50 -> the recipe's own servings. */
const servingsOf = (value: string | undefined) => {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 && n <= 50 ? n : undefined
}

// generateMetadata and the page ask for the same recipe: cache() makes it one backend call per request.
const loadRecipe = cache((recipeId: string, servings: number | undefined) => getRecipe(recipeId, servings))

async function read(props: Props) {
  const [{ recipeId }, search] = await Promise.all([props.params, props.searchParams])
  const result = await loadRecipe(decodeURIComponent(recipeId), servingsOf(first(search.nguoi)))
  return { result, backQuery: first(search.q)?.trim().slice(0, 300) ?? "" }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  if (isMockMode()) {
    return { title: "Trợ lý Bếp · Com4Fud" }
  }
  const { result } = await read(props)
  return { title: `${result.ok ? result.data.recipe.name : "Trợ lý Bếp"} · Com4Fud` }
}

// One recipe of Trợ lý Bếp, with its own address: reload, Back and shared links all work.
export default async function RecipePage(props: Props) {
  if (isMockMode()) {
    notFound()
  }
  const { result, backQuery } = await read(props)
  if (!result.ok) {
    if (result.reason === "not_found") {
      notFound()
    }
    return (
      <div className="content-container flex flex-col items-start gap-4 py-10 small:py-16">
        <FailureNote reason={result.reason} />
        <Button href="/tro-ly-bep" variant="secondary">
          Về Trợ lý Bếp
        </Button>
      </div>
    )
  }
  // key: a different recipe or number of people starts from that server data, not from the old state.
  return <RecipeView key={`${result.data.recipe.id}:${result.data.servings}`} initial={result.data} backQuery={backQuery} />
}
