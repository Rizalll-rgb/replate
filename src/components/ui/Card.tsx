import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = false,
  hoverable = true,
  className = '',
  ...props
}) => {
  const base = 'bg-white rounded-xl border border-[#E9ECEF] p-5 shadow-sm transition-all duration-200';
  const glassStyle = glass ? 'bg-white/80 backdrop-blur-md border-white/20' : '';
  const hoverStyle = hoverable ? 'hover:shadow-md hover:-translate-y-0.5' : '';

  return (
    <div className={`${base} ${glassStyle} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`mb-4 pb-3 border-b border-[#F1F3F5] ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-bold text-[#1B3A5C] ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-[#6C757D] mt-1 ${className}`} {...props}>
    {children}
  </p>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-3 border-t border-[#F1F3F5] flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
