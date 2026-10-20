import LoginTemplate from "@modules/account/templates/login-template"

// Signed-out visitors who open a sub-route such as /account/orders get the
// login form instead of an empty slot (the @login slot has no sub-routes).
export default function LoginDefault() {
  return <LoginTemplate />
}
