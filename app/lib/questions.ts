import type { AnswerMap, Question } from "../type/types";

const trimValue = (value: string) => value.trim();

export const QUESTIONS: ReadonlyArray<Question> = [
  {
    id: 1,
    question: "서비스의 이름을 알려주세요",
    placeholder: "예: TaskFlow",
    type: "text",
  },
  {
    id: 2,
    question: "서비스를 한 줄로 설명해주세요",
    placeholder: "예: 팀 협업을 위한 스마트한 작업 관리 도구",
    type: "text",
  },
  {
    id: 3,
    question: "타겟 사용자는 누구인가요?",
    placeholder: "예: 스타트업 팀, 프리랜서, 소규모 비즈니스",
    type: "textarea",
  },
  {
    id: 4,
    question: "해결하고자 하는 문제는 무엇인가요?",
    placeholder: "예: 팀 간 커뮤니케이션 비효율, 작업 진행 상황 추적 어려움",
    type: "textarea",
  },
  {
    id: 5,
    question: "핵심 기능을 알려주세요 (최대 5개)",
    placeholder:
      "각 기능을 줄바꿈으로 구분해주세요\n예:\n- 실시간 협업 보드\n- 작업 자동 할당\n- 진행률 대시보드",
    type: "textarea",
  },
  {
    id: 6,
    question: "예상 출시일은 언제인가요?",
    placeholder: "예: 2025년 3월",
    type: "text",
  },
  {
    id: 7,
    question: "성공 지표는 무엇인가요?",
    placeholder: "예: 월간 활성 사용자 1만명, 사용자 만족도 4.5/5.0",
    type: "textarea",
  },
] as const;

export const initializeAnswers = (
  questionList: ReadonlyArray<Question>
): AnswerMap =>
  questionList.reduce<AnswerMap>(
    (acc, { id }) => ({ ...acc, [id]: "" }),
    {}
  );

export const canGeneratePRD = (
  answers: AnswerMap,
  questionList: ReadonlyArray<Question>
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
