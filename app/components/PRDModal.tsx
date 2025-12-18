"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LuSparkles, LuX } from "react-icons/lu";
import { buildSections } from "../lib/questions";
import type { AnswerMap, Question } from "../type/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  answers: AnswerMap;
  questions: ReadonlyArray<Question>;
};

export const PRDModal = ({ isOpen, onClose, answers, questions }: Props) => {
  const sections = buildSections(questions, answers);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-lg"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800">
                <LuSparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  자동 생성
                </p>
                <h3 className="text-lg font-bold text-slate-900">초안 PRD</h3>
              </div>
              <button
                aria-label="닫기"
                onClick={onClose}
                className="ml-auto rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <LuX className="h-5 w-5" />
              </button>
            </header>

            <section className="grid gap-3 overflow-y-auto sm:max-h-[60vh]">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {section.label}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-900">
                    {section.value || "내용이 없습니다."}
                  </p>
                </div>
              ))}
            </section>

            <footer className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                닫기
              </button>
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                초안 저장
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
