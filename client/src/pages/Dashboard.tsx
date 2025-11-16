// ============================================
// FILE: src/pages/Dashboard.tsx
// Main dashboard with chat interface
// ============================================

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { contactService } from '@/services/contact.service';
import { websocketService } from '@/services/websocket.service';
import { useChatStore } from '@/stores/chatStore';
import { useContactStore } from '@/stores/contactStore';
import { QUERY_KEYS } from '@/utils/constants';
import { Spinner } from '@/components/ui/Spinner';

// Placeholder components - will be implemented next
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Sidebar } from '@/components/common/Sidebar';

export const Dashboard: React.FC = () => {
  const { setConversations } = useChatStore();
  const { setContacts } = useContactStore();

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: [QUERY_KEYS.CONVERSATIONS],
    queryFn: async () => {
      const response = await chatService.getConversations();
      return response.data || [];
    },
  });

  // Fetch contacts
  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: [QUERY_KEYS.CONTACTS],
    queryFn: async () => {
      const response = await contactService.getContacts();
      return response.data || [];
    },
  });

  // Update stores when data changes
  useEffect(() => {
    if (conversations) {
      setConversations(conversations);
    }
  }, [conversations, setConversations]);

  useEffect(() => {
    if (contacts) {
      setContacts(contacts);
    }
  }, [contacts, setContacts]);

  // Connect WebSocket
  useEffect(() => {
    if (!websocketService.isConnected()) {
      websocketService.connect();
    }

    return () => {
      websocketService.disconnect();
    };
  }, []);

  if (conversationsLoading || contactsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <ConversationList />
      <ChatWindow />
    </div>
  );
};