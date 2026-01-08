import type { QuestionnaireState } from '@/lib/types/questionnaire';

/**
 * Database table: prd_documents
 * Stores user questionnaire data and generated PRD content
 */
export interface PrdDocument {
  id: string;
  user_id: string | null;
  questionnaire_data: QuestionnaireState;
  generated_prd: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Insert payload for creating new PRD document
 */
export type PrdDocumentInsert = Omit<
  PrdDocument,
  'id' | 'created_at' | 'updated_at'
>;

/**
 * Update payload for modifying existing PRD document
 */
export type PrdDocumentUpdate = Partial<
  Pick<PrdDocument, 'questionnaire_data' | 'generated_prd'>
>;
