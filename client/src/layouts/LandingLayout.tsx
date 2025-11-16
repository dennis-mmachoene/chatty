// ============================================
// FILE: src/layouts/LandingLayout.tsx
// Layout for landing/marketing pages
// ============================================

import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, MessageCircle } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

export const LandingLayout: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        <nav className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <MessageCircle className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Chat Platform</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Button variant="ghost" asChild>
              <Link to={ROUTES.LOGIN}>Sign In</Link>
            </Button>

            <Button asChild>
              <Link to={ROUTES.LOGIN}>Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Product</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#features" className="hover:text-primary-600">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary-600">Pricing</a></li>
                <li><a href="#security" className="hover:text-primary-600">Security</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Company</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#about" className="hover:text-primary-600">About</a></li>
                <li><a href="#blog" className="hover:text-primary-600">Blog</a></li>
                <li><a href="#careers" className="hover:text-primary-600">Careers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Support</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#help" className="hover:text-primary-600">Help Center</a></li>
                <li><a href="#contact" className="hover:text-primary-600">Contact</a></li>
                <li><a href="#status" className="hover:text-primary-600">Status</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Legal</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#privacy" className="hover:text-primary-600">Privacy</a></li>
                <li><a href="#terms" className="hover:text-primary-600">Terms</a></li>
                <li><a href="#cookies" className="hover:text-primary-600">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-gray-600 dark:border-gray-700 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Chat Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};