/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";
import app from "./app.config.json";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [
    { name: "app-meta", transformIndexHtml: (html: string) => html.replace(/%APP_NAME%/g, app.name).replace(/%APP_DESC%/g, app.description) },
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: app.name, short_name: app.shortName, description: app.description,
        theme_color: "#17212E", background_color: "#F7F9FB", display: "standalone", start_url: "./", scope: "./",
        icons: [{ src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }]
      },
      workbox: { globPatterns: ["**/*.{js,css,html,svg,json,woff2}"], navigateFallback: "index.html" }
    })
  ],
  test: { environment: "node", include: ["src/**/*.test.ts"] }
});
