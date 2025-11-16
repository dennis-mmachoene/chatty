// ============================================
// FILE: src/components/chat/MessageBubble.tsx
// Individual message bubble
// ============================================

import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';
import { formatTime } from '@/utils/date';
import type { Message } from '@/types/chat.types';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { user } = useAuth();
  const isOwn = message.senderId === user?.id;

  return (
    <div className={cn('flex gap-2', isOwn && 'flex-row-reverse')}>
      {!isOwn && (
        <Avatar
          src={message.sender?.avatarUrl}
          alt={message.sender?.displayName || 'User'}
          size="sm"
          fallback={message.sender?.displayName}
        />
      )}

      <div className={cn('flex flex-col', isOwn && 'items-end')}>
        {!isOwn && (
          <span className="mb-1 text-xs text-gray-600 dark:text-gray-400">
            {message.sender?.displayName}
          </span>
        )}

        <div
          className={cn(
            'max-w-md rounded-2xl px-4 py-2',
            isOwn
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          )}
        >
          {message.type === 'text' && <p className="break-words">{message.content}</p>}

          {message.type === 'image' && (
            <img
              src={message.mediaUrl}
              alt="Shared image"
              className="max-w-full rounded-lg"
            />
          )}

          {message.type === 'video' && (
            <video
              src={message.mediaUrl}
              controls
              className="max-w-full rounded-lg"
            />
          )}

          {message.type === 'audio' && (
            <audio src={message.mediaUrl} controls className="max-w-full" />
          )}

          <div className={cn('mt-1 flex items-center gap-1 text-xs', isOwn ? 'text-primary-100' : 'text-gray-500')}>
            <span>{formatTime(message.createdAt)}</span>
            {isOwn && (
              <>
                {message.status === 'read' ? (
                  <CheckCheck className="h-3 w-3" />
                ) : message.status === 'delivered' ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};