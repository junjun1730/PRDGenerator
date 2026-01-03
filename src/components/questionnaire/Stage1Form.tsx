'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useQuestionnaireStore } from '@/lib/store/useQuestionnaireStore';
import { stage1Schema } from '@/lib/validation/questionnaireSchemas';
import QuestionWrapper from './QuestionWrapper';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import DynamicArrayInput from './DynamicArrayInput';
import type { Stage1Data } from '@/lib/types/questionnaire';

export default function Stage1Form() {
  const stage1 = useQuestionnaireStore((state) => state.stage1);
  const updateStage1 = useQuestionnaireStore((state) => state.updateStage1);

  const form = useForm<Stage1Data>({
    resolver: zodResolver(stage1Schema),
    defaultValues: stage1,
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

  // Watch form values for progressive reveal
  const serviceName = form.watch('serviceName');
  const coreFeatures = form.watch('coreFeatures');
  const mainScreens = form.watch('mainScreens');
  const userJourney = form.watch('userJourney');

  // Update visible questions based on input presence (not validation)
  useEffect(() => {
    setVisibleQuestions([
      true, // Q1 always visible
      !!serviceName,
      !!serviceName && coreFeatures && coreFeatures.length >= 1,
      !!serviceName && !!coreFeatures && !!mainScreens,
      !!serviceName && !!coreFeatures && !!mainScreens && !!userJourney,
    ]);
  }, [serviceName, coreFeatures, mainScreens, userJourney]);

  // Auto-save to Zustand store
  useEffect(() => {
    const subscription = form.watch((formData) => {
      updateStage1(formData as Stage1Data);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateStage1]);

  return (
    <form className="space-y-8">
      {/* Question 1: Service Name */}
      <QuestionWrapper isVisible={visibleQuestions[0]} delay={0}>
        <Input
          {...form.register('serviceName')}
          label="서비스 이름과 한 줄 정의"
          placeholder="예: 타임캡슐 - 미래의 나에게 보내는 메시지 서비스"
          helperText="서비스의 이름과 간단한 설명을 함께 작성해주세요"
          error={form.formState.errors.serviceName?.message}
          className="focus:shadow-glow-md focus:scale-102 transition-all duration-normal ease-spring"
        />
      </QuestionWrapper>

      {/* Question 2: Core Features */}
      <QuestionWrapper isVisible={visibleQuestions[1]} delay={150}>
        <DynamicArrayInput
          control={form.control}
          name="coreFeatures"
          label="핵심 기능 (최대 3개)"
          placeholder="예: 타임캡슐 작성 및 예약 발송"
          maxItems={3}
          helperText="가장 중요한 핵심 기능 3가지를 입력해주세요"
          error={form.formState.errors.coreFeatures?.message}
        />
      </QuestionWrapper>

      {/* Question 3: Main Screens */}
      <QuestionWrapper isVisible={visibleQuestions[2]} delay={300}>
        <Textarea
          {...form.register('mainScreens')}
          label="주요 화면 구성"
          placeholder="예: 홈 화면, 타임캡슐 작성 화면, 캡슐 목록, 마이페이지 등"
          helperText="서비스의 주요 화면들을 설명해주세요"
          error={form.formState.errors.mainScreens?.message}
          autoResize
          className="focus:shadow-glow-md focus:scale-102 transition-all duration-normal ease-spring"
        />
      </QuestionWrapper>

      {/* Question 4: User Journey */}
      <QuestionWrapper isVisible={visibleQuestions[3]} delay={450}>
        <Textarea
          {...form.register('userJourney')}
          label="사용자 플로우 (User Journey)"
          placeholder="예: 회원가입 → 타임캡슐 작성 → 수신일 선택 → 발송 예약 → 알림 받기 → 캡슐 열어보기"
          helperText="사용자가 서비스를 이용하는 전체 과정을 설명해주세요"
          error={form.formState.errors.userJourney?.message}
          autoResize
          className="focus:shadow-glow-md focus:scale-102 transition-all duration-normal ease-spring"
        />
      </QuestionWrapper>

      {/* Question 5: Service Mood */}
      <QuestionWrapper isVisible={visibleQuestions[4]} delay={600}>
        <Textarea
          {...form.register('serviceMood')}
          label="서비스 분위기와 느낌"
          placeholder="예: 따뜻하고 감성적인, 회상을 불러일으키는 느낌, 친근하면서도 프로페셔널한 느낌"
          helperText="서비스에서 전달하고 싶은 전체적인 분위기와 느낌을 자유롭게 설명해주세요"
          error={form.formState.errors.serviceMood?.message}
          autoResize
          className="focus:shadow-glow-md focus:scale-102 transition-all duration-normal ease-spring"
        />
      </QuestionWrapper>
    </form>
  );
}
