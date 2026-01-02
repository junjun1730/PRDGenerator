'use client';

import { Control, useFieldArray, FieldValues, Path } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';

interface DynamicArrayInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  maxItems?: number;
  error?: string;
  helperText?: string;
}

export default function DynamicArrayInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  maxItems = 10,
  error,
  helperText,
}: DynamicArrayInputProps<T>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
        {helperText && !error && (
          <p className="text-xs text-neutral-500 mb-2">{helperText}</p>
        )}
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className={cn(
              'flex gap-2 items-start',
              'opacity-0 animate-slideInUp'
            )}
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'forwards',
            }}
          >
            <div className="flex-1">
              <Input
                {...(control.register as any)(`${name}.${index}` as Path<T>)}
                placeholder={placeholder}
                className="focus:shadow-glow-md focus:scale-102 transition-all duration-normal ease-spring"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="shrink-0 hover:text-error-600 transition-colors duration-normal"
              aria-label={`${index + 1}번째 항목 제거`}
            >
              제거
            </Button>
          </div>
        ))}

        {fields.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-4 border-2 border-dashed border-neutral-200 rounded-lg">
            아직 추가된 항목이 없습니다
          </p>
        )}
      </div>

      {fields.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append('' as any)}
          className="w-full hover:shadow-interactive-sm transition-all duration-normal"
        >
          + 추가 {fields.length > 0 && `(${fields.length}/${maxItems})`}
        </Button>
      )}

      {fields.length >= maxItems && (
        <p className="text-xs text-neutral-500 text-center">
          최대 {maxItems}개까지 입력 가능합니다
        </p>
      )}

      {error && <p className="text-sm text-error-600">{error}</p>}
    </div>
  );
}
