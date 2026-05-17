// ── SEO meta hook ────────────────────────────────────────────────────────────
// Sets per-route <title>, <meta name=description>, canonical link, and OG/Twitter
// title+description tags. Googlebot renders the SPA and picks up these mutations
// for indexing — other crawlers see the static head from index.html plus whatever
// the prerender step (scripts/prerender.mjs) captured at build time.

import { useEffect } from "react";

const SITE_NAME = "System Design Mastery Roadmap";
const SITE_BASE = "https://pavan-gattupalli-savii.github.io/system-design-python-roadmap";
const DEFAULT_DESC =
  "9-Month System Design Mastery Roadmap for working engineers — curated readings, real interview Q&A, and shared experiences. Python and Java tracks.";
const BASE_PATH = "/system-design-python-roadmap";

export interface SeoMeta {
  /** Page title; site name is appended automatically. Omit on the home page. */
  title?: string;
  description?: string;
  /** Path-only (e.g. "/app/about"). Defaults to the current pathname. */
  canonical?: string;
  /** Absolute URL to a 1200×630 PNG. Defaults to the site-wide og.png. */
  ogImage?: string;
}

function upsertMeta(selector: string, attr: "name" | "property", value: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSeoMeta({ title, description, canonical, ogImage }: SeoMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    const desc = description || DEFAULT_DESC;

    upsertMeta('meta[name="description"]', "name", "description", desc);
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", desc);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", desc);

    // Strip the GH Pages base path from the live URL when building the canonical.
    const livePath =
      window.location.pathname.replace(new RegExp("^" + BASE_PATH), "") || "/";
    const canonicalPath = canonical || livePath;
    const canonicalUrl = SITE_BASE + canonicalPath;
    upsertLink("canonical", canonicalUrl);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);

    if (ogImage) {
      upsertMeta('meta[property="og:image"]', "property", "og:image", ogImage);
      upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);
    }
  }, [title, description, canonical, ogImage]);
}
