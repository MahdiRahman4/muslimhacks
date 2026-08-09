import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function PostAuthRedirect() {
  const { loading, isAdmin, summary } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (isAdmin) {
    return <Navigate to="/admin/applications" replace />;
  }

  if (summary?.has_application) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/apply" replace />;
}
