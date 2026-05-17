// ── Sitemap generator (build-time) ───────────────────────────────────────────
// Writes public/sitemap.xml from a static route table + per-language phase pages
// + resource-type subpages. Run automatically via `prebuild` so the deployed
// dist/ always has a fresh sitemap.
//
// Dynamic resources (per-reading, per-interview, per-concept slug) live in the
// DB and can't be enumerated at build — they're SPA-rendered and rely on
// Googlebot's JS rendering instead.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "..");
const BASE_URL  = "https://pavan-gattupalli-savii.github.io/system-design-python-roadmap";
const TODAY     = new Date().toISOString().slice(0, 10);

const STATIC_ROUTES = [
  { path: "/",                  priority: 1.0, changefreq: "weekly"  },
  { path: "/app/overview",      priority: 0.7, changefreq: "weekly"  },
  { path: "/app/daily",         priority: 0.9, changefreq: "daily"   },
  { path: "/app/roadmap?lang=python", priority: 0.95, changefreq: "weekly" },
  { path: "/app/roadmap?lang=java",   priority: 0.95, changefreq: "weekly" },
  { path: "/app/readings",      priority: 0.9, changefreq: "daily"   },
  { path: "/app/interview",     priority: 0.9, changefreq: "daily"   },
  { path: "/app/concepts",      priority: 0.8, changefreq: "weekly"  },
  { path: "/app/about",         priority: 0.5, changefreq: "monthly" },
  { path: "/app/contribute",    priority: 0.4, changefreq: "monthly" },
  { path: "/sign-in",           priority: 0.2, changefreq: "monthly" },
];

const PHASES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const LANGS  = ["python", "java"];

const RESOURCE_TYPES = ["Book", "Article", "YouTube", "Docs", "Paper", "Course", "Build", "Lab"];

const routes = [...STATIC_ROUTES];

for (const lang of LANGS) {
  for (const p of PHASES) {
    routes.push({
      path: `/app/roadmap/phase/${p}?lang=${lang}`,
      priority: 0.8,
      changefreq: "weekly",
    });
  }
}

for (const type of RESOURCE_TYPES) {
  routes.push({
    path: `/app/resources/${type}`,
    priority: 0.6,
    changefreq: "weekly",
  });
}

function xmlEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const body = routes
  .map(
    (r) => `  <url>
    <loc>${xmlEscape(BASE_URL + r.path)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(2)}</priority>
  </url>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const outPath = path.join(ROOT, "public", "sitemap.xml");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, xml);
console.log(`✓ Wrote ${routes.length} URLs to ${path.relative(ROOT, outPath)}`);
