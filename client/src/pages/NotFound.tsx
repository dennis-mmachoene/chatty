// ============================================
// FILE: src/pages/NotFound.tsx
// 404 error page
// ============================================

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mb-4 text-3xl font-semibold text-gray-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild leftIcon={<Home className="h-5 w-5" />}>
          <Link to={ROUTES.HOME}>Go Home</Link>
        </Button>
      </div>
    </div>
  );
};