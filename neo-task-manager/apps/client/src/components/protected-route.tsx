import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../features/auth/use-session";
import { useAuthStore } from "../features/auth/auth-store";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  useSession();
  const { user, isReady } = useAuthStore();

  if (!isReady) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

