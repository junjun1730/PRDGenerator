import type { AnswerMap, Question } from "../type/types";

type QuestionTemplate = {
  id: number;
  questionKey: string;
  placeholderKey: string;
  type?: Question["type"];
};

const trimValue = (value: string) => value.trim();

export const QUESTION_TEMPLATES: ReadonlyArray<QuestionTemplate> = [
  {
    id: 1,
    questionKey: "identity",
    placeholderKey: "identityPlaceholder",
    type: "text",
  },
  {
    id: 2,
    questionKey: "painPoint",
    placeholderKey: "painPointPlaceholder",
    type: "textarea",
  },
  {
    id: 3,
    questionKey: "featuresTop3",
    placeholderKey: "featuresTop3Placeholder",
    type: "textarea",
  },
  {
    id: 4,
    questionKey: "userJourney",
    placeholderKey: "userJourneyPlaceholder",
    type: "textarea",
  },
  {
    id: 5,
    questionKey: "platformStack",
    placeholderKey: "platformStackPlaceholder",
    type: "text",
  },
  {
    id: 6,
    questionKey: "benchmark",
    placeholderKey: "benchmarkPlaceholder",
    type: "textarea",
  },
  {
    id: 7,
    questionKey: "outOfScope",
    placeholderKey: "outOfScopePlaceholder",
    type: "textarea",
  },
  {
    id: 8,
    questionKey: "successMetrics",
    placeholderKey: "successMetricsPlaceholder",
    type: "textarea",
  },
  {
    id: 9,
    questionKey: "extras",
    placeholderKey: "extrasPlaceholder",
    type: "textarea",
  },
] as const;

export const getQuestions = (
  translate: (key: string) => string
): ReadonlyArray<Question> =>
  QUESTION_TEMPLATES.map(({ id, questionKey, placeholderKey, type }) => ({
    id,
    type,
    question: translate(questionKey),
    placeholder: translate(placeholderKey),
  }));

export const initializeAnswers = <T extends { id: number }>(
  questionList: ReadonlyArray<T>
): AnswerMap =>
  questionList.reduce<AnswerMap>((acc, { id }) => ({ ...acc, [id]: "" }), {});

export const canGeneratePRD = <T extends { id: number }>(
  answers: AnswerMap,
  questionList: ReadonlyArray<T>
) => questionList.every(({ id }) => Boolean(trimValue(answers[id] ?? "")));

export const answeredCount = (answers: AnswerMap) =>
  Object.values(answers).filter((value) => Boolean(trimValue(value))).length;

export const nextQuestionId = (
  currentId: number,
  answer: string,
  total: number
) => (trimValue(answer) ? Math.min(currentId + 1, total + 1) : currentId);

export const buildSections = (
  questionList: ReadonlyArray<Question>,
  answers: AnswerMap
) =>
  questionList.map(({ id, question }) => ({
    id,
    label: question,
    value: trimValue(answers[id] ?? ""),
  }));
