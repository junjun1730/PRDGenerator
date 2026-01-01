import Header from '@/components/layout/Header';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';
import FloatingActions from '@/components/layout/FloatingActions';
import Card from '@/components/ui/Card';

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

          {/* Questionnaire Placeholder */}
          <div className="max-w-4xl mx-auto space-y-8">
            <Card shadow="medium" padding="lg">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                1단계: 서비스 개요
              </h2>
              <p className="text-neutral-600">
                질문지 컴포넌트가 여기에 표시됩니다.
              </p>
            </Card>

            <Card shadow="soft" padding="lg">
              <h2 className="text-2xl font-semibold text-neutral-400 mb-4">
                2단계: 디자인 요소
              </h2>
              <p className="text-neutral-400">
                1단계 완료 후 활성화됩니다.
              </p>
            </Card>

            <Card shadow="soft" padding="lg">
              <h2 className="text-2xl font-semibold text-neutral-400 mb-4">
                3단계: 기술 제약사항
              </h2>
              <p className="text-neutral-400">
                2단계 완료 후 활성화됩니다.
              </p>
            </Card>
          </div>
        </ResponsiveContainer>
      </main>

      <FloatingActions />
    </div>
  );
}
