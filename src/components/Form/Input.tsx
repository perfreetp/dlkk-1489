import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon: Icon, iconPosition = 'left', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="input-label">{label}</label>
        )}
        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          )}
          <input
            ref={ref}
            className={cn(
              "input",
              Icon && iconPosition === 'left' && "pl-10",
              Icon && iconPosition === 'right' && "pr-10",
              error && "border-danger-500 focus:ring-danger-500 focus:border-danger-500",
              className
            )}
            {...props}
          />
          {Icon && iconPosition === 'right' && (
            <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-danger-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
