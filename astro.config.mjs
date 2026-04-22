// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import preact from "@astrojs/preact";

export default defineConfig({
  integrations: [icon(), preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
