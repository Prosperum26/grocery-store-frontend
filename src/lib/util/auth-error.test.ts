import { describe, expect, it } from "vitest"
import { authErrorMessage } from "./auth-error"

describe("authErrorMessage", () => {
  it("explains a wrong password and a taken email", () => {
    expect(authErrorMessage("Error: Unauthorized", false)).toMatch(/chưa đúng/)
    expect(authErrorMessage("Error: Identity with email already exists", true)).toMatch(/đã có tài khoản/)
  })

  it("falls back to a generic sentence for the mode", () => {
    expect(authErrorMessage("Error: boom", true)).toMatch(/tạo được tài khoản/)
    expect(authErrorMessage("Error: boom", false)).toMatch(/đăng nhập được/)
  })
})
