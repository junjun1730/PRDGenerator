"use client";

import { motion } from "framer-motion";
import type { ChangeEvent } from "react";
import type { Question } from "../type/types";

type Props = {
  question: Question;
  answer: string;
  onAnswer: (id: number, value: string) => void;
  isActive: boolean;
};

const baseFieldClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300";

const Field = ({
  question,
  answer,
  onAnswer,
}: Pick<Props, "question" | "answer" | "onAnswer">) => {
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onAnswer(question.id, event.target.value);

  if (question.type === "textarea") {
    return (
      <textarea
        className={`${baseFieldClasses} min-h-28 resize-none`}
        placeholder={question.placeholder}
        value={answer}
        onChange={handleChange}
      />
    );
  }

  return (
    <input
      className={baseFieldClasses}
      placeholder={question.placeholder}
      value={answer}
      onChange={handleChange}
    />
  );
};

export const QuestionCard = ({
  question,
  answer,
  onAnswer,
  isActive,
}: Props) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.22 }}
    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
  >
    <div className="flex items-start gap-4">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold ${
          isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {question.id}
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            {question.question}
          </h2>
          {isActive && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
              현재 질문
            </span>
          )}
        </div>
        <Field question={question} answer={answer} onAnswer={onAnswer} />
      </div>
    </div>
  </motion.article>
);
