// ============================================
// FILE: src/components/common/Sidebar.tsx
// Application sidebar with navigation
// ============================================

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import {
  MessageCircle,
  Users,
  Settings,
  LogOut,
  User,
  Phone,
  X,
} from 'lucide-react';
import { ROUTES } from '@/utils/constants';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const isMobile = useIsMobile();
  const location = useLocation();

  const navigation = [
    { name: 'Chats', icon: MessageCircle, path: ROUTES.DASHBOARD },
    { name: 'Contacts', icon: Users, path: '/contacts' },
    { name: 'Calls', icon: Phone, path: '/calls' },
    { name: 'Profile', icon: User, path: ROUTES.PROFILE },
    { name: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
  ];

  if (!isSidebarOpen && isMobile) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
          isMobile ? 'translate-x-0' : 'translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-8 w-8 text-primary-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">Chat</span>
          </div>

          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Profile */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.avatarUrl}
              alt={user?.displayName || 'User'}
              size="md"
              fallback={user?.displayName}
              status="online"
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-medium text-gray-900 dark:text-white">
                {user?.displayName}
              </p>
              <p className="truncate text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => logout()}
            leftIcon={<LogOut className="h-5 w-5" />}
          >
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};