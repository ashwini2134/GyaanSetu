import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    env: {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/fraylon_lms_test",
    },
  },
});


