'use client';

import Header from '@/components/layout/Header';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';
import FloatingActions from '@/components/layout/FloatingActions';
import QuestionnaireContainer from '@/components/questionnaire/QuestionnaireContainer';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="pb-32">
        <ResponsiveContainer className="py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              AI PRD Generator
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              아이디어를 빠르게 문서화하는 AI 기반 프로젝트 기획서 생성 서비스
            </p>
          </div>

          {/* Questionnaire */}
          <QuestionnaireContainer />
        </ResponsiveContainer>
      </main>

      <FloatingActions />
    </div>
  );
}
