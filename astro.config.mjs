import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://warhammer-rss.netlify.app/",
  adapter: netlify(),
  output: "server",
  vite: {
    plugins: [tailwindcss()],
  },
});
