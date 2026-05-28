/**
 * Production build script — exports the Expo app as a static web bundle,
 * then injects <link rel="preload"> tags for icon fonts into every HTML
 * page so the browser fetches them in parallel with the JS bundle.
 * Output goes to artifacts/mobile/dist/
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

// Fonts we actually use in the app — only preload these to keep bytes minimal
const FONTS_TO_PRELOAD = ["Feather"];

function findFontUrls() {
  const found = [];
  if (!fs.existsSync(distDir)) return found;

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".ttf")) {
        const base = entry.name.split(".")[0];
        if (FONTS_TO_PRELOAD.includes(base)) {
          const rel = "/" + path.relative(distDir, full).split(path.sep).join("/");
          found.push(rel);
        }
      }
    }
  };
  walk(distDir);
  return found;
}

function injectPreloads() {
  const urls = findFontUrls();
  if (urls.length === 0) {
    console.log("No icon fonts found to preload");
    return;
  }

  const preloadTags = urls
    .map((u) => `<link rel="preload" href="${u}" as="font" type="font/ttf" crossorigin="anonymous"/>`)
    .join("");

  let htmlCount = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".html")) {
        let html = fs.readFileSync(full, "utf-8");
        if (!html.includes("</head>") || html.includes("data-preload-fonts")) continue;
        html = html.replace("</head>", `<meta data-preload-fonts="1"/>${preloadTags}</head>`);
        fs.writeFileSync(full, html);
        htmlCount++;
      }
    }
  };
  walk(distDir);

  console.log(`Injected ${urls.length} font preload(s) into ${htmlCount} HTML page(s)`);
  urls.forEach((u) => console.log("  preload:", u));
}

function exportWeb() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
      console.log("Cleaned previous dist/");
    }

    console.log("Building Expo web export...");

    const child = spawn(
      "pnpm",
      ["exec", "expo", "export", "--platform", "web", "--output-dir", "dist"],
      {
        stdio: "inherit",
        cwd: projectRoot,
        env: {
          ...process.env,
          NODE_ENV: "production",
          CI: "1",
        },
      }
    );

    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`expo export exited with code ${code}`));
    });
  });
}

(async () => {
  try {
    await exportWeb();
    console.log("Web export complete → dist/");
    injectPreloads();
    console.log("Build done.");
    process.exit(0);
  } catch (err) {
    console.error("Build failed:", err.message);
    process.exit(1);
  }
})();
