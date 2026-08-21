import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center font-semibold rounded-full uppercase tracking-wider';

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  const variants = {
    primary: 'bg-[#1B3A5C]/10 text-[#1B3A5C] border border-[#1B3A5C]/20',
    secondary: 'bg-[#F1F3F5] text-[#495057] border border-[#DEE2E6]',
    gold: 'bg-[#D4A843]/15 text-[#8C6D22] border border-[#D4A843]/30',
    success: 'bg-[#2D8A4E]/15 text-[#2D8A4E] border border-[#2D8A4E]/30',
    warning: 'bg-[#E67E22]/15 text-[#E67E22] border border-[#E67E22]/30',
    danger: 'bg-[#C0392B]/15 text-[#C0392B] border border-[#C0392B]/30',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
