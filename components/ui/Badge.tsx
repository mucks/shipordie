import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = ({ className = '', variant = 'default', children, ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-gray-700 text-white border-black',
    success: 'bg-green-500 text-white border-black',
    warning: 'bg-yellow-500 text-black border-black',
    danger: 'bg-red-500 text-white border-black',
    info: 'bg-blue-500 text-white border-black',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-black uppercase tracking-wide border-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};


