# AI PRD Generator 개발 체크리스트

> **프로젝트 개요**: AI 기반 PRD(Product Requirements Document) 자동 생성 서비스
> **목표**: 3단계 질문을 통해 사용자 아이디어를 체계적인 기획서로 변환

---

## 📋 Phase 1: 핵심 UI 개발

### 1-1. 질문지 폼 컴포넌트 구현

#### 1단계: 서비스 개요 질문

- [x] Q1. 서비스 명칭 및 정의 입력 폼
- [x] Q2. 핵심 기능(Top 3) 입력 폼 (동적 추가/삭제)
- [x] Q3. 주요 화면 구성 입력 폼
- [x] Q4. 사용자 플로우(User Journey) 입력 폼
- [x] Q5. 톤앤매너 선택/입력 폼

#### 2단계: 디자인 요소 질문

- [x] 테마 옵션 버튼 (미니멀, 화려한 인터랙션, 신뢰감, 귀여운 등) - 다중 선택
- [x] Q1. 브랜드 키워드 입력 (3개)
- [x] Q2. 컬러 시스템 설정 (Primary, Background, 다크모드 토글)
- [x] Q3. 타이포그래피 선택 (고딕/명조/커스텀)
- [x] Q4. UI 디테일 설정 (버튼 곡률, 아이콘 굵기, 그림자 효과)
- [x] Q5. 레퍼런스 입력 폼

#### 3단계: 기술 제약 질문

- [x] Q1. 기술 스택 선택 (Frontend/Backend 멀티 셀렉트)
- [x] Q2. 데이터 관리 옵션 (실시간 처리, 대용량 미디어)
- [x] Q3. 외부 API 연동 체크박스 (결제, 지도, 소셜 로그인 등)
- [x] Q4. 보안 및 인증 방식 선택
- [x] Q5. 예외 상황 대응 정책 입력

### 1-2. 폼 검증 및 상태 관리

- [x] React Hook Form + Zod 스키마 정의 (각 단계별)
- [x] 필수 입력 항목 검증 로직
- [x] 실시간 검증 피드백 UI
- [x] Zustand 스토어와 폼 연동
- [x] LocalStorage 자동 저장 기능

### 1-3. 단계별 진행 로직

- [x] 단계 완료 조건 체크 로직
- [x] 다음 단계 자동 활성화 기능
- [x] 이전 단계로 돌아가기 기능
- [x] 진행 상황 표시 (Progress Indicator)
- [x] 미완료 상태에서 PRD 생성 시 확인 Alert

### 1-4. 반응형 UI 완성

- [x] 모바일 레이아웃 최적화 (320px~768px)
- [x] 태블릿 레이아웃 (768px~1024px)
- [x] 데스크톱 레이아웃 (1024px+)
- [x] Touch 인터랙션 최적화
- [x] 가로/세로 모드 대응

---

## 🗄️ Phase 2: 백엔드 및 데이터베이스 설정

### 2-1. Supabase 프로젝트 설정

- [ ] Supabase 프로젝트 생성
- [ ] 환경 변수 설정 (.env.local)
- [ ] Supabase 클라이언트 설정 (src/lib/supabase.ts)
- [ ] Row Level Security (RLS) 정책 설정

### 2-2. 데이터베이스 스키마 설계

- [ ] `users` 테이블 생성 (Google OAuth 연동)
- [ ] `prd_documents` 테이블 생성
  - user_id (nullable - 비로그인 사용자 허용)
  - questionnaire_data (JSONB)
  - generated_prd (TEXT)
  - created_at, updated_at
- [ ] 인덱스 설정 (user_id, created_at)
- [ ] Migration 스크립트 작성

### 2-3. Google OAuth 인증 구현

- [ ] Google Cloud Console에서 OAuth 클라이언트 생성
- [ ] Supabase Auth 설정 (Google Provider)
- [ ] 로그인/로그아웃 UI 컴포넌트
- [ ] 인증 상태 관리 (Zustand 또는 Context)
- [ ] Protected Routes 설정 (선택사항 - 비로그인도 PRD 생성 가능)

### 2-4. API Routes 구현

- [ ] POST /api/prd/generate - PRD 생성 요청
- [ ] GET /api/prd/[id] - PRD 조회
- [ ] GET /api/prd/history - 사용자 PRD 히스토리 (로그인 필요)
- [ ] DELETE /api/prd/[id] - PRD 삭제
- [ ] 에러 핸들링 미들웨어

---

## 🤖 Phase 3: AI 통합 (Gemini API)

### 3-1. Gemini API 설정

- [ ] Google AI Studio에서 API 키 발급
- [ ] Vercel AI SDK 설정
- [ ] API 엔드포인트 구성 (app/api/generate/route.ts)
- [ ] Rate limiting 설정
- [ ] 에러 핸들링 (API 한도 초과, 네트워크 오류 등)

### 3-2. PRD 생성 프롬프트 엔지니어링

- [ ] 단계별 입력 데이터를 구조화된 프롬프트로 변환
- [ ] PRD 템플릿 설계 (마크다운 형식)
  - 프로젝트 개요
  - 핵심 기능
  - 화면 구성
  - 사용자 플로우
  - 디자인 가이드라인
  - 기술 스펙
  - 예외 처리
