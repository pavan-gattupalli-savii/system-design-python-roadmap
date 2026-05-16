// Hover/focus-triggered prefetch of route chunks. Browsers usually have
// ~200-400ms between mouseenter and click, so by the time the user actually
// navigates, the lazy chunk is already in the cache and the route mounts
// with no Suspense flash.

type RouteId =
  | "overview" | "daily" | "roadmap" | "readings"
  | "interview" | "concepts" | "about" | "me" | "admin"
  | "signin" | "stats" | "contribute";

const prefetchers: Record<RouteId, () => Promise<unknown>> = {
  overview:   () => import("../pages/OverviewPage"),
  daily:      () => import("../pages/DailyTopicPage"),
  roadmap:    () => import("../pages/RoadmapPage"),
  readings:   () => import("../pages/ReadingsPage"),
  interview:  () => import("../pages/InterviewPage"),
  concepts:   () => import("../pages/ConceptsPage"),
  about:      () => import("../pages/AboutPage"),
  me:         () => import("../pages/MyProfile"),
  admin:      () => import("../pages/AdminQueue"),
  signin:     () => import("../pages/SignIn"),
  stats:      () => import("../pages/StatsPage"),
  contribute: () => import("../pages/ContributePage"),
};

const seen = new Set<RouteId>();

export function prefetchRoute(id: RouteId): void {
  if (seen.has(id)) return;
  seen.add(id);
  // Fire-and-forget. Failures don't matter — the real navigation will retry.
  prefetchers[id]?.().catch(() => seen.delete(id));
}
