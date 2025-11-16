// ============================================
// FILE: src/components/ui/Avatar.tsx
// Avatar component with fallback initials
// ============================================

import { ImgHTMLAttributes, useState } from 'react';
import { cn } from '@/utils/cn';
import { User } from 'lucide-react';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  status?: 'online' | 'offline' | 'away';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  status,
  className,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const statusSizes = {
    xs: 'h-1.5 w-1.5 border',
    sm: 'h-2 w-2 border',
    md: 'h-2.5 w-2.5 border-2',
    lg: 'h-3 w-3 border-2',
    xl: 'h-4 w-4 border-2',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const showFallback = !src || imageError;

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
          sizes[size]
        )}
      >
        {showFallback ? (
          fallback ? (
            <span className="font-medium text-gray-600 dark:text-gray-300">
              {getInitials(fallback)}
            </span>
          ) : (
            <User className="h-3/5 w-3/5 text-gray-400" aria-hidden="true" />
          )
        ) : (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
            {...props}
          />
        )}
      </div>
      
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full border-white dark:border-gray-900',
            statusSizes[size],
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};