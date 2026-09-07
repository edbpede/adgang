// Foreground static server for CI: Astro 7 preview starts a persistent daemon.
// Match GitHub Pages' extensionless HTML and directory-index routes.
import { join, normalize } from "node:path";

const root = join(import.meta.dir, "..", "dist");
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: Number(process.env.PORT ?? 4321),
  async fetch(request) {
    const path = normalize(new URL(request.url).pathname);
    for (const candidate of [
      join(root, path),
      join(root, `${path}.html`),
      join(root, path, "index.html"),
    ]) {
      if (!candidate.startsWith(`${root}/`)) continue;
      const file = Bun.file(candidate);
      if (await file.exists()) {
        if ((await file.stat()).isFile()) return new Response(file);
      }
    }
    return new Response("Not found", { status: 404 });
  },
});
console.log(`Serving production build on http://127.0.0.1:${server.port}`);
