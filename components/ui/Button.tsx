import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'default' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'default' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer';
    
    const variants: Record<string, string> = {
      default: 'bg-primary text-primary-foreground border border-primary-border rounded-md',
      primary: 'bg-primary text-primary-foreground border border-primary-border rounded-md',
      secondary: 'bg-secondary text-secondary-foreground border border-secondary-border rounded-md',
      outline: 'border border-black shadow-xs active:shadow-none rounded-md',
      danger: 'bg-destructive text-destructive-foreground border border-destructive-border rounded-md',
      destructive: 'bg-destructive text-destructive-foreground border border-destructive-border rounded-md',
      ghost: 'border border-transparent rounded-md',
    };
    
    const sizes: Record<string, string> = {
      sm: 'min-h-8 px-3 text-xs rounded-md',
      md: 'min-h-9 px-4 py-2',
      lg: 'min-h-10 px-8 rounded-md',
      default: 'min-h-9 px-4 py-2',
      icon: 'h-9 w-9 p-0',
    };
    
    // Only add brutalist effects for non-ghost buttons
    const interactiveStyles = variant === 'ghost' 
      ? '' 
      : 'brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none';
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${interactiveStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';


