'use client';

import { cn } from '@/lib/utils/cn';

interface ProgressIndicatorProps {
  currentStage: 1 | 2 | 3;
  completedStages: number[];
  onStageClick: (stage: 1 | 2 | 3) => void;
  canNavigateTo: (stage: 1 | 2 | 3) => boolean;
}

const stages = [
  { number: 1, title: '서비스 개요', shortTitle: '개요' },
  { number: 2, title: '디자인 요소', shortTitle: '디자인' },
  { number: 3, title: '기술 제약사항', shortTitle: '기술' },
] as const;

export default function ProgressIndicator({
  currentStage,
  completedStages,
  onStageClick,
  canNavigateTo,
}: ProgressIndicatorProps) {
  const getStageState = (stageNumber: number): 'completed' | 'active' | 'locked' => {
    if (completedStages.includes(stageNumber)) return 'completed';
    if (currentStage === stageNumber) return 'active';
    return 'locked';
  };

  return (
    <div className="w-full">
      {/* Desktop and Tablet Layout */}
      <div className="hidden sm:block">
        <nav aria-label="단계별 진행 상태" className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const state = getStageState(stage.number);
            const isClickable = canNavigateTo(stage.number as 1 | 2 | 3);

            return (
              <div key={stage.number} className="flex items-center flex-1">
                {/* Stage Button */}
                <button
                  type="button"
                  onClick={() => isClickable && onStageClick(stage.number as 1 | 2 | 3)}
                  disabled={!isClickable}
                  aria-current={state === 'active' ? 'step' : undefined}
                  className={cn(
                    'group flex items-center gap-3 transition-all duration-normal',
                    isClickable && 'cursor-pointer hover:scale-102',
                    !isClickable && 'cursor-not-allowed'
                  )}
                >
                  {/* Circle Indicator */}
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full border-2',
                      'transition-all duration-normal ease-spring',
                      state === 'completed' &&
                        'border-success-500 bg-success-500 text-white shadow-md',
                      state === 'active' &&
                        'border-brand-500 bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow-md scale-110',
                      state === 'locked' &&
                        'border-neutral-300 bg-neutral-100 text-neutral-400',
                      isClickable && state !== 'active' && 'group-hover:shadow-interactive-sm'
                    )}
                  >
                    {state === 'completed' ? (
                      <svg
                        className="h-6 w-6"
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
                    ) : (
                      <span className="text-lg font-semibold">{stage.number}</span>
                    )}
                  </div>

                  {/* Stage Title */}
                  <div className="text-left">
                    <p
                      className={cn(
                        'text-xs font-medium transition-colors duration-normal',
                        state === 'completed' && 'text-success-600',
                        state === 'active' && 'text-brand-600',
                        state === 'locked' && 'text-neutral-400'
                      )}
                    >
                      {stage.number}단계
                    </p>
                    <p
                      className={cn(
                        'text-sm font-semibold transition-colors duration-normal',
                        state === 'completed' && 'text-success-700',
                        state === 'active' && 'text-brand-700',
                        state === 'locked' && 'text-neutral-400'
                      )}
                    >
                      {stage.title}
                    </p>
                  </div>
                </button>

                {/* Connector Line */}
                {index < stages.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-1 mx-4 rounded-full transition-all duration-slow',
                      completedStages.includes(stage.number)
                        ? 'bg-gradient-to-r from-success-500 to-brand-500'
                        : 'bg-neutral-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Mobile Layout (Compact Dots) */}
      <div className="block sm:hidden">
        <nav aria-label="단계별 진행 상태" className="flex items-center justify-center gap-2">
          {stages.map((stage) => {
            const state = getStageState(stage.number);
            const isClickable = canNavigateTo(stage.number as 1 | 2 | 3);

            return (
              <button
                key={stage.number}
                type="button"
                onClick={() => isClickable && onStageClick(stage.number as 1 | 2 | 3)}
                disabled={!isClickable}
                aria-label={`${stage.number}단계: ${stage.title}`}
                aria-current={state === 'active' ? 'step' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1',
                  'transition-all duration-normal',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'h-3 w-3 rounded-full border-2 transition-all duration-normal',
                    state === 'completed' &&
                      'border-success-500 bg-success-500 shadow-sm',
                    state === 'active' &&
                      'border-brand-500 bg-brand-500 shadow-glow-sm scale-125',
                    state === 'locked' && 'border-neutral-300 bg-neutral-200'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-medium transition-colors duration-normal',
                    state === 'completed' && 'text-success-600',
                    state === 'active' && 'text-brand-600',
                    state === 'locked' && 'text-neutral-400'
                  )}
                >
                  {stage.shortTitle}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
