'use client';

import Checkbox from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils/cn';

interface TechStackSelectorProps {
  frontend: string[];
  backend: string[];
  onFrontendChange: (selected: string[]) => void;
  onBackendChange: (selected: string[]) => void;
  errors?: {
    frontend?: string;
    backend?: string;
  };
}

const frontendOptions = [
  { value: 'React', label: 'React' },
  { value: 'Vue', label: 'Vue.js' },
  { value: 'Angular', label: 'Angular' },
  { value: 'Next.js', label: 'Next.js' },
  { value: 'Nuxt.js', label: 'Nuxt.js' },
  { value: 'Svelte', label: 'Svelte' },
  { value: 'Vanilla JS', label: 'Vanilla JavaScript' },
  { value: 'TypeScript', label: 'TypeScript' },
];

const backendOptions = [
  { value: 'Node.js', label: 'Node.js' },
  { value: 'Express', label: 'Express' },
  { value: 'NestJS', label: 'NestJS' },
  { value: 'Django', label: 'Django' },
  { value: 'FastAPI', label: 'FastAPI' },
  { value: 'Flask', label: 'Flask' },
  { value: 'Spring Boot', label: 'Spring Boot' },
  { value: 'Ruby on Rails', label: 'Ruby on Rails' },
  { value: 'ASP.NET', label: 'ASP.NET' },
  { value: 'Go', label: 'Go' },
  { value: 'PHP Laravel', label: 'PHP Laravel' },
];

export default function TechStackSelector({
  frontend,
  backend,
  onFrontendChange,
  onBackendChange,
  errors,
}: TechStackSelectorProps) {
  const toggleFrontend = (value: string) => {
    if (frontend.includes(value)) {
      onFrontendChange(frontend.filter((item) => item !== value));
    } else {
      onFrontendChange([...frontend, value]);
    }
  };

  const toggleBackend = (value: string) => {
    if (backend.includes(value)) {
      onBackendChange(backend.filter((item) => item !== value));
    } else {
      onBackendChange([...backend, value]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          기술 스택 선택
        </label>
        <p className="text-xs text-neutral-500">
          사용할 프론트엔드 및 백엔드 기술을 선택해주세요
        </p>
      </div>

      {/* Frontend Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-700">
            프론트엔드
          </h4>
          {frontend.length > 0 && (
            <span className="text-xs text-brand-600 font-medium">
              {frontend.length}개 선택됨
            </span>
          )}
        </div>

        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2',
            'p-4 rounded-lg border-2',
            errors?.frontend
              ? 'border-error-300 bg-error-50'
              : 'border-neutral-200 bg-neutral-50'
          )}
        >
          {frontendOptions.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={frontend.includes(option.value)}
              onChange={() => toggleFrontend(option.value)}
            />
          ))}
        </div>

        {errors?.frontend && (
          <p className="text-sm text-error-600">{errors.frontend}</p>
        )}
      </div>

      {/* Backend Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-700">백엔드</h4>
          {backend.length > 0 && (
            <span className="text-xs text-brand-600 font-medium">
              {backend.length}개 선택됨
            </span>
          )}
        </div>

        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2',
            'p-4 rounded-lg border-2',
            errors?.backend
              ? 'border-error-300 bg-error-50'
              : 'border-neutral-200 bg-neutral-50'
          )}
        >
          {backendOptions.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={backend.includes(option.value)}
              onChange={() => toggleBackend(option.value)}
            />
          ))}
        </div>

        {errors?.backend && (
          <p className="text-sm text-error-600">{errors.backend}</p>
        )}
      </div>
    </div>
  );
}
