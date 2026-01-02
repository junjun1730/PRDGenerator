'use client';

import { cn } from '@/lib/utils/cn';

interface ThemeSelectorProps {
  selectedThemes: string[];
  onChange: (themes: string[]) => void;
  error?: string;
}

const themeOptions = [
  {
    value: '미니멀',
    label: '미니멀',
    description: '군더더기 없는 깔끔한 디자인',
    icon: '✨',
  },
  {
    value: '모던',
    label: '모던',
    description: '현대적이고 세련된 느낌',
    icon: '🎨',
  },
  {
    value: '화려한 인터랙션',
    label: '화려한 인터랙션',
    description: '동적이고 생동감 있는 효과',
    icon: '🎪',
  },
  {
    value: '신뢰감',
    label: '신뢰감',
    description: '전문적이고 안정적인 느낌',
    icon: '🛡️',
  },
  {
    value: '귀여운',
    label: '귀여운',
    description: '친근하고 사랑스러운 분위기',
    icon: '🌸',
  },
  {
    value: '럭셔리',
    label: '럭셔리',
    description: '고급스럽고 우아한 느낌',
    icon: '💎',
  },
  {
    value: '친환경',
    label: '친환경',
    description: '자연스럽고 편안한 분위기',
    icon: '🌿',
  },
  {
    value: '레트로',
    label: '레트로',
    description: '복고풍의 감성적인 느낌',
    icon: '📻',
  },
];

export default function ThemeSelector({
  selectedThemes,
  onChange,
  error,
}: ThemeSelectorProps) {
  const toggleTheme = (themeValue: string) => {
    if (selectedThemes.includes(themeValue)) {
      onChange(selectedThemes.filter((t) => t !== themeValue));
    } else {
      onChange([...selectedThemes, themeValue]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          디자인 테마 선택
        </label>
        <p className="text-xs text-neutral-500 mb-3">
          원하는 디자인 분위기를 모두 선택해주세요 (복수 선택 가능)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {themeOptions.map((theme) => {
          const isSelected = selectedThemes.includes(theme.value);

          return (
            <button
              key={theme.value}
              type="button"
              onClick={() => toggleTheme(theme.value)}
              className={cn(
                'relative p-4 rounded-lg border-2 text-left',
                'transition-all duration-normal ease-spring',
                'hover:scale-102 hover:shadow-interactive-sm',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                isSelected
                  ? 'border-brand-500 bg-brand-50 shadow-glow-sm'
                  : 'border-neutral-200 bg-white hover:border-brand-300'
              )}
            >
              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white shadow-md">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{theme.icon}</div>
                <div>
                  <p
                    className={cn(
                      'font-semibold text-sm mb-1 transition-colors duration-normal',
                      isSelected ? 'text-brand-700' : 'text-neutral-700'
                    )}
                  >
                    {theme.label}
                  </p>
                  <p className="text-xs text-neutral-500">{theme.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedThemes.length > 0 && (
        <p className="text-xs text-brand-600 font-medium">
          {selectedThemes.length}개 테마 선택됨
        </p>
      )}

      {error && <p className="text-sm text-error-600">{error}</p>}
    </div>
  );
}
