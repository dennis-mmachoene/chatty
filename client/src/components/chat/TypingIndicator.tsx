// ============================================
// FILE: src/components/chat/TypingIndicator.tsx
// Shows when users are typing
// ============================================

import { useChatStore } from '@/stores/chatStore';

interface TypingIndicatorProps {
  conversationId: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ conversationId }) => {
  const { typingUsers } = useChatStore();
  const users = typingUsers[conversationId] || [];

  if (users.length === 0) return null;

  const names = users.map((u) => u.displayName).join(', ');

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {names} {users.length === 1 ? 'is' : 'are'} typing...
      </span>
    </div>
  );
};