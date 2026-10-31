import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");

export default defineConfig({
  resolve: {
    alias: [
      // Mirror the tsconfig "@/*" path alias.
      { find: /^@\//, replacement: `${root}/` },
      // Tests run server code directly. Next ships this marker itself and
      // resolves it to the same empty module for server bundles (it throws in
      // client bundles), so point Vitest at Next's copy.
      { find: /^server-only$/, replacement: `${root}/node_modules/next/dist/compiled/server-only/empty.js` },
    ],
  },
  test: {
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
    environment: "node",
  },
});
