"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { LuSparkles, LuX } from "react-icons/lu";
import { buildSections } from "../lib/questions";
import type { AnswerMap, Question } from "../type/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  answers: AnswerMap;
  questions: ReadonlyArray<Question>;
  isGenerating: boolean;
  generatedPrd: string;
};

export const PRDModal = ({
  isOpen,
  onClose,
  onSubmit,
  answers,
  questions,
  isGenerating,
  generatedPrd,
}: Props) => {
  const t = useTranslations("HomePage");
  const sections = buildSections(questions, answers);

  const hasGeneratedPrd = generatedPrd.trim().length > 0;

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
                  {t("modalAuto")}
                </p>
                <h3 className="text-lg font-bold text-slate-900">
                  {t("modalDraft")}
                </h3>
              </div>
              <button
                aria-label={t("close")}
                onClick={onClose}
                className="ml-auto rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <LuX className="h-5 w-5" />
              </button>
            </header>

            <section className="grid gap-3 overflow-y-auto sm:max-h-[60vh]">
              {isGenerating ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-slate-600">Generating PRD...</p>
                </div>
              ) : hasGeneratedPrd ? (
                <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-sans text-sm text-slate-900">
                  {generatedPrd}
                </pre>
              ) : (
                sections.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {section.label}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-900">
                      {section.value || t("empty")}
                    </p>
                  </div>
                ))
              )}
            </section>

            <footer className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {t("close")}
              </button>
              {!hasGeneratedPrd && (
                <button
                  onClick={onSubmit}
                  disabled={isGenerating}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {t("saveDraft")}
                </button>
              )}
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
