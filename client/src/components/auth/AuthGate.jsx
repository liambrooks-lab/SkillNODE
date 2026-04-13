import { Navigate, useLocation } from "react-router-dom";
import { hasSession } from "../../lib/auth";

export function AuthGate({ children }) {
  const token = hasSession();
  const loc = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

