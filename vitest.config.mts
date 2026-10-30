import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");

export default defineConfig({
  resolve: {
    // Mirror the tsconfig "@/*" path alias.
    alias: [{ find: /^@\//, replacement: `${root}/` }],
  },
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
