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
      // Show incomplete stages modal
      setShowIncompleteModal(true);
    }
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

      {/* Incomplete Stages Modal */}
      <Modal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        title="단계 완료 필요"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            모든 단계를 완료한 후 PRD를 생성할 수 있습니다.
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">
              미완료 단계:
            </p>
            <ul className="space-y-2">
              {incompleteStages.map((stage) => (
                <li key={stage}>
                  <button
                    onClick={() => handleNavigateToStage(stage)}
                    className="flex items-center gap-2 w-full p-3 text-left rounded-lg border-2 border-error-200 bg-error-50 hover:bg-error-100 hover:border-error-300 transition-all duration-normal"
                  >
                    <svg
                      className="h-5 w-5 text-error-600 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-error-700">
                      {getStageName(stage)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setShowIncompleteModal(false)}
            >
              닫기
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
