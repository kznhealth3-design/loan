/**
 * Production build script — exports the Expo app as a static web bundle.
 * Output goes to artifacts/mobile/dist/
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

// Clean previous build
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
  if (code === 0) {
    console.log("Web export complete → dist/");
  } else {
    console.error(`Build failed with exit code ${code}`);
  }
  process.exit(code ?? 1);
});
