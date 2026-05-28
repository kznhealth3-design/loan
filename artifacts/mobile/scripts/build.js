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

// Fonts to preload + register via @font-face at HTML parse time.
// This makes icon fonts available before the JS bundle even loads.
const FONTS_TO_PRELOAD = ["Feather"];

function findFontFiles() {
  const found = []; // { fontFamily, url }
  if (!fs.existsSync(distDir)) return found;

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".ttf")) {
        const base = entry.name.split(".")[0];
        if (FONTS_TO_PRELOAD.includes(base)) {
          const url = "/" + path.relative(distDir, full).split(path.sep).join("/");
          found.push({ fontFamily: base, url });
        }
      }
    }
  };
  walk(distDir);
  return found;
}

function injectFontPreloads() {
  const fonts = findFontFiles();
  if (fonts.length === 0) {
    console.log("No icon fonts found to preload");
    return;
  }

  const preloadTags = fonts
    .map((f) => `<link rel="preload" href="${f.url}" as="font" type="font/ttf" crossorigin="anonymous"/>`)
    .join("");

  // Register @font-face so the browser loads & maps the font during HTML parse.
  // font-display: block means the browser waits briefly for the font, avoiding
  // flash of missing icons. The font is small (~56KB) so this is safe.
  const faceCss = fonts
    .map(
      (f) =>
        `@font-face{font-family:"${f.fontFamily}";src:url("${f.url}") format("truetype");font-weight:normal;font-style:normal;font-display:block;}`,
    )
    .join("");

  const injection = `<meta data-preload-fonts="1"/>${preloadTags}<style data-font-faces="1">${faceCss}</style>`;

  let htmlCount = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".html")) {
        let html = fs.readFileSync(full, "utf-8");
        if (!html.includes("</head>") || html.includes("data-preload-fonts")) continue;
        html = html.replace("</head>", `${injection}</head>`);
        fs.writeFileSync(full, html);
        htmlCount++;
      }
    }
  };
  walk(distDir);

  console.log(`Injected ${fonts.length} font preload(s) + @font-face into ${htmlCount} HTML page(s)`);
  fonts.forEach((f) => console.log(`  preload + register: ${f.fontFamily}`));
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
    injectFontPreloads();
    console.log("Build done.");
    process.exit(0);
  } catch (err) {
    console.error("Build failed:", err.message);
    process.exit(1);
  }
})();
