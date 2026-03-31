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
    <Suspense
      fallback={
        <div className="app-shell-bg flex min-h-screen items-center justify-center px-4">
          <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/70">
            Loading SkillNODE...
          </div>
        </div>
      }
    >
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

