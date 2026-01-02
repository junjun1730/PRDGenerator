'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useQuestionnaireStore } from '@/lib/store/useQuestionnaireStore';
import { stage2Schema } from '@/lib/validation/questionnaireSchemas';
import QuestionWrapper from './QuestionWrapper';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import RadioGroup, { RadioOption } from '@/components/ui/RadioGroup';
import DynamicArrayInput from './DynamicArrayInput';
import ThemeSelector from './ThemeSelector';
import ColorSystemInput from './ColorSystemInput';
import UIDetailsPanel from './UIDetailsPanel';
import type { Stage2Data } from '@/lib/types/questionnaire';

export default function Stage2Form() {
  const stage2 = useQuestionnaireStore((state) => state.stage2);
  const updateStage2 = useQuestionnaireStore((state) => state.updateStage2);

  const form = useForm<Stage2Data>({
    resolver: zodResolver(stage2Schema),
    defaultValues: stage2,
    mode: 'onChange',
  });

  // Progressive reveal state
  const [visibleQuestions, setVisibleQuestions] = useState([
    true,
    true, // Brand keywords always visible
    false,
    false,
    false,
    false,
  ]);

  // Watch form values
  const themes = form.watch('themes');
  const brandKeywords = form.watch('brandKeywords');
  const colorSystem = form.watch('colorSystem');
  const typography = form.watch('typography');
  const uiDetails = form.watch('uiDetails');

  // Update visible questions
  useEffect(() => {
    setVisibleQuestions([
      true, // Theme selector always visible
      true, // Brand keywords always visible
      !!brandKeywords && brandKeywords.length >= 1,
      !!colorSystem?.primary && !!colorSystem?.background,
      !!typography,
      !!uiDetails?.buttonRadius,
    ]);
  }, [themes, brandKeywords, colorSystem, typography, uiDetails]);

  // Auto-save to Zustand store
  useEffect(() => {
    const subscription = form.watch((formData) => {
      updateStage2(formData as Stage2Data);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateStage2]);

  const typographyOptions: RadioOption[] = [
    {
      value: 'gothic',
      label: '고딕체 (Sans-serif)',
      description: '깔끔하고 현대적인 느낌',
    },
    {
      value: 'serif',
      label: '명조체 (Serif)',
      description: '전통적이고 격식있는 느낌',
    },
    {
      value: 'custom',
      label: '커스텀 폰트',
      description: '직접 폰트 이름을 입력합니다',
    },
  ];

  return (
    <form className="space-y-8">
      {/* Theme Selector - Always Visible */}
      <QuestionWrapper isVisible={visibleQuestions[0]} delay={0}>
        <ThemeSelector
          selectedThemes={form.watch('themes') || []}
          onChange={(themes) => form.setValue('themes', themes)}
          error={form.formState.errors.themes?.message}
        />
      </QuestionWrapper>

      {/* Question 1: Brand Keywords - Always Visible */}
      <QuestionWrapper isVisible={visibleQuestions[1]} delay={150}>
        <DynamicArrayInput
          control={form.control}
          name="brandKeywords"
          label="브랜드 키워드 (최대 3개)"
          placeholder="예: 혁신적인"
          maxItems={3}
          helperText="브랜드를 대표하는 키워드를 입력해주세요 (최대 3개)"
          error={form.formState.errors.brandKeywords?.message}
        />
      </QuestionWrapper>

      {/* Question 2: Color System */}
      <QuestionWrapper isVisible={visibleQuestions[2]} delay={300}>
        <ColorSystemInput
          control={form.control}
          primaryValue={form.watch('colorSystem.primary') || ''}
          backgroundValue={form.watch('colorSystem.background') || ''}
          darkModeValue={form.watch('colorSystem.darkModeSupport') || false}
          onPrimaryChange={(value) =>
            form.setValue('colorSystem.primary', value)
          }
          onBackgroundChange={(value) =>
            form.setValue('colorSystem.background', value)
          }
          onDarkModeChange={(value) =>
            form.setValue('colorSystem.darkModeSupport', value)
          }
          errors={{
            primary: form.formState.errors.colorSystem?.primary?.message,
            background: form.formState.errors.colorSystem?.background?.message,
          }}
        />
      </QuestionWrapper>

      {/* Question 3: Typography */}
      <QuestionWrapper isVisible={visibleQuestions[3]} delay={450}>
        <div className="space-y-4">
          <RadioGroup
            label="타이포그래피 선택"
            options={typographyOptions}
            value={form.watch('typography')}
            onChange={(value) =>
              form.setValue('typography', value as 'gothic' | 'serif' | 'custom')
            }
            error={form.formState.errors.typography?.message}
          />

          {/* Custom Font Input */}
          {form.watch('typography') === 'custom' && (
            <div className="ml-4 pl-4 border-l-2 border-brand-300 opacity-0 animate-slideInUp">
              <Input
                {...form.register('customFont')}
                label="커스텀 폰트 이름"
                placeholder="예: Pretendard, Noto Sans KR"
                helperText="사용하려는 폰트의 정확한 이름을 입력해주세요"
                error={form.formState.errors.customFont?.message}
              />
            </div>
          )}
        </div>
      </QuestionWrapper>

      {/* Question 4: UI Details */}
      <QuestionWrapper isVisible={visibleQuestions[4]} delay={600}>
        <UIDetailsPanel
          buttonRadius={form.watch('uiDetails.buttonRadius')}
          iconWeight={form.watch('uiDetails.iconWeight')}
          shadowIntensity={form.watch('uiDetails.shadowIntensity')}
          onButtonRadiusChange={(value) =>
            form.setValue('uiDetails.buttonRadius', value)
          }
          onIconWeightChange={(value) =>
            form.setValue('uiDetails.iconWeight', value)
          }
          onShadowIntensityChange={(value) =>
            form.setValue('uiDetails.shadowIntensity', value)
          }
          errors={{
            buttonRadius:
              form.formState.errors.uiDetails?.buttonRadius?.message,
            iconWeight: form.formState.errors.uiDetails?.iconWeight?.message,
            shadowIntensity:
              form.formState.errors.uiDetails?.shadowIntensity?.message,
          }}
        />
      </QuestionWrapper>

      {/* Question 5: References */}
      <QuestionWrapper isVisible={visibleQuestions[5]} delay={750}>
        <Textarea
          {...form.register('references')}
          label="레퍼런스 (선택사항)"
          placeholder="예: https://example.com 과 유사한 느낌, 애플 디자인 가이드라인 참고"
          helperText="참고하고 싶은 디자인이나 서비스가 있다면 작성해주세요"
          error={form.formState.errors.references?.message}
          maxCharacters={9999}
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
              2단계 질문을 모두 완료했습니다! 3단계로 이동해주세요.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
