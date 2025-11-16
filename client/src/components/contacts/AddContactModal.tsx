// ============================================
// FILE: src/components/contacts/AddContactModal.tsx
// Modal for adding new contacts
// ============================================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/services/contact.service';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { QUERY_KEYS } from '@/utils/constants';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const addContactMutation = useMutation({
    mutationFn: contactService.sendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONTACTS] });
      toast.success('Contact request sent');
      form.reset();
      onClose();
    },
    onError: () => {
      toast.error('Failed to send contact request');
    },
  });

  const handleSubmit = (data: FormData) => {
    addContactMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Contact">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="friend@example.com"
          leftIcon={<Mail className="h-5 w-5" />}
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" isLoading={addContactMutation.isPending} className="flex-1">
            Send Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};