// ============================================
// FILE: src/components/chat/ChatWindow.tsx
// Main chat window with messages
// ============================================

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useChatStore } from '@/stores/chatStore';
import { chatService } from '@/services/chat.service';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { TypingIndicator } from './TypingIndicator';
import { Spinner } from '@/components/ui/Spinner';
import { QUERY_KEYS } from '@/utils/constants';

export const ChatWindow: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeConversationId, messages, setMessages } = useChatStore();

  const { data: conversationMessages, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MESSAGES, activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];
      const response = await chatService.getMessages(activeConversationId);
      return response.data || [];
    },
    enabled: !!activeConversationId,
  });

  useEffect(() => {
    if (conversationMessages && activeConversationId) {
      setMessages(activeConversationId, conversationMessages);
    }
  }, [conversationMessages, activeConversationId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversationId]);

  if (!activeConversationId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const currentMessages = messages[activeConversationId] || [];

  return (
    <div className="flex flex-1 flex-col bg-gray-50 dark:bg-gray-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <TypingIndicator conversationId={activeConversationId} />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <MessageComposer conversationId={activeConversationId} />
    </div>
  );
};