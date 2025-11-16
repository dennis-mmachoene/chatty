// ============================================
// FILE: src/components/chat/ConversationList.tsx
// List of conversations with search
// ============================================

import { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Search } from 'lucide-react';
import { formatMessageTime } from '@/utils/date';
import { cn } from '@/utils/cn';

export const ConversationList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { conversations, activeConversationId, setActiveConversation } = useChatStore();

  const filteredConversations = conversations.filter((conv) =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-80 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Messages</h2>
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-5 w-5" />}
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No conversations yet
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setActiveConversation(conversation.id)}
              className={cn(
                'flex w-full items-center gap-3 border-b border-gray-200 p-4 transition-colors dark:border-gray-700',
                activeConversationId === conversation.id
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <Avatar
                src={conversation.avatarUrl}
                alt={conversation.name || 'User'}
                size="md"
                fallback={conversation.name}
              />

              <div className="flex-1 overflow-hidden text-left">
                <div className="flex items-center justify-between">
                  <h3 className="truncate font-medium text-gray-900 dark:text-white">
                    {conversation.name || 'Unknown'}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatMessageTime(conversation.lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <Badge variant="primary" size="sm">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};





