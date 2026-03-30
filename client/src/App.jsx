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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

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
        <Route path="multiplayer" element={<MultiplayerPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

