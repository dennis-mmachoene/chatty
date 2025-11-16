// ============================================
// FILE: src/components/common/ProtectedRoute.tsx
// Route wrapper for authentication protection
// ============================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};