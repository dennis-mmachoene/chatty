// ============================================
// FILE: src/components/chat/MessageComposer.tsx
// Message input with attachments
// ============================================

import { useState, useRef, KeyboardEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { websocketService } from '@/services/websocket.service';
import { Button } from '@/components/ui/Button';
import { Send, Paperclip, Image, Smile } from 'lucide-react';
import { QUERY_KEYS } from '@/utils/constants';
import toast from 'react-hot-toast';

interface MessageComposerProps {
  conversationId: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ conversationId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      chatService.sendMessage(conversationId, {
        type: 'text',
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MESSAGES, conversationId] });
      setMessage('');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      websocketService.startTyping(conversationId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      websocketService.stopTyping(conversationId);
    }, 1000);
  };

  const handleSubmit = () => {
    if (!message.trim()) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    websocketService.stopTyping(conversationId);

    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-end gap-2">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" aria-label="Attach file">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Send image">
            <Image className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Send emoji">
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />

        <Button
          onClick={handleSubmit}
          disabled={!message.trim()}
          isLoading={sendMessageMutation.isPending}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};