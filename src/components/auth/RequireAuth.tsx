import { Navigate, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useAuth } from "@/hooks/useAuth";

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isLoaded } = useClerkAuth();
  const location = useLocation();

  if (!isLoaded) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <>
      <SignedOut>
        <Navigate to="/signin" replace state={{ from: location.pathname }} />
      </SignedOut>
      <SignedIn>{children}</SignedIn>
    </>
  );
}

interface RequireAdminProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <>
      <SignedOut>
        <Navigate to="/signin" replace state={{ from: location.pathname }} />
      </SignedOut>
      <SignedIn>
        {!isAdmin ? <Navigate to="/apply" replace /> : children}
      </SignedIn>
    </>
  );
}
