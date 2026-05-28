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

// ─────────────────────────────────────────────────────────────────────────────
// SEO — per-route metadata, robots.txt, sitemap.xml
// ─────────────────────────────────────────────────────────────────────────────

const SITE_NAME = "LoanGo";
const SITE_DESC =
  "LoanGo is a fast, secure personal loan app. Apply for loans, track EMIs, manage payments and unlock exclusive offers — all in one place.";
const SITE_KEYWORDS =
  "loan app, personal loan, EMI calculator, instant loan, home loan, car loan, education loan, business loan, LoanGo";

// Path → { title, description }
const ROUTE_META = {
  "/index.html":            { title: "LoanGo — Personal Loans, EMI Tracking & Offers", desc: SITE_DESC },
  "/onboarding.html":       { title: "Welcome to LoanGo — Get Started in Minutes",      desc: "Discover LoanGo. Apply for personal, home, car or business loans with a few taps. Quick approval, transparent rates, and 24/7 support." },
  "/register.html":         { title: "Create Your LoanGo Account",                       desc: "Sign up for LoanGo in two simple steps. Provide your details, verify your identity, and unlock instant loan access." },
  "/my-loans.html":         { title: "My Loans — LoanGo",                                desc: "Track every active loan, view repayment schedules, and stay on top of your borrowing — all in one dashboard." },
  "/emi-payments.html":     { title: "EMI Payments — LoanGo",                            desc: "View, schedule, and pay your monthly EMIs on time. Avoid late fees with smart payment reminders." },
  "/offers.html":           { title: "Personalised Loan Offers — LoanGo",                desc: "Browse exclusive personal, home, car, education and business loan offers tailored to your profile." },
  "/more.html":             { title: "Settings & More — LoanGo",                         desc: "Manage your profile, KYC, security settings, calculators, and support — all in one place." },
  "/all-offers.html":       { title: "All Loan Offers — LoanGo",                         desc: "Explore the full catalog of LoanGo loan offers with low interest rates and flexible tenures." },
  "/apply-loan.html":       { title: "Apply for a Loan — LoanGo",                        desc: "Apply for a personal, home, car, education or business loan in minutes. Fast approval, transparent process." },
  "/loan-detail.html":      { title: "Loan Details — LoanGo",                            desc: "See full details of your loan including EMI schedule, interest, principal, and remaining tenure." },
  "/kyc-info.html":         { title: "KYC Verification — LoanGo",                        desc: "Complete your KYC quickly and securely to unlock the full power of LoanGo." },
};

// Map of which files belong to which sitemap URL paths
const SITEMAP_ROUTES = [
  "/", "/onboarding", "/register", "/my-loans", "/emi-payments",
  "/offers", "/more", "/all-offers", "/apply-loan", "/loan-detail", "/kyc-info",
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function injectSeo() {
  let pageCount = 0;

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".html")) {
        const rel = "/" + path.relative(distDir, full).split(path.sep).join("/");
        // Skip group-router & sitemap-helper pages
        if (rel.includes("(tabs)") || rel.includes("_sitemap") || rel.includes("+not-found")) continue;

        const meta = ROUTE_META[rel] || { title: `${SITE_NAME}`, desc: SITE_DESC };
        let html = fs.readFileSync(full, "utf-8");

        if (html.includes("data-seo-injected")) continue;

        const title = escapeHtml(meta.title);
        const desc  = escapeHtml(meta.desc);

        const tags = [
          `<meta name="description" content="${desc}"/>`,
          `<meta name="keywords" content="${escapeHtml(SITE_KEYWORDS)}"/>`,
          `<meta name="author" content="${SITE_NAME}"/>`,
          `<meta name="robots" content="index, follow"/>`,
          `<meta name="theme-color" content="#4F46E5"/>`,
          `<meta name="application-name" content="${SITE_NAME}"/>`,
          `<meta name="apple-mobile-web-app-title" content="${SITE_NAME}"/>`,
          `<meta name="apple-mobile-web-app-capable" content="yes"/>`,
          `<meta name="format-detection" content="telephone=no"/>`,
          // Open Graph
          `<meta property="og:type" content="website"/>`,
          `<meta property="og:site_name" content="${SITE_NAME}"/>`,
          `<meta property="og:title" content="${title}"/>`,
          `<meta property="og:description" content="${desc}"/>`,
          `<meta property="og:image" content="/favicon.ico"/>`,
          // Twitter
          `<meta name="twitter:card" content="summary"/>`,
          `<meta name="twitter:title" content="${title}"/>`,
          `<meta name="twitter:description" content="${desc}"/>`,
          `<meta data-seo-injected="1"/>`,
        ].join("");

        // Replace empty title
        html = html.replace(/<title[^>]*>\s*<\/title>/, `<title>${title}</title>`);
        // If no <title> exists at all, add one
        if (!/<title[^>]*>/.test(html)) {
          html = html.replace("</head>", `<title>${title}</title></head>`);
        }
        // Inject meta tags right before </head>
        html = html.replace("</head>", `${tags}</head>`);

        // Set lang attribute properly
        html = html.replace(/<html\s+lang="en"\s*>/, '<html lang="en">');

        fs.writeFileSync(full, html);
        pageCount++;
      }
    }
  };
  walk(distDir);

  console.log(`Injected SEO meta into ${pageCount} HTML page(s)`);
}

function writeRobotsAndSitemap() {
  const robots = [
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: /sitemap.xml",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(distDir, "robots.txt"), robots);

  const today = new Date().toISOString().split("T")[0];
  const urls = SITEMAP_ROUTES.map(
    (route) => `  <url>
    <loc>${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === "/" ? "1.0" : "0.8"}</priority>
  </url>`,
  ).join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
  console.log(`Wrote robots.txt + sitemap.xml (${SITEMAP_ROUTES.length} URLs)`);
}

(async () => {
  try {
    await exportWeb();
    console.log("Web export complete → dist/");
    injectFontPreloads();
    injectSeo();
    writeRobotsAndSitemap();
    console.log("Build done.");
    process.exit(0);
  } catch (err) {
    console.error("Build failed:", err.message);
    process.exit(1);
  }
})();
