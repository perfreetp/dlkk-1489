import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="input-label">{label}</label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            "input resize-none",
            error && "border-danger-500 focus:ring-danger-500 focus:border-danger-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-danger-400">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
