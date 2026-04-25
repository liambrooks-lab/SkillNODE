import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/shell/AppShell";
import { AuthGate } from "./components/auth/AuthGate";

const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const ActivitiesPage = lazy(() => import("./pages/ActivitiesPage").then((m) => ({ default: m.ActivitiesPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const MultiplayerPage = lazy(() => import("./pages/MultiplayerPage").then((m) => ({ default: m.MultiplayerPage })));
const TypingPage = lazy(() => import("./pages/activities/TypingPage").then((m) => ({ default: m.TypingPage })));
const GuessingPage = lazy(() => import("./pages/activities/GuessingPage").then((m) => ({ default: m.GuessingPage })));
const MathDrillsPage = lazy(() => import("./pages/activities/MathDrillsPage").then((m) => ({ default: m.MathDrillsPage })));
const CodingPage = lazy(() => import("./pages/activities/CodingPage").then((m) => ({ default: m.CodingPage })));
const GrammarPage = lazy(() => import("./pages/activities/GrammarPage").then((m) => ({ default: m.GrammarPage })));
const ComprehensionPage = lazy(() => import("./pages/activities/ComprehensionPage").then((m) => ({ default: m.ComprehensionPage })));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage").then((m) => ({ default: m.PublicProfilePage })));

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/u/:userId" element={<PublicProfilePage />} />

        <Route
          path="/"
          element={
            <AuthGate>
              <AppShell />
            </AuthGate>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="activities/typing" element={<TypingPage />} />
          <Route path="activities/guess" element={<GuessingPage />} />
          <Route path="activities/math" element={<MathDrillsPage />} />
          <Route path="activities/code" element={<CodingPage />} />
          <Route path="activities/grammar" element={<GrammarPage />} />
          <Route path="activities/comprehension" element={<ComprehensionPage />} />
          <Route path="multiplayer" element={<MultiplayerPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6" style={{ background: "var(--bg)" }}>
      <div
        style={{
          borderRadius: 28,
          border: "1px solid var(--border)",
          background: "linear-gradient(180deg, var(--surface), var(--surface-2))",
          padding: "16px 24px",
          fontSize: "0.875rem",
          color: "var(--text-muted)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        Loading SkillNODE...
      </div>
    </div>
  );
}
