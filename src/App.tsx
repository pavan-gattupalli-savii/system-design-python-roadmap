// ── App router ────────────────────────────────────────────────────────────────
// Stitches together the public Home page, the in-house sign-in flow, and the
// authenticated /app/* shell driven by Layout.tsx.

import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import "./App.css";
import Layout from "./components/Layout";
import { RequireAuth, RequireAdmin } from "./components/RequireAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";

const Home             = lazy(() => import("./pages/Home"));
const SignIn           = lazy(() => import("./pages/SignIn"));
const OverviewPage     = lazy(() => import("./pages/OverviewPage"));
const RoadmapPage      = lazy(() => import("./pages/RoadmapPage"));
const ReadingsPage     = lazy(() => import("./pages/ReadingsPage"));
const InterviewPage    = lazy(() => import("./pages/InterviewPage"));
const AboutPage        = lazy(() => import("./pages/AboutPage"));
const SubmitReading    = lazy(() => import("./pages/SubmitReading"));
const SubmitInterview  = lazy(() => import("./pages/SubmitInterview"));
const SubmitExperience = lazy(() => import("./pages/SubmitExperience"));
const SubmitAnswer     = lazy(() => import("./pages/SubmitAnswer"));
const MyProfile        = lazy(() => import("./pages/MyProfile"));
const AdminQueue       = lazy(() => import("./pages/AdminQueue"));
const ResourcesByTypePage = lazy(() => import("./pages/ResourcesByTypePage"));
const DailyTopicPage   = lazy(() => import("./pages/DailyTopicPage"));
const ConceptsPage     = lazy(() => import("./pages/ConceptsPage"));

function PageFallback() {
  return (
    <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--text-muted)", fontSize: 13, padding: 40 }}>
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public landing + auth */}
        <Route path="/"        element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />

        {/* Authenticated app shell */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview"           element={<OverviewPage />} />
          <Route path="daily"              element={<DailyTopicPage />} />
          <Route path="resources/:type"    element={<ResourcesByTypePage />} />
          <Route path="roadmap"            element={<RoadmapPage />} />
          <Route path="roadmap/phase/:p"   element={<RoadmapPage />} />
          <Route path="roadmap/phase/:p/week/:w" element={<RoadmapPage />} />
          <Route path="readings"           element={<ReadingsPage />} />
          <Route path="readings/submit"    element={<RequireAuth><SubmitReading /></RequireAuth>} />
          <Route path="interview"          element={<InterviewPage />} />
          <Route path="interview/submit"   element={<RequireAuth><SubmitInterview /></RequireAuth>} />
          <Route path="interview/:id/answer" element={<RequireAuth><SubmitAnswer /></RequireAuth>} />
          <Route path="experiences/submit" element={<RequireAuth><SubmitExperience /></RequireAuth>} />
          <Route path="concepts"           element={<ConceptsPage />} />
          <Route path="concepts/:slug"     element={<ConceptsPage />} />
          <Route path="about"              element={<AboutPage />} />
          <Route path="me"                 element={<RequireAuth><MyProfile /></RequireAuth>} />
          <Route path="admin"              element={<RequireAdmin><AdminQueue /></RequireAdmin>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
}
