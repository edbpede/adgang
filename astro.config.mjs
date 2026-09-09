import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://portaler.edb.fi",
  output: "static",
  // presetWind4 supplies its own reset (uno.config.ts), so we do not inject one here.
  integrations: [UnoCSS(), svelte()],
  build: {
    assets: "assets",
    inlineStylesheets: "auto",
    // format:"file" emits /grade/0.html etc. Bare anchors (/grade/0, /other,
    // /fag/dansk) resolve on GitHub Pages (custom domain). Keep this paired with
    // the default no-trailing-slash anchors — changing one breaks live URLs.
    format: "file",
  },
});
