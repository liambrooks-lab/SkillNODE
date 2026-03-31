import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/shell/AppShell";
import { AuthGate } from "./components/auth/AuthGate";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ActivitiesPage } from "./pages/ActivitiesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { MultiplayerPage } from "./pages/MultiplayerPage";
import { TypingPage } from "./pages/activities/TypingPage";
import { GuessingPage } from "./pages/activities/GuessingPage";
import { MathDrillsPage } from "./pages/activities/MathDrillsPage";
import { CodingPage } from "./pages/activities/CodingPage";
import { GrammarPage } from "./pages/activities/GrammarPage";
import { ComprehensionPage } from "./pages/activities/ComprehensionPage";
import { PublicProfilePage } from "./pages/PublicProfilePage";

export default function App() {
  return (
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
  );
}

