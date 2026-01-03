"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useQuestionnaireStore } from "@/lib/store/useQuestionnaireStore";
import {
  areAllStagesComplete,
  getIncompleteStages,
} from "@/lib/utils/questionnaireValidation";

export default function FloatingActions() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const store = useQuestionnaireStore();
  const { resetAll, setCurrentStage } = store;

  const handleReset = () => {
    resetAll();
    setShowResetConfirm(false);
  };

  const handleGeneratePRD = () => {
    // Check if all stages are complete
    if (areAllStagesComplete(store)) {
      // TODO: Implement PRD generation modal in Phase 4
      alert("PRD 생성 기능은 다음 단계에서 구현됩니다.");
    } else {
      // Show confirmation for incomplete input
      setShowIncompleteModal(true);
    }
  };

  const handleProceedWithIncomplete = () => {
    setShowIncompleteModal(false);
    // TODO: Implement PRD generation modal in Phase 4
    alert("PRD 생성 기능은 다음 단계에서 구현됩니다.");
  };

  const incompleteStages = getIncompleteStages(store);

  const getStageName = (stage: number) => {
    switch (stage) {
      case 1:
        return "1단계: 서비스 개요";
      case 2:
        return "2단계: 디자인 요소";
      case 3:
        return "3단계: 기술 제약사항";
      default:
        return "";
    }
  };

  const handleNavigateToStage = (stage: number) => {
    setCurrentStage(stage as 1 | 2 | 3);
    setShowIncompleteModal(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* PRD 생성 버튼 */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleGeneratePRD}
          className="shadow-strong hover:shadow-strong"
        >
          PRD 생성
        </Button>

        {/* 초기화 버튼 */}
        <Button
          variant="ghost"
          size="md"
          onClick={() => setShowResetConfirm(true)}
          className="shadow-medium"
        >
          초기화
        </Button>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="초기화 확인"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            모든 입력 데이터가 삭제됩니다. 계속하시겠습니까?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
            >
              취소
            </Button>
            <Button variant="primary" onClick={handleReset}>
              확인
            </Button>
          </div>
        </div>
      </Modal>

      {/* Incomplete Input Confirmation Modal */}
      <Modal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        title="입력 확인"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-700 text-base">
            모든 질문에 답하지 않았습니다. 이대로 진행하시겠습니까?
          </p>

          {incompleteStages.length > 0 && (
            <div className="space-y-2 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <p className="text-sm font-medium text-neutral-600">
                답변하지 않은 단계:
              </p>
              <ul className="space-y-1">
                {incompleteStages.map((stage) => (
                  <li key={stage} className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-neutral-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="text-sm text-neutral-600">
                      {getStageName(stage)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setShowIncompleteModal(false)}
            >
              취소
            </Button>
            <Button variant="primary" onClick={handleProceedWithIncomplete}>
              진행하기
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
