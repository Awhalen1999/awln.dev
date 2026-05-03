// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import preact from "@astrojs/preact";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  adapter: cloudflare({
    imageService: "passthrough",
  }),
  integrations: [icon(), preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
