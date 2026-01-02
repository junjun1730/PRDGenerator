import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  visualExample?: React.ReactNode;
}

export interface RadioGroupProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange'
  > {
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  layout?: 'vertical' | 'horizontal';
  showVisualExamples?: boolean;
}

const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      error,
      layout = 'vertical',
      showVisualExamples = false,
      name,
      ...props
    },
    ref
  ) => {
    const groupId = name || `radio-group-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-3">
        {label && (
          <label
            className={cn(
              'block text-sm font-medium',
              error ? 'text-error-700' : 'text-neutral-700'
            )}
          >
            {label}
          </label>
        )}

        <div
          role="radiogroup"
          aria-labelledby={label ? `${groupId}-label` : undefined}
          aria-invalid={error ? 'true' : 'false'}
          className={cn(
            'flex gap-4',
            layout === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
          )}
        >
          {options.map((option, index) => (
            <label
              key={option.value}
              className={cn(
                'flex items-start gap-3 cursor-pointer',
                'p-3 rounded-lg border-2 transition-all duration-normal',
                'hover:border-brand-400 hover:shadow-interactive-sm',
                value === option.value
                  ? 'border-brand-500 bg-brand-50 shadow-interactive-sm'
                  : 'border-neutral-200 bg-white',
                error && 'border-error-300',
                props.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex h-6 items-center">
                <input
                  type="radio"
                  ref={index === 0 ? ref : undefined}
                  name={groupId}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  aria-describedby={
                    option.description
                      ? `${groupId}-${option.value}-description`
                      : undefined
                  }
                  className={cn(
                    'h-5 w-5 border-2 transition-all duration-normal',
                    'text-brand-500 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                    'cursor-pointer',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    error
                      ? 'border-error-500 focus:ring-error-500'
                      : 'border-neutral-300'
                  )}
                  {...props}
                />
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      value === option.value
                        ? 'text-brand-700'
                        : 'text-neutral-700'
                    )}
                  >
                    {option.label}
                  </span>

                  {option.description && (
                    <p
                      id={`${groupId}-${option.value}-description`}
                      className="text-xs text-neutral-500 mt-1"
                    >
                      {option.description}
                    </p>
                  )}
                </div>

                {showVisualExamples && option.visualExample && (
                  <div className="mt-2">{option.visualExample}</div>
                )}
              </div>
            </label>
          ))}
        </div>

        {error && (
          <p className="text-sm text-error-600 mt-2">{error}</p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
