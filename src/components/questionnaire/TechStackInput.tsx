'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';

interface TechStackInputProps {
  frontend: string[];
  database: string[];
  backend: string[];
  other: string[];
  onFrontendChange: (selected: string[]) => void;
  onDatabaseChange: (selected: string[]) => void;
  onBackendChange: (selected: string[]) => void;
  onOtherChange: (selected: string[]) => void;
  errors?: {
    frontend?: string;
    database?: string;
    backend?: string;
    other?: string;
  };
}

// 자동완성 옵션들
const frontendSuggestions = [
  'React',
  'Vue.js',
  'Angular',
  'Next.js',
  'Nuxt.js',
  'Svelte',
  'Solid.js',
  'Vanilla JavaScript',
  'TypeScript',
  'jQuery',
  'Ember.js',
];

const databaseSuggestions = [
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'SQLite',
  'MariaDB',
  'Oracle',
  'MS SQL Server',
  'Cassandra',
  'Firebase',
  'Supabase',
  'DynamoDB',
  'Elasticsearch',
];

const backendSuggestions = [
  'Node.js',
  'Express',
  'NestJS',
  'Django',
  'FastAPI',
  'Flask',
  'Spring Boot',
  'Ruby on Rails',
  'ASP.NET',
  'Go',
  'PHP Laravel',
  'Deno',
  'Bun',
];

const otherSuggestions = [
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'Vercel',
  'Netlify',
  'GraphQL',
  'REST API',
  'WebSocket',
  'Nginx',
  'Apache',
];

interface SectionProps {
  title: string;
  items: string[];
  suggestions: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  error?: string;
}

function TechStackSection({
  title,
  items,
  suggestions,
  onAdd,
  onRemove,
  error,
}: SectionProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() && !items.includes(inputValue.trim())) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-neutral-700">{title}</h4>
        {items.length > 0 && (
          <span className="text-xs text-brand-600 font-medium">
            {items.length}개 입력됨
          </span>
        )}
      </div>

      {/* Input with datalist autocomplete */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`예: ${suggestions[0]}, ${suggestions[1]} 등`}
            list={`${title}-suggestions`}
            className="focus:shadow-glow-md focus:scale-102 transition-all duration-normal ease-spring"
          />
          <datalist id={`${title}-suggestions`}>
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="shrink-0"
        >
          추가
        </Button>
      </div>

      {/* Tags display */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-neutral-200 bg-neutral-50">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-md',
                'bg-brand-100 text-brand-700 text-sm font-medium',
                'border border-brand-300',
                'opacity-0 animate-slideInUp'
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'forwards',
              }}
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-brand-600 hover:text-brand-800 transition-colors"
                aria-label={`${item} 제거`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-error-600">{error}</p>}
    </div>
  );
}

export default function TechStackInput({
  frontend,
  database,
  backend,
  other,
  onFrontendChange,
  onDatabaseChange,
  onBackendChange,
  onOtherChange,
  errors,
}: TechStackInputProps) {
  const handleAddItem = (category: 'frontend' | 'database' | 'backend' | 'other') => (item: string) => {
    switch (category) {
      case 'frontend':
        onFrontendChange([...frontend, item]);
        break;
      case 'database':
        onDatabaseChange([...database, item]);
        break;
      case 'backend':
        onBackendChange([...backend, item]);
        break;
      case 'other':
        onOtherChange([...other, item]);
        break;
    }
  };

  const handleRemoveItem = (category: 'frontend' | 'database' | 'backend' | 'other') => (index: number) => {
    switch (category) {
      case 'frontend':
        onFrontendChange(frontend.filter((_, i) => i !== index));
        break;
      case 'database':
        onDatabaseChange(database.filter((_, i) => i !== index));
        break;
      case 'backend':
        onBackendChange(backend.filter((_, i) => i !== index));
        break;
      case 'other':
        onOtherChange(other.filter((_, i) => i !== index));
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          기술 스택 입력
        </label>
        <p className="text-xs text-neutral-500">
          각 영역에 사용할 기술을 입력해주세요. 자동완성 목록에서 선택하거나 직접 입력할 수 있습니다.
        </p>
      </div>

      <TechStackSection
        title="프론트엔드"
        items={frontend}
        suggestions={frontendSuggestions}
        onAdd={handleAddItem('frontend')}
        onRemove={handleRemoveItem('frontend')}
        error={errors?.frontend}
      />

      <TechStackSection
        title="데이터베이스"
        items={database}
        suggestions={databaseSuggestions}
        onAdd={handleAddItem('database')}
        onRemove={handleRemoveItem('database')}
        error={errors?.database}
      />

      <TechStackSection
        title="백엔드"
        items={backend}
        suggestions={backendSuggestions}
        onAdd={handleAddItem('backend')}
        onRemove={handleRemoveItem('backend')}
        error={errors?.backend}
      />

      <TechStackSection
        title="기타"
        items={other}
        suggestions={otherSuggestions}
        onAdd={handleAddItem('other')}
        onRemove={handleRemoveItem('other')}
        error={errors?.other}
      />
    </div>
  );
}
