'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useQuestionnaireStore } from '@/lib/store/useQuestionnaireStore';
import { stage3Schema } from '@/lib/validation/questionnaireSchemas';
import QuestionWrapper from './QuestionWrapper';
import Textarea from '@/components/ui/Textarea';
import RadioGroup, { RadioOption } from '@/components/ui/RadioGroup';
import Toggle from '@/components/ui/Toggle';
import DynamicArrayInput from './DynamicArrayInput';
import TechStackSelector from './TechStackSelector';
import type { Stage3Data } from '@/lib/types/questionnaire';

export default function Stage3Form() {
  const stage3 = useQuestionnaireStore((state) => state.stage3);
  const updateStage3 = useQuestionnaireStore((state) => state.updateStage3);

  const form = useForm<Stage3Data>({
    resolver: zodResolver(stage3Schema),
    defaultValues: stage3,
    mode: 'onChange',
  });

  // Progressive reveal state
  const [visibleQuestions, setVisibleQuestions] = useState([
    true,
    false,
    false,
    false,
    false,
  ]);

  // Watch form values
  const techStack = form.watch('techStack');
  const dataManagement = form.watch('dataManagement');
  const externalAPIs = form.watch('externalAPIs');
  const authMethod = form.watch('authMethod');

  // Update visible questions
  useEffect(() => {
    setVisibleQuestions([
      true, // Tech stack always visible
      techStack &&
        techStack.frontend?.length >= 1 &&
        techStack.backend?.length >= 1,
      dataManagement !== undefined,
      true, // External APIs optional, so always show after data management
      authMethod !== undefined && authMethod !== null,
    ]);
  }, [techStack, dataManagement, externalAPIs, authMethod]);

  // Auto-save to Zustand store
  useEffect(() => {
    const subscription = form.watch((formData) => {
      updateStage3(formData as Stage3Data);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateStage3]);

  const authMethodOptions: RadioOption[] = [
    {
      value: 'email',
      label: '이메일 인증',
      description: '이메일 + 비밀번호 기반 인증',
    },
    {
      value: 'two-factor',
      label: '2단계 인증',
      description: 'SMS, OTP 등 추가 인증 단계',
    },
    {
      value: 'biometric',
      label: '생체 인증',
      description: '지문, 얼굴 인식 등 생체 인증',
    },
  ];

  return (
    <form className="space-y-8">
      {/* Question 1: Tech Stack */}
      <QuestionWrapper isVisible={visibleQuestions[0]} delay={0}>
        <TechStackSelector
          frontend={form.watch('techStack.frontend') || []}
          backend={form.watch('techStack.backend') || []}
          onFrontendChange={(selected) =>
            form.setValue('techStack.frontend', selected)
          }
          onBackendChange={(selected) =>
            form.setValue('techStack.backend', selected)
          }
          errors={{
            frontend: form.formState.errors.techStack?.frontend?.message,
            backend: form.formState.errors.techStack?.backend?.message,
          }}
        />
      </QuestionWrapper>

      {/* Question 2: Data Management */}
      <QuestionWrapper isVisible={visibleQuestions[1]} delay={150}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              데이터 관리 옵션
            </label>
            <p className="text-xs text-neutral-500 mb-4">
              서비스에 필요한 데이터 처리 방식을 선택해주세요
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-lg border-2 border-neutral-200 bg-neutral-50">
            <Toggle
              checked={form.watch('dataManagement.realtimeRequired') || false}
              onChange={(e) =>
                form.setValue('dataManagement.realtimeRequired', e.target.checked)
              }
              label="실시간 데이터 처리 필요"
              description="채팅, 알림 등 실시간 동기화가 필요한 기능"
            />

            <Toggle
              checked={form.watch('dataManagement.largeMediaHandling') || false}
              onChange={(e) =>
                form.setValue('dataManagement.largeMediaHandling', e.target.checked)
              }
              label="대용량 미디어 처리 필요"
              description="이미지, 비디오 등 큰 파일 업로드/다운로드"
            />
          </div>
        </div>
      </QuestionWrapper>

      {/* Question 3: External APIs */}
      <QuestionWrapper isVisible={visibleQuestions[2]} delay={300}>
        <div className="space-y-4">
          <DynamicArrayInput
            control={form.control}
            name="externalAPIs"
            label="외부 API 연동 (선택사항)"
            placeholder="예: 카카오페이, 구글 지도"
            maxItems={10}
            helperText="연동이 필요한 외부 서비스나 API가 있다면 입력해주세요"
            error={form.formState.errors.externalAPIs?.message}
          />

          <div className="p-3 bg-brand-50 rounded-lg border border-brand-200">
            <p className="text-xs text-brand-700">
              <strong>참고:</strong> 결제, 지도, 소셜 로그인, SMS 등 외부 서비스 API를
              입력해주세요
            </p>
          </div>
        </div>
      </QuestionWrapper>

      {/* Question 4: Auth Method */}
      <QuestionWrapper isVisible={visibleQuestions[3]} delay={450}>
        <RadioGroup
          label="보안 및 인증 방식"
          options={authMethodOptions}
          value={form.watch('authMethod')}
          onChange={(value) =>
            form.setValue('authMethod', value as 'email' | 'two-factor' | 'biometric')
          }
          error={form.formState.errors.authMethod?.message}
        />
      </QuestionWrapper>

      {/* Question 5: Edge Cases */}
      <QuestionWrapper isVisible={visibleQuestions[4]} delay={600}>
        <Textarea
          {...form.register('edgeCases')}
          label="예외 상황 및 엣지 케이스 대응 정책"
          placeholder="예: 네트워크 오류 시 로컬 저장 후 재시도, 중복 요청 방지, 동시 편집 충돌 해결 등"
          helperText="서비스에서 발생할 수 있는 예외 상황과 처리 방법을 설명해주세요 (최소 20자)"
          error={form.formState.errors.edgeCases?.message}
          maxCharacters={1000}
          autoResize
          className="focus:shadow-glow-md focus:scale-102 transition-all duration-normal ease-spring"
        />
      </QuestionWrapper>

      {/* Completion Indicator */}
      {visibleQuestions.every((v) => v) && (
        <div className="pt-6 border-t border-neutral-200 opacity-0 animate-fadeIn">
          <div className="flex items-center gap-2 text-success-600">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">
              3단계 질문을 모두 완료했습니다! 이제 PRD를 생성할 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
