import { HttpTypes } from "@medusajs/types"
import { MOCK_COUNTRY_CODE } from "./mode"

// One region, as the backend will have after BE-1: Việt Nam, VND.
export const MOCK_REGION = {
  id: "reg_mock_vn",
  name: "Việt Nam",
  currency_code: "vnd",
  automatic_taxes: false,
  countries: [
    {
      id: "country_mock_vn",
      iso_2: MOCK_COUNTRY_CODE,
      iso_3: "vnm",
      name: "VIET NAM",
      display_name: "Việt Nam",
    },
  ],
} as unknown as HttpTypes.StoreRegion