- [ ] Few-shot 예제 추가 (프롬프트 품질 향상)
- [ ] 출력 형식 검증 로직

### 3-3. 스트리밍 응답 처리

- [ ] Vercel AI SDK의 `streamText` 사용
- [ ] 실시간 생성 진행 상태 UI
- [ ] 취소 기능 구현
- [ ] 타임아웃 처리

---

## 📄 Phase 4: PRD 기능 구현

### 4-1. PRD 생성 모달

- [ ] 최종 입력 내용 확인 화면
- [ ] '생성하기' 버튼 클릭 시 API 호출
- [ ] 로딩 상태 표시 (스피너/프로그레스바)
- [ ] 생성 완료 후 결과 화면으로 이동

### 4-2. PRD 미리보기 및 편집

- [ ] 마크다운 렌더링 (react-markdown 또는 유사 라이브러리)
- [ ] 라이브 편집 기능 (선택사항)
- [ ] 목차(TOC) 자동 생성
- [ ] 코드 블록 신택스 하이라이팅

### 4-3. 다운로드 기능

- [ ] .md 파일 다운로드 기능
- [ ] .pdf 파일 다운로드 기능
  - jsPDF 또는 Puppeteer/Playwright 사용
  - 한글 폰트 지원 확인
  - 페이지 레이아웃 최적화
- [ ] 파일명 자동 생성 (서비스명 + 날짜)

### 4-4. 사용자 히스토리 (로그인 사용자)

- [ ] 과거 생성 PRD 목록 페이지 (/my-prds)
- [ ] PRD 카드 컴포넌트 (제목, 생성일, 미리보기)
- [ ] 특정 PRD 불러오기 기능
- [ ] PRD 삭제 기능
- [ ] 페이지네이션 또는 무한 스크롤

---

## 🎨 Phase 5: 폴리싱 및 배포

### 5-1. SEO 최적화

- [ ] 메타데이터 설정 (app/layout.tsx, app/page.tsx)
- [ ] Open Graph 이미지 생성
- [ ] robots.txt 설정
- [ ] sitemap.xml 생성
- [ ] 첫 페이지 SSG(Static Site Generation) 적용 확인
- [ ] 구조화된 데이터 (JSON-LD) 추가

### 5-2. 접근성 및 사용성

- [ ] 키보드 네비게이션 지원
- [ ] ARIA 레이블 추가
- [ ] 색상 대비 확인 (WCAG AA 기준)
- [ ] 스크린 리더 테스트
- [ ] 에러 메시지 명확성 개선

### 5-3. 성능 최적화

- [ ] 이미지 최적화 (next/image 사용)
- [ ] 코드 스플리팅 확인
- [ ] Bundle 크기 분석 (@next/bundle-analyzer)
- [ ] Lighthouse 점수 측정 (Performance, Accessibility, SEO)
- [ ] 폰트 로딩 최적화

### 5-4. 테스트

- [ ] 모바일 실기기 테스트 (iOS, Android)
- [ ] 브라우저 호환성 테스트 (Chrome, Safari, Firefox)
- [ ] 네트워크 장애 시나리오 테스트
- [ ] 사용자 시나리오 E2E 테스트 (선택사항)
- [ ] 단위 테스트 주요 유틸리티 함수 (선택사항)

### 5-5. Vercel 배포

- [ ] Vercel 프로젝트 연결
- [ ] 환경 변수 설정 (Production)
- [ ] 도메인 설정 (선택사항)
- [ ] 프리뷰 배포 확인
- [ ] 프로덕션 배포
- [ ] 배포 후 모니터링 (Vercel Analytics, Sentry 등)

---

## 🔧 추가 고려사항

### 개선 및 확장 기능 (우선순위 낮음)

- [ ] PRD 공유 기능 (고유 URL 생성)
- [ ] PRD 템플릿 갤러리
- [ ] 다국어 지원 (i18n)
- [ ] 다크모드 토글
- [ ] PRD 버전 관리
- [ ] 협업 기능 (댓글, 공동 편집)
- [ ] AI 재생성 기능 (특정 섹션만 재생성)
- [ ] 프롬프트 커스터마이징 옵션

### 문서화

- [ ] README.md 작성 (프로젝트 소개, 설치 방법)
- [ ] 개발 가이드 문서
- [ ] API 문서
- [ ] 배포 가이드

---

## 📊 현재 진행 상황

### ✅ 완료됨

- Next.js 프로젝트 설정
- 기본 레이아웃 구조 (Header, Container, FloatingActions)
- UI 컴포넌트 라이브러리 (Button, Card, Input, Textarea, Select, Modal)
- 타입 정의 (questionnaire.ts)
- Zustand 스토어 설정
- 기본 페이지 구조 (3단계 플레이스홀더)

### 🚧 진행 중

- (아직 시작 안 됨)

### ⏳ 대기 중

- 위의 모든 체크리스트 항목

---

**마지막 업데이트**: 2026-01-02
**프로젝트 상태**: 초기 설정 완료, 본격 개발 대기
