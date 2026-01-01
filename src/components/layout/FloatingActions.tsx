'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useQuestionnaireStore } from '@/lib/store/useQuestionnaireStore';

export default function FloatingActions() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const resetAll = useQuestionnaireStore((state) => state.resetAll);

  const handleReset = () => {
    resetAll();
    setShowResetConfirm(false);
  };

  const handleGeneratePRD = () => {
    // TODO: Implement PRD generation modal
    alert('PRD 생성 기능은 다음 단계에서 구현됩니다.');
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
    </>
  );
}
