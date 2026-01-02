'use client';

import { Control } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Toggle from '@/components/ui/Toggle';
import { cn } from '@/lib/utils/cn';

interface ColorSystemInputProps {
  control: Control<any>;
  primaryValue: string;
  backgroundValue: string;
  darkModeValue: boolean;
  onPrimaryChange: (value: string) => void;
  onBackgroundChange: (value: string) => void;
  onDarkModeChange: (value: boolean) => void;
  errors?: {
    primary?: string;
    background?: string;
  };
}

export default function ColorSystemInput({
  control,
  primaryValue,
  backgroundValue,
  darkModeValue,
  onPrimaryChange,
  onBackgroundChange,
  onDarkModeChange,
  errors,
}: ColorSystemInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          컬러 시스템 설정
        </label>
      </div>

      {/* Color Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Color */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-neutral-600">
            메인 컬러
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={primaryValue || '#0ea5e9'}
              onChange={(e) => onPrimaryChange(e.target.value)}
              className={cn(
                'h-12 w-20 rounded-lg cursor-pointer border-2',
                'transition-all duration-normal',
                'hover:scale-105 focus:scale-105',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                errors?.primary ? 'border-error-500' : 'border-neutral-300'
              )}
            />
            <Input
              value={primaryValue}
              onChange={(e) => onPrimaryChange(e.target.value)}
              placeholder="#0ea5e9"
              error={errors?.primary}
              className="flex-1 font-mono text-sm"
            />
          </div>

          {/* Color Preview */}
          <div
            className="h-8 w-full rounded-md shadow-sm border border-neutral-200"
            style={{ backgroundColor: primaryValue || '#0ea5e9' }}
          />
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-neutral-600">
            배경 컬러
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={backgroundValue || '#ffffff'}
              onChange={(e) => onBackgroundChange(e.target.value)}
              className={cn(
                'h-12 w-20 rounded-lg cursor-pointer border-2',
                'transition-all duration-normal',
                'hover:scale-105 focus:scale-105',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                errors?.background ? 'border-error-500' : 'border-neutral-300'
              )}
            />
            <Input
              value={backgroundValue}
              onChange={(e) => onBackgroundChange(e.target.value)}
              placeholder="#ffffff"
              error={errors?.background}
              className="flex-1 font-mono text-sm"
            />
          </div>

          {/* Color Preview */}
          <div
            className="h-8 w-full rounded-md shadow-sm border border-neutral-200"
            style={{ backgroundColor: backgroundValue || '#ffffff' }}
          />
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="pt-2 border-t border-neutral-200">
        <Toggle
          checked={darkModeValue}
          onChange={(e) => onDarkModeChange(e.target.checked)}
          label="다크 모드 지원"
          description="다크 모드를 지원하는 디자인을 원하시나요?"
        />
      </div>

      {/* Preview Card */}
      <div className="mt-4 p-4 rounded-lg border-2 border-neutral-200 bg-neutral-50">
        <p className="text-xs text-neutral-600 mb-2 font-medium">미리보기</p>
        <div
          className="p-4 rounded-md shadow-sm flex items-center justify-center gap-3"
          style={{ backgroundColor: backgroundValue || '#ffffff' }}
        >
          <div
            className="px-4 py-2 rounded-md text-white font-medium text-sm shadow-md"
            style={{ backgroundColor: primaryValue || '#0ea5e9' }}
          >
            메인 버튼
          </div>
          <div
            className="px-4 py-2 rounded-md font-medium text-sm border-2"
            style={{
              borderColor: primaryValue || '#0ea5e9',
              color: primaryValue || '#0ea5e9',
            }}
          >
            아웃라인 버튼
          </div>
        </div>
      </div>
    </div>
  );
}
