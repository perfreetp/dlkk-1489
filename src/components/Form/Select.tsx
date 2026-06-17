import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { FormOption } from '@/types';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: FormOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder = '请选择', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="input-label">{label}</label>
        )}
        <select
          ref={ref}
          className={cn(
            "select",
            error && "border-danger-500 focus:ring-danger-500 focus:border-danger-500",
            className
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-danger-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
