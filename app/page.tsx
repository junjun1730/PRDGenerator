"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { LuSparkles } from "react-icons/lu";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { PRDModal } from "./components/PRDModal";
import { QuestionCard } from "./components/QuestionCard";
import {
  QUESTION_TEMPLATES,
  answeredCount,
  getQuestions,
  initializeAnswers,
  nextQuestionId,
} from "./lib/questions";
import type { AnswerMap } from "./type/types";

const AUTO_ADVANCE_DELAY = 280;

export default function Page() {
  const t = useTranslations("HomePage");
  const tq = useTranslations("questions");
  const questions = useMemo(() => getQuestions(tq), [tq]);

  const [answers, setAnswers] = useState<AnswerMap>(() =>
    initializeAnswers(QUESTION_TEMPLATES)
  );
  const [currentQuestion, setCurrentQuestion] = useState<number>(
    questions[0]?.id ?? 1
  );
  const [showModal, setShowModal] = useState(false);

  const progress = useMemo(
    () => ({
      completed: answeredCount(answers),
      total: questions.length,
    }),
    [answers, questions.length]
  );

  const hasAnyAnswer = useMemo(
    () => answeredCount(answers) > 0,
    [answers]
  );

  const progressPercent = useMemo(
    () =>
      Math.min(100, Math.round((progress.completed / progress.total) * 100)),
    [progress.completed, progress.total]
  );

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    const nextId = nextQuestionId(questionId, answer, questions.length);
    if (nextId !== currentQuestion) {
      setTimeout(() => setCurrentQuestion(nextId), AUTO_ADVANCE_DELAY);
    }
  };

  const handleGenerate = () => {
    if (hasAnyAnswer) setShowModal(true);
  };

  const handleReset = () => {
    setAnswers(initializeAnswers(QUESTION_TEMPLATES));
    setCurrentQuestion(questions[0]?.id ?? 1);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-5 sm:px-6">
          <motion.div
            animate={{ rotate: [0, 4, 0] }}
            transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm"
          >
            <LuSparkles className="h-5 w-5" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-slate-600">
              {t("badge")}
            </p>
            <h1 className="text-lg font-bold text-slate-900">
              {t("headerTitle")}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {progress.completed} / {progress.total}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-3 sm:px-6">
          <div className="h-1 rounded-full bg-slate-100">
            <motion.div
              className="h-1 rounded-full bg-slate-900"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <p className="text-base text-slate-700">{t("subtitle")}</p>
        </motion.div>

        <div className="mb-8 space-y-6">
          {questions.map((question) => (
            <AnimatePresence key={question.id}>
              {currentQuestion >= question.id && (
                <QuestionCard
                  question={question}
                  answer={answers[question.id] ?? ""}
                  onAnswer={handleAnswer}
                  isActive={currentQuestion === question.id}
                />
              )}
            </AnimatePresence>
          ))}
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <motion.button
              onClick={handleGenerate}
              disabled={!hasAnyAnswer}
              whileHover={{ y: hasAnyAnswer ? -2 : 0 }}
              whileTap={{ y: 0 }}
              className={`flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold transition ${
                hasAnyAnswer
                  ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              <LuSparkles className="h-4 w-4" />
              {t("generate")}
            </motion.button>
            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              {t("reset")}
            </button>
          </motion.div>
        </AnimatePresence>
      </main>

      <PRDModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        answers={answers}
        questions={questions}
      />
    </div>
  );
}
