import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";

const root = resolve(process.argv[2] ?? "apps/web");
const port = Number(process.argv[3] ?? 4173);
const workspaceRoot = resolve(root, "../..");
const sharedRoutes: Record<string, string> = {
  "/__shared/assets/renderer.js": resolve(workspaceRoot, "packages/assets/src/renderer.js")
};

const mimeTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    const sharedFile = sharedRoutes[pathname];
    const candidate = sharedFile ?? resolve(join(root, pathname === "/" ? "index.html" : pathname));
    if (!sharedFile && !(candidate === root || candidate.startsWith(root + sep))) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    const fileStat = await stat(candidate);
    const filePath = fileStat.isDirectory() ? join(candidate, "index.html") : candidate;
    response.writeHead(200, {
      "content-type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
      "cache-control": "no-store"
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Scientific Image web editor listening on http://127.0.0.1:${port}`);
});
