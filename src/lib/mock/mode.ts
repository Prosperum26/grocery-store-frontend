/**
 * Mock mode (issue #11): the storefront renders the v2 design with fake data
 * and never calls the Medusa backend. It is on unless NEXT_PUBLIC_UI_MOCK is
 * "false"; switch it off once the backend has the grocery catalog (backend
 * plan BE-1..BE-3).
 */
export const isMockMode = () => process.env.NEXT_PUBLIC_UI_MOCK !== "false"

export const MOCK_COUNTRY_CODE = "vn"
