import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import {
  getAssetCoverageGapReport,
  getRealisticAssetGallery,
  getWorkflowPackGallery,
  getWorkflowPackVisualQaGallery,
  listAssets,
  listWorkflowPacks,
  listWorkflowTemplates,
  searchAssets
} from "../packages/assets/src/index.ts";

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

type CatalogStyleProfile = Parameters<typeof getWorkflowPackGallery>[1]["styleProfile"];

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function styleProfileFromSearchParams(params: URLSearchParams): CatalogStyleProfile | undefined {
  return (params.get("styleProfile") ?? params.get("style") ?? undefined) as CatalogStyleProfile | undefined;
}

function handleCatalogRoute(request: IncomingMessage, response: ServerResponse, url: URL, parts: string[]): boolean {
  if (request.method !== "GET" || parts[0] !== "assets") return false;

  if (parts[1] === "coverage-gap-report") {
    sendJson(response, 200, { report: getAssetCoverageGapReport() });
    return true;
  }

  if (parts[1] === "workflow-packs" && parts[2] && parts[3] === "gallery") {
    sendJson(response, 200, {
      gallery: getWorkflowPackGallery(parts[2], { styleProfile: styleProfileFromSearchParams(url.searchParams) })
    });
    return true;
  }

  if (parts[1] === "workflow-packs" && parts[2] && parts[3] === "visual-qa-gallery") {
    sendJson(response, 200, {
      gallery: getWorkflowPackVisualQaGallery(parts[2], {
        styleProfile: styleProfileFromSearchParams(url.searchParams),
        limit: url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined
      })
    });
    return true;
  }

  if (parts[1] === "workflow-packs") {
    sendJson(response, 200, { workflowPacks: listWorkflowPacks() });
    return true;
  }

  if (parts[1] === "workflow-templates") {
    sendJson(response, 200, {
      templates: listWorkflowTemplates({ workflowPack: url.searchParams.get("workflowPack") ?? undefined })
    });
    return true;
  }

  if (parts[1] === "realistic" && parts[2] === "gallery") {
    sendJson(response, 200, {
      gallery: getRealisticAssetGallery({
        workflowPack: url.searchParams.get("workflowPack") ?? undefined,
        styleProfile: styleProfileFromSearchParams(url.searchParams),
        limit: url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined
      })
    });
    return true;
  }

  if (parts.length === 1) {
    const results = searchAssets({
      query: url.searchParams.get("query") ?? url.searchParams.get("q") ?? "",
      category: url.searchParams.get("category") ?? undefined,
      role: url.searchParams.get("role") ?? undefined,
      family: url.searchParams.get("family") ?? undefined,
      modality: url.searchParams.get("modality") ?? undefined,
      riskDomain: url.searchParams.get("riskDomain") ?? undefined,
      slideIntent: url.searchParams.get("slideIntent") ?? undefined,
      styleProfile: styleProfileFromSearchParams(url.searchParams),
      workflowPack: url.searchParams.get("workflowPack") ?? undefined,
      qualityTier: url.searchParams.get("qualityTier") ?? undefined,
      panelRole: url.searchParams.get("panelRole") ?? undefined,
      semanticSlot: url.searchParams.get("semanticSlot") ?? undefined,
      assetKind: url.searchParams.get("assetKind") ?? undefined,
      mediaType: url.searchParams.get("mediaType") ?? undefined,
      realismLevel: url.searchParams.get("realismLevel") ?? undefined,
      rightsStatus: url.searchParams.get("rightsStatus") ?? undefined,
      sourceAssetType: url.searchParams.get("sourceAssetType") ?? undefined,
      limit: Number(url.searchParams.get("limit") ?? 200)
    });
    sendJson(response, 200, { assets: results.map((result) => result.asset), results, count: listAssets().length });
    return true;
  }

  return false;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    const parts = pathname.split("/").filter(Boolean);
    if (handleCatalogRoute(request, response, url, parts)) return;

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
