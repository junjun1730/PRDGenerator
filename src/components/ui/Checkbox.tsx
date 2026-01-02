import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-start gap-3">
        <div className="flex h-6 items-center">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              description || error
                ? `${checkboxId}-description`
                : undefined
            }
            className={cn(
              'h-5 w-5 rounded border-2 transition-all duration-normal',
              'text-accent-500 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
              'hover:border-brand-400 cursor-pointer',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-error-500 focus:ring-error-500'
                : 'border-neutral-300',
              className
            )}
            {...props}
          />
        </div>

        {(label || description || error) && (
          <div className="flex flex-col gap-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'text-sm font-medium cursor-pointer',
                  error ? 'text-error-700' : 'text-neutral-700',
                  props.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}

            {(description || error) && (
              <p
                id={`${checkboxId}-description`}
                className={cn(
                  'text-xs',
                  error ? 'text-error-600' : 'text-neutral-500'
                )}
              >
                {error || description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
