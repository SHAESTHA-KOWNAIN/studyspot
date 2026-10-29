import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingState from "./LoadingState.jsx";

export default function ModeratorRoute() {
  const { user, isModerator, loading } = useAuth();
  if (loading) return <LoadingState label="Checking your access" />;
  if (!user) return <Navigate to="/login" replace state={{ from: { pathname: "/moderator" } }} />;
  return isModerator ? <Outlet /> : <Navigate to="/spaces" replace />;
}
