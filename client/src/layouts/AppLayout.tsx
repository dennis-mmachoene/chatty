// ============================================
// FILE: src/layouts/AppLayout.tsx
// Main application layout with sidebar
// ============================================

import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { ROUTES } from '@/utils/constants';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isSidebarOpen } = useUIStore();
  const isMobile = useIsMobile();

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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main
        className={cn(
          'flex-1 overflow-hidden transition-all duration-300',
          isSidebarOpen && !isMobile && 'ml-64'
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};