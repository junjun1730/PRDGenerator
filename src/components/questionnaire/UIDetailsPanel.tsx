'use client';

import RadioGroup, { RadioOption } from '@/components/ui/RadioGroup';
import { cn } from '@/lib/utils/cn';

interface UIDetailsPanelProps {
  buttonRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  iconWeight: 'thin' | 'regular' | 'bold';
  shadowIntensity: 'none' | 'sm' | 'md' | 'lg';
  onButtonRadiusChange: (value: 'none' | 'sm' | 'md' | 'lg' | 'full') => void;
  onIconWeightChange: (value: 'thin' | 'regular' | 'bold') => void;
  onShadowIntensityChange: (value: 'none' | 'sm' | 'md' | 'lg') => void;
  errors?: {
    buttonRadius?: string;
    iconWeight?: string;
    shadowIntensity?: string;
  };
}

export default function UIDetailsPanel({
  buttonRadius,
  iconWeight,
  shadowIntensity,
  onButtonRadiusChange,
  onIconWeightChange,
  onShadowIntensityChange,
  errors,
}: UIDetailsPanelProps) {
  const buttonRadiusOptions: RadioOption[] = [
    {
      value: 'none',
      label: '각진 (0px)',
      description: '모서리가 직각인 디자인',
      visualExample: (
        <div className="w-24 h-10 bg-brand-500 rounded-none flex items-center justify-center text-white text-xs font-medium">
          버튼
        </div>
      ),
    },
    {
      value: 'sm',
      label: '약간 둥근 (4px)',
      description: '살짝 부드러운 모서리',
      visualExample: (
        <div className="w-24 h-10 bg-brand-500 rounded flex items-center justify-center text-white text-xs font-medium">
          버튼
        </div>
      ),
    },
    {
      value: 'md',
      label: '중간 둥근 (8px)',
      description: '적당히 둥근 모서리',
      visualExample: (
        <div className="w-24 h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white text-xs font-medium">
          버튼
        </div>
      ),
    },
    {
      value: 'lg',
      label: '많이 둥근 (12px)',
      description: '상당히 둥근 모서리',
      visualExample: (
        <div className="w-24 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white text-xs font-medium">
          버튼
        </div>
      ),
    },
    {
      value: 'full',
      label: '완전 둥근 (pill)',
      description: '캡슐 모양',
      visualExample: (
        <div className="w-24 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
          버튼
        </div>
      ),
    },
  ];

  const iconWeightOptions: RadioOption[] = [
    {
      value: 'thin',
      label: '얇은',
      description: '섬세하고 가벼운 느낌',
      visualExample: (
        <svg className="w-8 h-8 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      value: 'regular',
      label: '보통',
      description: '균형 잡힌 굵기',
      visualExample: (
        <svg className="w-8 h-8 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      value: 'bold',
      label: '굵은',
      description: '강하고 선명한 느낌',
      visualExample: (
        <svg className="w-8 h-8 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
  ];

  const shadowIntensityOptions: RadioOption[] = [
    {
      value: 'none',
      label: '없음',
      description: '그림자 없는 플랫한 디자인',
      visualExample: (
        <div className="w-24 h-16 bg-white border border-neutral-200 rounded-lg flex items-center justify-center">
          <span className="text-xs text-neutral-600">카드</span>
        </div>
      ),
    },
    {
      value: 'sm',
      label: '약한',
      description: '은은한 그림자',
      visualExample: (
        <div className="w-24 h-16 bg-white shadow-sm rounded-lg flex items-center justify-center">
          <span className="text-xs text-neutral-600">카드</span>
        </div>
      ),
    },
    {
      value: 'md',
      label: '중간',
      description: '적당한 깊이감',
      visualExample: (
        <div className="w-24 h-16 bg-white shadow-md rounded-lg flex items-center justify-center">
          <span className="text-xs text-neutral-600">카드</span>
        </div>
      ),
    },
    {
      value: 'lg',
      label: '강한',
      description: '뚜렷한 입체감',
      visualExample: (
        <div className="w-24 h-16 bg-white shadow-lg rounded-lg flex items-center justify-center">
          <span className="text-xs text-neutral-600">카드</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          UI 디테일 설정
        </label>
        <p className="text-xs text-neutral-500">
          버튼, 아이콘, 그림자 스타일을 선택해주세요
        </p>
      </div>

      {/* Button Radius */}
      <div>
        <RadioGroup
          label="버튼 곡률"
          options={buttonRadiusOptions}
          value={buttonRadius}
          onChange={(value) => onButtonRadiusChange(value as any)}
          showVisualExamples
          error={errors?.buttonRadius}
        />
      </div>

      {/* Icon Weight */}
      <div>
        <RadioGroup
          label="아이콘 굵기"
          options={iconWeightOptions}
          value={iconWeight}
          onChange={(value) => onIconWeightChange(value as any)}
          showVisualExamples
          layout="horizontal"
          error={errors?.iconWeight}
        />
      </div>

      {/* Shadow Intensity */}
      <div>
        <RadioGroup
          label="그림자 강도"
          options={shadowIntensityOptions}
          value={shadowIntensity}
          onChange={(value) => onShadowIntensityChange(value as any)}
          showVisualExamples
          layout="horizontal"
          error={errors?.shadowIntensity}
        />
      </div>
    </div>
  );
}
