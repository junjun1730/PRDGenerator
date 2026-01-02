import {
  stage1Schema,
  stage2Schema,
  stage3Schema,
} from '../validation/questionnaireSchemas';
import type { QuestionnaireStore } from '../types/questionnaire';

/**
 * Check if a specific stage is complete (passes validation)
 */
export const isStageComplete = (
  stageNumber: 1 | 2 | 3,
  store: QuestionnaireStore
): boolean => {
  try {
    switch (stageNumber) {
      case 1:
        return stage1Schema.safeParse(store.stage1).success;
      case 2:
        return stage2Schema.safeParse(store.stage2).success;
      case 3:
        return stage3Schema.safeParse(store.stage3).success;
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error validating stage ${stageNumber}:`, error);
    return false;
  }
};

/**
 * Check if user can proceed to a target stage
 * (all previous stages must be complete)
 */
export const canProceedToStage = (
  targetStage: 1 | 2 | 3,
  store: QuestionnaireStore
): boolean => {
  if (targetStage === 1) return true;
  if (targetStage === 2) return isStageComplete(1, store);
  if (targetStage === 3) {
    return isStageComplete(1, store) && isStageComplete(2, store);
  }
  return false;
};

/**
 * Check if all stages are complete
 */
export const areAllStagesComplete = (store: QuestionnaireStore): boolean => {
  return (
    isStageComplete(1, store) &&
    isStageComplete(2, store) &&
    isStageComplete(3, store)
  );
};

/**
 * Get incomplete stages
 * Returns array of stage numbers that are not complete
 */
export const getIncompleteStages = (
  store: QuestionnaireStore
): number[] => {
  const incomplete: number[] = [];

  if (!isStageComplete(1, store)) incomplete.push(1);
  if (!isStageComplete(2, store)) incomplete.push(2);
  if (!isStageComplete(3, store)) incomplete.push(3);

  return incomplete;
};

/**
 * Get stage completion percentage
 */
export const getStageCompletionPercentage = (
  store: QuestionnaireStore
): number => {
  let completedCount = 0;

  if (isStageComplete(1, store)) completedCount++;
  if (isStageComplete(2, store)) completedCount++;
  if (isStageComplete(3, store)) completedCount++;

  return Math.round((completedCount / 3) * 100);
};
