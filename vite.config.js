import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // "prompt" statt "autoUpdate": ein neuer Service Worker übernimmt erst beim
      // nächsten Kaltstart. Verhindert einen Reload mitten in der Score-Eingabe.
      registerType: "prompt",
      injectRegister: "script-defer",
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,webp,mp3,webmanifest}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
