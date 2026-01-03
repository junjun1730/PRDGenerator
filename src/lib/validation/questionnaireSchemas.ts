import { z } from 'zod';

// Stage 1: Service Overview Schema
export const stage1Schema = z.object({
  serviceName: z
    .string()
    .max(9999, '서비스 이름은 9999자 이하여야 합니다.'),

  coreFeatures: z
    .array(z.string())
    .max(3, '최대 3개까지 입력 가능합니다.'),

  mainScreens: z
    .string()
    .max(9999, '화면 구성 설명은 9999자 이하여야 합니다.'),

  userJourney: z
    .string()
    .max(9999, '사용자 여정 설명은 9999자 이하여야 합니다.'),

  serviceMood: z
    .string()
    .max(9999, '서비스 분위기 설명은 9999자 이하여야 합니다.'),
});

// Stage 2: Design Elements Schema
export const stage2Schema = z
  .object({
    themes: z.array(z.string()),

    brandKeywords: z
      .array(z.string())
      .max(3, '브랜드 키워드는 최대 3개까지 입력 가능합니다.'),

    colorSystem: z.object({
      primary: z.string(),
      background: z.string(),
    }),

    typography: z.enum(['gothic', 'serif', 'custom']).optional(),

    customFont: z.string().optional(),

    uiDetails: z.object({
      buttonRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).optional(),
      iconWeight: z.enum(['thin', 'regular', 'bold']).optional(),
      shadowIntensity: z.enum(['none', 'sm', 'md', 'lg']).optional(),
    }),

    references: z
      .string()
      .max(9999, '레퍼런스 설명은 9999자 이하여야 합니다.'),
  });

// Stage 3: Technical Constraints Schema
export const stage3Schema = z.object({
  techStack: z.object({
    frontend: z.array(z.string()),
    database: z.array(z.string()),
    backend: z.array(z.string()),
    other: z.array(z.string()),
  }),

  dataManagement: z.object({
    realtimeRequired: z.boolean(),
    largeMediaHandling: z.boolean(),
  }),

  externalAPIs: z.array(z.string()),

  authMethod: z.enum(['email', 'two-factor']).optional(),

  exceptionHandling: z
    .string()
    .max(9999, '예외 상황 처리 설명은 9999자 이하여야 합니다.'),
});

// Export types inferred from schemas
export type Stage1FormData = z.infer<typeof stage1Schema>;
export type Stage2FormData = z.infer<typeof stage2Schema>;
export type Stage3FormData = z.infer<typeof stage3Schema>;
