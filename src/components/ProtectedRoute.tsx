import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRoles?: Array<'admin' | 'editor' | 'auditor' | 'call_center' | 'sales'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireRoles 
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRoles && profile && !requireRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};