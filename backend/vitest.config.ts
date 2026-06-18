import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    env: {
      DATABASE_URL: "postgresql://nishithakrishna@localhost:5432/fraylon_lms_test",
    },
  },
});
