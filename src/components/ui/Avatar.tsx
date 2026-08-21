import React from 'react';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  return src ? (
    <img
      src={src}
      alt={name}
      className={`${sizes[size]} rounded-full object-cover border border-[#DEE2E6] ${className}`}
    />
  ) : (
    <div
      className={`${sizes[size]} rounded-full bg-[#1B3A5C] text-white font-bold flex items-center justify-center border border-[#142C47] ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
