/**
 * The sign-in and sign-up server actions return the error as text
 * ("Error: Unauthorized"). This turns it into a sentence for the form.
 */
export function authErrorMessage(raw: string, registering: boolean): string {
  const text = raw.toLowerCase()
  if (text.includes("already exists") || text.includes("duplicate")) {
    return "Email này đã có tài khoản. Hãy đăng nhập."
  }
  if (text.includes("unauthorized") || text.includes("invalid email or password")) {
    return "Email hoặc mật khẩu chưa đúng."
  }
  return registering ? "Chưa tạo được tài khoản. Bạn thử lại sau nhé." : "Chưa đăng nhập được. Bạn thử lại sau nhé."
}
