import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";

const FullscreenLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
      <Loader2 className="h-4 w-4 animate-spin" />
      Проверяем сессию...
    </div>
  </div>
);

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <FullscreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export const RequireRole = ({
  role,
  children,
}: {
  role: "admin" | "call_center";
  children: ReactNode;
}) => {
  const { isLoading, user, isAuthenticated } = useAuth();

  if (isLoading) return <FullscreenLoader />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/forbidden" replace />;

  return <>{children}</>;
};

export const PublicOnly = ({ children }: { children: ReactNode }) => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <FullscreenLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
};
