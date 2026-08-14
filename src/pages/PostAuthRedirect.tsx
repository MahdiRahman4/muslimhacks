import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/Shared";

export default function PostAuthRedirect() {
  const { loading, isAdmin, summary } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/applications" replace />;
  }

  if (summary?.has_application) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/apply" replace />;
}
