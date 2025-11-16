// ============================================
// FILE: src/pages/Profile.tsx
// User profile page
// ============================================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/user.service';
import { QUERY_KEYS } from '@/utils/constants';
import toast from 'react-hot-toast';
import { User, Mail } from 'lucide-react';

const profileSchema = z.object({
  displayName: z.string().min(2).max(50),
  statusMessage: z.string().max(200).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      statusMessage: user?.statusMessage || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const handleSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>

      <Card className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatarUrl} alt={user.displayName} size="xl" fallback={user.displayName} />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.displayName}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Input
            label="Display Name"
            leftIcon={<User className="h-5 w-5" />}
            error={form.formState.errors.displayName?.message}
            {...form.register('displayName')}
          />

          <Input
            label="Status Message"
            placeholder="What's on your mind?"
            error={form.formState.errors.statusMessage?.message}
            {...form.register('statusMessage')}
          />

          <Input
            label="Email"
            type="email"
            value={user.email}
            disabled
            leftIcon={<Mail className="h-5 w-5" />}
          />

          <Button type="submit" isLoading={updateProfileMutation.isPending}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};