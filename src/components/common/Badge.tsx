import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  size = 'sm'
}) => {
  const variantClasses = {
    success: 'bg-green-500/10 text-green-500',
    warning: 'bg-amber-500/10 text-amber-500',
    error: 'bg-red-500/10 text-red-500',
    info: 'bg-brand-gold/10 text-brand-gold'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`
      inline-flex items-center font-semibold rounded-full
      ${variantClasses[variant]}
      ${sizeClasses[size]}
    `}>
      {children}
    </span>
  );
};

export default Badge;