import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, error, className, id, checked, ...props }, ref) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center justify-between gap-4">
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={toggleId}
                className={cn(
                  'block text-sm font-medium cursor-pointer',
                  error ? 'text-error-700' : 'text-neutral-700',
                  props.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}

            {(description || error) && (
              <p
                id={`${toggleId}-description`}
                className={cn(
                  'text-xs mt-1',
                  error ? 'text-error-600' : 'text-neutral-500'
                )}
              >
                {error || description}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? toggleId : undefined}
          aria-describedby={
            description || error ? `${toggleId}-description` : undefined
          }
          onClick={() => {
            const input = document.getElementById(toggleId) as HTMLInputElement;
            if (input && !props.disabled) {
              input.click();
            }
          }}
          disabled={props.disabled}
          className={cn(
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer',
            'rounded-full border-2 border-transparent',
            'transition-all duration-normal ease-spring',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            checked
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-glow-sm'
              : 'bg-neutral-300',
            className
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full',
              'bg-white shadow-md ring-0 transition-transform duration-normal ease-spring',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>

        {/* Hidden input for form integration */}
        <input
          type="checkbox"
          ref={ref}
          id={toggleId}
          checked={checked}
          className="sr-only"
          {...props}
        />
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export default Toggle;
