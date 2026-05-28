/**
 * Production server — serves the static Expo web export from dist/
 * as a single-page application. All unknown paths fall back to index.html
 * so that client-side routing (expo-router) works correctly.
 *
 * Performance features:
 * - Pre-loads & gzips all static assets into memory at startup (cold reads are slow on Replit).
 * - Sends Content-Encoding: gzip when the client supports it.
 * - Long cache for content-hashed assets in /_expo/static/*; no-cache for index.html.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const DIST_ROOT = path.resolve(__dirname, "..", "dist");
const basePath = (process.env.BASE_PATH || "/").replace(/\/+$/, "");
const port = parseInt(process.env.PORT || "3000", 10);

const MIME = {
  ".html":  "text/html; charset=utf-8",
  ".js":    "application/javascript; charset=utf-8",
  ".mjs":   "application/javascript; charset=utf-8",
  ".json":  "application/json; charset=utf-8",
  ".css":   "text/css; charset=utf-8",
  ".png":   "image/png",
  ".jpg":   "image/jpeg",
  ".jpeg":  "image/jpeg",
  ".gif":   "image/gif",
  ".svg":   "image/svg+xml",
  ".ico":   "image/x-icon",
  ".woff":  "font/woff",
  ".woff2": "font/woff2",
  ".ttf":   "font/ttf",
  ".otf":   "font/otf",
  ".map":   "application/json",
  ".webp":  "image/webp",
};

// Mime types worth compressing
const COMPRESSIBLE = new Set([
  ".html", ".js", ".mjs", ".json", ".css", ".svg", ".map", ".ttf", ".otf",
]);

const cache = new Map(); // path → { buffer, gzipped, contentType, ext }

function loadDist() {
  if (!fs.existsSync(DIST_ROOT)) {
    console.warn(`dist/ not found at ${DIST_ROOT} — app not built`);
    return;
  }
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const rel = "/" + path.relative(DIST_ROOT, full).split(path.sep).join("/");
        const ext = path.extname(full).toLowerCase();
        const buffer = fs.readFileSync(full);
        const entryData = {
          buffer,
          gzipped: COMPRESSIBLE.has(ext) ? zlib.gzipSync(buffer, { level: 9 }) : null,
          contentType: MIME[ext] || "application/octet-stream",
          ext,
        };
        cache.set(rel, entryData);
      }
    }
  };
  walk(DIST_ROOT);
  console.log(`Preloaded ${cache.size} files from dist/`);
}

function pickCacheControl(urlPath) {
  if (urlPath === "/" || urlPath.endsWith("/index.html") || urlPath === "/index.html") {
    return "no-cache, must-revalidate";
  }
  // Content-hashed assets from Expo are immutable
  if (urlPath.startsWith("/_expo/static/") || urlPath.startsWith("/assets/")) {
    return "public, max-age=31536000, immutable";
  }
  return "public, max-age=3600";
}

function send(req, res, urlPath, entry) {
  const acceptsGzip = (req.headers["accept-encoding"] || "").includes("gzip");
  const headers = {
    "content-type": entry.contentType,
    "cache-control": pickCacheControl(urlPath),
    "x-content-type-options": "nosniff",
  };

  if (entry.gzipped && acceptsGzip) {
    headers["content-encoding"] = "gzip";
    headers["content-length"] = entry.gzipped.length;
    headers["vary"] = "Accept-Encoding";
    res.writeHead(200, headers);
    res.end(entry.gzipped);
  } else {
    headers["content-length"] = entry.buffer.length;
    res.writeHead(200, headers);
    res.end(entry.buffer);
  }
}

loadDist();

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  let pathname = url.pathname;

  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  if (pathname === "/status" || pathname === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }

  // Exact match
  let entry = cache.get(pathname);

  // Static rendering: try /path.html for clean URLs like /register
  if (!entry && !pathname.includes(".") && pathname !== "/") {
    const trimmed = pathname.replace(/\/$/, "");
    entry = cache.get(trimmed + ".html");
  }

  // Directory → try /index.html inside
  if (!entry) {
    const dirIndex = pathname.endsWith("/") ? pathname + "index.html" : pathname + "/index.html";
    entry = cache.get(dirIndex);
  }

  // SPA fallback → root index.html
  if (!entry) {
    entry = cache.get("/index.html");
  }

  if (!entry) {
    res.writeHead(503, { "content-type": "text/plain" });
    res.end("App not built yet. Run: pnpm --filter @workspace/mobile run build");
    return;
  }

  send(req, res, pathname, entry);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Serving web app on port ${port}`);
  console.log(`Static files: ${DIST_ROOT}`);
});
