import { defineConfig } from "vitest/config"
import path from "path"

// Unit tests for pure helpers only (src/**/*.test.ts). The Starter has no
// component test setup; UI is verified with `yarn build` and in the browser.
export default defineConfig({
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "src/lib"),
      "@modules": path.resolve(__dirname, "src/modules"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
})
