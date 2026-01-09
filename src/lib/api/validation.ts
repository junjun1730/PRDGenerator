import { z } from 'zod';

// Stage 1 validation schema
const stage1Schema = z.object({
  serviceName: z.string().min(1, '서비스 이름은 필수입니다'),
  coreFeatures: z
    .array(z.string())
    .min(1, '핵심 기능은 최소 1개 이상 입력해야 합니다'),
  mainScreens: z.string(),
  userJourney: z.string(),
  serviceMood: z.string(),
});

// Stage 2 validation schema
const stage2Schema = z.object({
  themes: z.array(z.string()),
  brandKeywords: z.array(z.string()),
  colorSystem: z.object({
    primary: z.string(),
    background: z.string(),
  }),
  typography: z.enum(['gothic', 'serif', 'custom']),
  customFont: z.string().optional(),
  uiDetails: z.object({
    buttonRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
    iconWeight: z.enum(['thin', 'regular', 'bold']),
    shadowIntensity: z.enum(['none', 'sm', 'md', 'lg']),
  }),
  references: z.string(),
});

// Stage 3 validation schema
const stage3Schema = z.object({
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
  exceptionHandling: z.string(),
});

// Complete questionnaire data schema
export const questionnaireDataSchema = z.object({
  stage1: stage1Schema,
  stage2: stage2Schema,
  stage3: stage3Schema,
  currentStage: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  // Note: Set is serialized as array in JSON
  completedStages: z.array(z.number()).or(z.any()),
});

// Create PRD request schema
export const createPrdSchema = z.object({
  questionnaire_data: questionnaireDataSchema,
});

// Update PRD request schema
export const updatePrdSchema = z.object({
  questionnaire_data: questionnaireDataSchema.optional(),
  generated_prd: z.string().nullable().optional(),
});

// Pagination query params schema
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, '페이지는 1 이상이어야 합니다')
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, '페이지 크기는 1 이상이어야 합니다')
    .max(100, '페이지 크기는 최대 100입니다')
    .default(10),
});

// UUID validation schema
export const uuidSchema = z
  .string()
  .uuid('올바르지 않은 문서 ID 형식입니다');

// Maximum payload size (100KB)
export const MAX_PAYLOAD_SIZE = 100 * 1024;

/**
 * Validate payload size
 */
export function validatePayloadSize(data: unknown): void {
  const size = JSON.stringify(data).length;
  if (size > MAX_PAYLOAD_SIZE) {
    throw new Error('데이터 크기가 너무 큽니다 (최대 100KB)');
  }
}
