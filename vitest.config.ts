import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig({ mode: "test", command: "serve" }),
  defineConfig({
    test: {
      environment: "jsdom",
      globals: false,
      setupFiles: ["./tests/setup.ts"],
      include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx", "src/**/*.test.ts"],
      css: false,
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        exclude: ["supabase/functions/**", "tests/e2e/**", "**/*.config.*"]
      }
    }
  })
);
