export type QuestionType = "text" | "textarea";

export interface Question {
  id: number;
  question: string;
  placeholder: string;
  type?: QuestionType;
}

export type AnswerMap = Record<number, string>;
