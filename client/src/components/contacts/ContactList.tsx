// ============================================
// FILE: src/components/contacts/ContactList.tsx
// List of user contacts
// ============================================

import { useQuery } from '@tanstack/react-query';
import { contactService } from '@/services/contact.service';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { QUERY_KEYS } from '@/utils/constants';
import { MessageCircle } from 'lucide-react';

export const ContactList: React.FC = () => {
  const { data: contacts, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CONTACTS],
    queryFn: async () => {
      const response = await contactService.getContacts();
      return response.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        No contacts yet. Add some to start chatting!
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
        >
          <Avatar
            src={contact.avatarUrl}
            alt={contact.displayName}
            size="md"
            fallback={contact.displayName}
            status={contact.isOnline ? 'online' : 'offline'}
          />

          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">{contact.displayName}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{contact.email}</p>
          </div>

          <Button variant="ghost" size="sm" leftIcon={<MessageCircle className="h-4 w-4" />}>
            Chat
          </Button>
        </div>
      ))}
    </div>
  );
};