'use client';

import { useState, useEffect } from 'react';
import { useQuestionnaireStore } from '@/lib/store/useQuestionnaireStore';
import { isStageComplete, canProceedToStage } from '@/lib/utils/questionnaireValidation';
import ProgressIndicator from './ProgressIndicator';
import Stage1Form from './Stage1Form';
import Stage2Form from './Stage2Form';
import Stage3Form from './Stage3Form';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function QuestionnaireContainer() {
  const store = useQuestionnaireStore();
  const { currentStage, setCurrentStage } = store;

  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [showNavigationAlert, setShowNavigationAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Update completed stages when store changes
  useEffect(() => {
    const completed: number[] = [];
    if (isStageComplete(1, store)) completed.push(1);
    if (isStageComplete(2, store)) completed.push(2);
    if (isStageComplete(3, store)) completed.push(3);
    setCompletedStages(completed);
  }, [store.stage1, store.stage2, store.stage3]);

  const handleStageClick = (targetStage: 1 | 2 | 3) => {
    if (canProceedToStage(targetStage, store)) {
      setCurrentStage(targetStage);
    } else {
      // Show alert for locked stages
      if (targetStage === 2) {
        setAlertMessage('1단계를 먼저 완료해주세요.');
      } else if (targetStage === 3) {
        setAlertMessage('1단계와 2단계를 먼저 완료해주세요.');
      }
      setShowNavigationAlert(true);
    }
  };

  const getStageTitleAndDescription = (stage: 1 | 2 | 3) => {
    switch (stage) {
      case 1:
        return {
          title: '1단계: 서비스 개요',
          description: '서비스의 핵심 내용과 사용자 경험을 정의합니다',
        };
      case 2:
        return {
          title: '2단계: 디자인 요소',
          description: '서비스의 시각적 요소와 디자인 방향성을 결정합니다',
        };
      case 3:
        return {
          title: '3단계: 기술 제약사항',
          description: '기술 스택과 구현 요구사항을 명시합니다',
        };
    }
  };

  const { title, description } = getStageTitleAndDescription(currentStage);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <div className="opacity-0 animate-fadeIn">
        <ProgressIndicator
          currentStage={currentStage}
          completedStages={completedStages}
          onStageClick={handleStageClick}
          canNavigateTo={(stage) => canProceedToStage(stage, store)}
        />
      </div>

      {/* Current Stage Card */}
      <div
        key={currentStage}
        className="opacity-0 animate-slideInRight"
        style={{
          animationDelay: '100ms',
          animationFillMode: 'forwards',
        }}
      >
        <Card shadow="medium" padding="lg" className="hover:shadow-lg transition-shadow duration-normal">
          {/* Stage Header */}
          <div className="mb-8 pb-6 border-b border-neutral-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                  {title}
                </h2>
                <p className="text-neutral-600">{description}</p>
              </div>

              {/* Stage Badge */}
              <div className="flex-shrink-0">
                {completedStages.includes(currentStage) ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-success-100 text-success-700 rounded-full">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm font-medium">완료</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 bg-brand-100 text-brand-700 rounded-full">
                    <span className="text-sm font-medium">진행 중</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stage Form */}
          <div>
            {currentStage === 1 && <Stage1Form />}
            {currentStage === 2 && <Stage2Form />}
            {currentStage === 3 && <Stage3Form />}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-neutral-200 flex items-center justify-between gap-4">
            <div>
              {currentStage > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStage((currentStage - 1) as 1 | 2 | 3)}
                  className="hover:shadow-interactive-sm"
                >
                  ← 이전 단계
                </Button>
              )}
            </div>

            <div>
              {currentStage < 3 && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    if (isStageComplete(currentStage, store)) {
                      setCurrentStage((currentStage + 1) as 1 | 2 | 3);
                    } else {
                      setAlertMessage('현재 단계를 먼저 완료해주세요.');
                      setShowNavigationAlert(true);
                    }
                  }}
                  className="hover:shadow-interactive-md"
                >
                  다음 단계 →
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Alert Modal */}
      <Modal
        isOpen={showNavigationAlert}
        onClose={() => setShowNavigationAlert(false)}
        title="단계 이동 불가"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">{alertMessage}</p>
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => setShowNavigationAlert(false)}
            >
              확인
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
