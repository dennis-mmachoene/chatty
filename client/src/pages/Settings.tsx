// ============================================
// FILE: src/pages/Settings.tsx
// Application settings page
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { userService } from '@/services/user.service';
import { QUERY_KEYS } from '@/utils/constants';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: [QUERY_KEYS.SETTINGS],
    queryFn: async () => {
      const response = await userService.getSettings();
      return response.data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: userService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS] });
      toast.success('Settings updated');
    },
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Appearance</h2>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Theme</label>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? 'primary' : 'outline'}
                  onClick={() => setTheme(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>Push Notifications</span>
              <input
                type="checkbox"
                checked={settings?.notificationsEnabled}
                onChange={(e) =>
                  updateSettingsMutation.mutate({ notificationsEnabled: e.target.checked })
                }
                className="h-5 w-5"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Email Notifications</span>
              <input
                type="checkbox"
                checked={settings?.emailNotifications}
                onChange={(e) =>
                  updateSettingsMutation.mutate({ emailNotifications: e.target.checked })
                }
                className="h-5 w-5"
              />
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
};