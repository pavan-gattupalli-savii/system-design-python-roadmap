// ── Prerender (build-time) ───────────────────────────────────────────────────
// After `vite build`, this script:
//   1. Starts `vite preview` on a local port
//   2. Visits each route in headless Chrome with --dump-dom
//   3. Saves the rendered HTML to dist/<route>/index.html (and dist/index.html)
//
// This gives crawlers that don't run JS (Bing, LinkedIn, Slack, Discord, X)
// real HTML for the most SEO-relevant pages, while preserving the existing
// SPA hydration for everything else.
//
// Auth-gated and high-dynamism routes are skipped on purpose — they redirect
// or fetch from the API and don't render anything useful in a clean browser.

import { spawn } from "node:child_process";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "..");
const DIST      = path.join(ROOT, "dist");
const BASE_PATH = "/system-design-python-roadmap";
const PORT      = 4317;
const CHROME    = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const execAsync = promisify(exec);

const ROUTES = [
  "/",
  "/app/overview",
  "/app/daily",
  "/app/roadmap?lang=python",
  "/app/roadmap?lang=java",
  "/app/readings",
  "/app/interview",
  "/app/concepts",
  "/app/about",
  "/app/contribute",
  "/sign-in",
];

if (!fs.existsSync(CHROME)) {
  console.error(`! Chrome not found at ${CHROME} — skipping prerender.`);
  process.exit(0);
}
if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("! dist/ missing — did you run vite build?");
  process.exit(1);
}

async function waitForReady(child, timeoutMs) {
  return new Promise((resolve, reject) => {
    let buf = "";
    const onData = (chunk) => {
      buf += chunk.toString();
      if (/Local:\s+http/.test(buf)) {
        child.stdout.off("data", onData);
        resolve();
      }
    };
    child.stdout.on("data", onData);
    setTimeout(() => reject(new Error("preview server did not become ready in " + timeoutMs + "ms")), timeoutMs);
  });
}

function outDirForRoute(route) {
  const pathOnly = route.split("?")[0];
  if (pathOnly === "/" || pathOnly === "") return DIST;
  return path.join(DIST, pathOnly.replace(/^\//, ""));
}

async function renderRoute(route) {
  const url = `http://localhost:${PORT}${BASE_PATH}${route === "/" ? "/" : route}`;
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--virtual-time-budget=6000",
    "--run-all-compositor-stages-before-draw",
    "--dump-dom",
    url,
  ];
  const { stdout } = await execAsync(
    `"${CHROME}" ${args.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" ")}`,
    { maxBuffer: 20 * 1024 * 1024 },
  );

  if (!stdout || stdout.length < 500) {
    throw new Error(`empty render for ${route}`);
  }

  const dir = outDirForRoute(route);
  await fsp.mkdir(dir, { recursive: true });
  const outFile = path.join(dir, "index.html");
  await fsp.writeFile(outFile, stdout);
  return path.relative(ROOT, outFile);
}

async function main() {
  console.log(`→ Starting vite preview on :${PORT}`);
  const preview = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  preview.stderr.on("data", (chunk) => process.stderr.write(`[preview] ${chunk}`));

  try {
    await waitForReady(preview, 15000);
    console.log("✓ preview ready");

    for (const route of ROUTES) {
      try {
        const out = await renderRoute(route);
        console.log(`✓ ${route} → ${out}`);
      } catch (err) {
        console.error(`✗ ${route} — ${err.message}`);
      }
    }
  } finally {
    preview.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
