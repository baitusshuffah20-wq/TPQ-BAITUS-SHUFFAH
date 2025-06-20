import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'info' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:cursor-pointer active:scale-95';
      const variants = {
      primary: 'btn-primary text-white hover:opacity-90 focus:ring-teal-500 focus:ring-opacity-50 shadow-sm hover:shadow-md',
      secondary: 'btn-secondary text-white hover:opacity-90 focus:ring-opacity-50 shadow-sm hover:shadow-md',
      accent: 'btn-accent text-white hover:opacity-90 focus:ring-opacity-50 shadow-sm hover:shadow-md',
      danger: 'btn-danger text-white hover:opacity-90 focus:ring-opacity-50 shadow-sm hover:shadow-md',
      info: 'btn-info text-white hover:opacity-90 focus:ring-opacity-50 shadow-sm hover:shadow-md',
      outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white focus:ring-teal-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
    };
    
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
