/**
 * Production server — serves the static Expo web export from dist/
 * as a single-page application. All unknown paths fall back to index.html
 * so that client-side routing (expo-router) works correctly.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

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

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { "content-type": contentType });
  res.end(content);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  let pathname = url.pathname;

  // Strip base path prefix
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  // Health check
  if (pathname === "/status" || pathname === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }

  // Try exact file match
  const candidate = path.join(DIST_ROOT, pathname);
  const safe = path.resolve(candidate);

  if (!safe.startsWith(DIST_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const stat = fs.statSync(safe);
    if (stat.isFile()) {
      serveFile(safe, res);
      return;
    }
    // Directory — try index.html inside it
    const indexInDir = path.join(safe, "index.html");
    if (fs.existsSync(indexInDir)) {
      serveFile(indexInDir, res);
      return;
    }
  } catch {
    // File not found — fall through to SPA fallback
  }

  // SPA fallback — serve root index.html for all unmatched routes
  const indexPath = path.join(DIST_ROOT, "index.html");
  if (fs.existsSync(indexPath)) {
    serveFile(indexPath, res);
  } else {
    res.writeHead(503, { "content-type": "text/plain" });
    res.end("App not built yet. Run: pnpm --filter @workspace/mobile run build");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Serving web app on port ${port}`);
  console.log(`Static files: ${DIST_ROOT}`);
});
