import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// GitHub Pages Project Pages serve the app under /<repo-name>/. VITE_APP_BASE_PATH lets the
// CI workflow inject the real repository name at build time without touching this file; local
// dev always uses "/".
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    base: env.VITE_APP_BASE_PATH || "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },
    build: {
      // Desactive en production : les sourcemaps embarquent le texte source complet des
      // dependances (y compris des commentaires JSDoc mentionnant "service_role" dans
      // @supabase/supabase-js, sans rapport avec une vraie fuite de secret) et augmentent
      // inutilement la surface d'inspection du build livre. Reactiver localement si besoin de
      // debugger un build de prod (`vite build --sourcemap`).
      sourcemap: mode !== "production",
      outDir: "dist"
    }
  };
});
