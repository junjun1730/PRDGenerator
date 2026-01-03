# AI PRD Generator 개발 계획

> **프로젝트 개요**: AI 기반 PRD(Product Requirements Document) 자동 생성 서비스
> **목표**: 3단계 질문을 통해 사용자 아이디어를 체계적인 기획서로 변환
> **개발 방법론**: TDD (Test-Driven Development) + Functional Programming

---

## 🎯 개발 프로토콜

이 프로젝트는 **CLAUDE.md**에 정의된 TDD 워크플로우를 따릅니다:

### 기본 개발 사이클

```
Scenario 작성 → Test 작성 (RED) → 구현 (GREEN) → Refactoring → Documentation
```

### 작업 유형별 프로토콜

1. **Feature Development**: `PROTOCOL_FEATURE_DEV`
   - docs/scenarios/{feature-name}.md 작성
   - 테스트 케이스 작성 (실패 확인)
   - 최소 구현 (테스트 통과)
   - 리팩토링 (design tokens 적용)
   - process/checklist.md 업데이트

2. **Bug Fix**: `PROTOCOL_BUG_FIX`
   - 재현 테스트 작성
   - 최소 수정
   - 회귀 테스트

3. **Refactoring**: `PROTOCOL_REFACTOR`
   - 기존 테스트 확인
   - 동작 유지하며 개선
   - 테스트 재실행

---

## 📋 Phase 1: 핵심 UI 개발

### 1-1. 질문지 폼 컴포넌트 구현

각 작업은 다음 순서로 진행됩니다:
1. `docs/scenarios/stage{N}-form.md` 작성
2. `src/components/questionnaire/__tests__/Stage{N}Form.test.tsx` 작성
3. `src/components/questionnaire/Stage{N}Form.tsx` 구현
4. Design tokens 적용 및 리팩토링

#### 1단계: 서비스 개요 질문

- [x] Q1. 서비스 명칭 및 정의 입력 폼
- [x] Q2. 핵심 기능(Top 3) 입력 폼 (동적 추가/삭제)
- [x] Q3. 주요 화면 구성 입력 폼
- [x] Q4. 사용자 플로우(User Journey) 입력 폼
- [x] Q5. 톤앤매너 선택/입력 폼

**완료 조건**:
- ✅ 모든 테스트 통과 (`npm test`)
- ✅ TypeScript 에러 없음
- ✅ Design tokens 적용 (`tokens.json` 참조)
- ✅ 한국어 UI 텍스트
- ✅ Progressive reveal 애니메이션

#### 2단계: 디자인 요소 질문

- [x] 테마 옵션 버튼 (미니멀, 화려한 인터랙션, 신뢰감, 귀여운 등) - 다중 선택
- [x] Q1. 브랜드 키워드 입력 (3개)
- [x] Q2. 컬러 시스템 설정 (Primary, Background, 다크모드 토글)
- [x] Q3. 타이포그래피 선택 (고딕/명조/커스텀)
- [x] Q4. UI 디테일 설정 (버튼 곡률, 아이콘 굵기, 그림자 효과)
- [x] Q5. 레퍼런스 입력 폼

**완료 조건**:
- ✅ 컬러 피커 컴포넌트 테스트
- ✅ 다중 선택 로직 검증
- ✅ 상태 관리 통합 (Zustand)

#### 3단계: 기술 제약 질문

- [x] Q1. 기술 스택 선택 (Frontend/Backend 멀티 셀렉트)
- [x] Q2. 데이터 관리 옵션 (실시간 처리, 대용량 미디어)
- [x] Q3. 외부 API 연동 체크박스 (결제, 지도, 소셜 로그인 등)
- [x] Q4. 보안 및 인증 방식 선택
- [x] Q5. 예외 상황 대응 정책 입력

**완료 조건**:
- ✅ 멀티 셀렉트 UI 테스트
- ✅ 조건부 렌더링 로직 검증

---

### 1-2. 폼 검증 및 상태 관리

**Feature**: Form Validation & State Sync

**Test Scenarios** (`docs/scenarios/form-validation.md`):
- Happy Path: 유효한 입력 → 저장 성공
- Edge Cases: 빈 입력, 최대 길이 초과, 특수문자
- Error States: 네트워크 실패, localStorage 오류

**Tasks**:
- [x] React Hook Form + Zod 스키마 정의 (각 단계별)
- [x] 필수 입력 항목 검증 로직
- [x] 실시간 검증 피드백 UI
- [x] Zustand 스토어와 폼 연동
- [x] LocalStorage 자동 저장 기능

**Test Files**:
- `src/lib/validators/__tests__/schema.test.ts`
- `src/lib/store/__tests__/useQuestionnaireStore.test.ts`

---

### 1-3. 단계별 진행 로직

**Feature**: Multi-step Navigation

**Test Scenarios** (`docs/scenarios/step-navigation.md`):
- 단계 완료 조건 충족 시 다음 버튼 활성화
- 미완료 상태에서 다음 단계 클릭 → 경고 모달
- 이전 단계 복귀 시 데이터 유지
- Progress indicator 정확성

**Tasks**:
- [x] 단계 완료 조건 체크 로직
- [x] 다음 단계 자동 활성화 기능
- [x] 이전 단계로 돌아가기 기능
- [x] 진행 상황 표시 (Progress Indicator)
- [x] 미완료 상태에서 PRD 생성 시 확인 Alert

**Test Files**:
- `src/components/questionnaire/__tests__/StepNavigation.test.tsx`
- `src/hooks/__tests__/useStepValidation.test.ts`

---

### 1-4. 반응형 UI 완성

**Feature**: Responsive Layout

**Test Scenarios** (`docs/scenarios/responsive-design.md`):
- 모바일 (320px): 단일 컬럼, 터치 최적화
- 태블릿 (768px): 2컬럼 그리드
- 데스크톱 (1024px+): 사이드바 + 메인 영역
- 가로/세로 모드 전환 테스트

**Tasks**:
- [x] 모바일 레이아웃 최적화 (320px~768px)
- [x] 태블릿 레이아웃 (768px~1024px)
- [x] 데스크톱 레이아웃 (1024px+)
- [x] Touch 인터랙션 최적화
- [x] 가로/세로 모드 대응

**Design Tokens**:
- `tokens.json` → breakpoints, spacing, container

---

## 🗄️ Phase 2: 백엔드 및 데이터베이스 설정

### 2-1. Supabase 프로젝트 설정

**Feature**: Database Infrastructure

**Protocol**: `PROTOCOL_FEATURE_DEV`

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/supabase-setup.md`
- [ ] **Test**: 환경 변수 로드 테스트
- [ ] **Implementation**: Supabase 프로젝트 생성
- [ ] **Implementation**: 환경 변수 설정 (.env.local)
- [ ] **Implementation**: Supabase 클라이언트 설정 (src/lib/supabase.ts)
- [ ] **Test**: RLS 정책 단위 테스트
- [ ] **Implementation**: Row Level Security (RLS) 정책 설정

**Test Scenarios**:
- Happy Path: 클라이언트 초기화 성공
- Edge Case: 환경 변수 누락 → 에러 처리
- Error State: 네트워크 연결 실패 → 재시도 로직

---

### 2-2. 데이터베이스 스키마 설계

**Feature**: Database Schema

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/db-schema.md`
- [ ] **Test**: 스키마 마이그레이션 테스트
- [ ] **Implementation**: `users` 테이블 생성 (Google OAuth 연동)
- [ ] **Implementation**: `prd_documents` 테이블 생성
  - user_id (nullable - 비로그인 사용자 허용)
  - questionnaire_data (JSONB)
  - generated_prd (TEXT)
  - created_at, updated_at
- [ ] **Implementation**: 인덱스 설정 (user_id, created_at)
- [ ] **Implementation**: Migration 스크립트 작성
- [ ] **Test**: CRUD 작업 통합 테스트

**Validation**:
- Zod 스키마로 JSONB 구조 검증
- TypeScript 타입 안정성 확보

---

### 2-3. Google OAuth 인증 구현

**Feature**: Authentication

**Test Scenarios** (`docs/scenarios/google-auth.md`):
- Happy Path: 로그인 → 토큰 저장 → 리디렉션
- Edge Case: OAuth 취소 → 에러 메시지
- Error State: 세션 만료 → 재로그인 유도

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/google-auth.md`
- [ ] **Test**: 인증 흐름 단위 테스트
- [ ] **Implementation**: Google Cloud Console에서 OAuth 클라이언트 생성
- [ ] **Implementation**: Supabase Auth 설정 (Google Provider)
- [ ] **Implementation**: 로그인/로그아웃 UI 컴포넌트
- [ ] **Implementation**: 인증 상태 관리 (Zustand 또는 Context)
- [ ] **Test**: Protected Routes 테스트
- [ ] **Implementation**: Protected Routes 설정 (선택사항 - 비로그인도 PRD 생성 가능)

---

### 2-4. API Routes 구현

**Feature**: REST API Endpoints

**Test Scenarios** (`docs/scenarios/api-routes.md`):
- POST /api/prd/generate: 유효한 입력 → 201 Created
- GET /api/prd/[id]: 존재하는 ID → 200 OK
- GET /api/prd/[id]: 존재하지 않는 ID → 404 Not Found
- DELETE /api/prd/[id]: 권한 있는 사용자 → 204 No Content

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/api-routes.md`
- [ ] **Test**: API 엔드포인트 단위 테스트
- [ ] **Implementation**: POST /api/prd/generate - PRD 생성 요청
- [ ] **Implementation**: GET /api/prd/[id] - PRD 조회
- [ ] **Implementation**: GET /api/prd/history - 사용자 PRD 히스토리 (로그인 필요)
- [ ] **Implementation**: DELETE /api/prd/[id] - PRD 삭제
- [ ] **Test**: 에러 핸들링 테스트
- [ ] **Implementation**: 에러 핸들링 미들웨어

**Mocking**:
- Supabase 클라이언트 모킹
- 인증 상태 모킹

---

## 🤖 Phase 3: AI 통합 (Gemini API)

### 3-1. Gemini API 설정

**Feature**: AI Integration

**Test Scenarios** (`docs/scenarios/gemini-api.md`):
- Happy Path: 유효한 프롬프트 → 스트리밍 응답
- Edge Case: API 한도 초과 → Rate limit 에러
- Error State: 네트워크 오류 → 재시도 메커니즘

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/gemini-api.md`
- [ ] **Test**: API 클라이언트 모킹 테스트
- [ ] **Implementation**: Google AI Studio에서 API 키 발급
- [ ] **Implementation**: Vercel AI SDK 설정
- [ ] **Implementation**: API 엔드포인트 구성 (app/api/generate/route.ts)
- [ ] **Test**: Rate limiting 테스트
- [ ] **Implementation**: Rate limiting 설정
- [ ] **Implementation**: 에러 핸들링 (API 한도 초과, 네트워크 오류 등)

---

### 3-2. PRD 생성 프롬프트 엔지니어링

**Feature**: Prompt Engineering

**Test Scenarios** (`docs/scenarios/prompt-engineering.md`):
- 입력 데이터 구조화 → 프롬프트 템플릿 적용
- Few-shot 예제 포함 → 일관된 출력 형식
- 출력 검증 → 마크다운 형식 확인

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/prompt-engineering.md`
- [ ] **Test**: 프롬프트 생성 로직 단위 테스트
- [ ] **Implementation**: 단계별 입력 데이터를 구조화된 프롬프트로 변환
- [ ] **Implementation**: PRD 템플릿 설계 (마크다운 형식)
  - 프로젝트 개요
  - 핵심 기능
  - 화면 구성
  - 사용자 플로우
  - 디자인 가이드라인
  - 기술 스펙
  - 예외 처리
- [ ] **Implementation**: Few-shot 예제 추가 (프롬프트 품질 향상)
- [ ] **Test**: 출력 형식 검증 테스트
- [ ] **Implementation**: 출력 형식 검증 로직

**Validation**:
- Zod 스키마로 출력 구조 검증
- 마크다운 파싱 테스트

---

### 3-3. 스트리밍 응답 처리

**Feature**: Streaming UI

**Test Scenarios** (`docs/scenarios/streaming-response.md`):
- Happy Path: 청크 수신 → 실시간 UI 업데이트
- User Action: 취소 버튼 → 스트림 중단
- Error State: 타임아웃 → 부분 결과 표시

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/streaming-response.md`
- [ ] **Test**: 스트리밍 UI 컴포넌트 테스트
- [ ] **Implementation**: Vercel AI SDK의 `streamText` 사용
- [ ] **Implementation**: 실시간 생성 진행 상태 UI
- [ ] **Test**: 취소 기능 테스트
- [ ] **Implementation**: 취소 기능 구현
- [ ] **Implementation**: 타임아웃 처리

---

## 📄 Phase 4: PRD 기능 구현

### 4-1. PRD 생성 모달

**Feature**: PRD Generation Modal

**Test Scenarios** (`docs/scenarios/prd-generation-modal.md`):
- Happy Path: 완료된 설문 → 확인 화면 → 생성 성공
- Edge Case: 미완료 항목 → 경고 메시지
- Error State: 생성 실패 → 재시도 옵션

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/prd-generation-modal.md`
- [ ] **Test**: 모달 렌더링 테스트
- [ ] **Implementation**: 최종 입력 내용 확인 화면
- [ ] **Test**: API 호출 테스트
- [ ] **Implementation**: '생성하기' 버튼 클릭 시 API 호출
- [ ] **Implementation**: 로딩 상태 표시 (스피너/프로그레스바)
- [ ] **Test**: 리디렉션 테스트
- [ ] **Implementation**: 생성 완료 후 결과 화면으로 이동

---

### 4-2. PRD 미리보기 및 편집

**Feature**: PRD Preview & Editing

**Test Scenarios** (`docs/scenarios/prd-preview.md`):
- 마크다운 렌더링 → HTML 변환 정확성
- TOC 생성 → 헤더 계층 구조 확인
- 코드 블록 → 신택스 하이라이팅 적용

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/prd-preview.md`
- [ ] **Test**: 마크다운 렌더링 테스트
- [ ] **Implementation**: 마크다운 렌더링 (react-markdown 또는 유사 라이브러리)
- [ ] **Test**: 라이브 편집 테스트 (선택사항)
- [ ] **Implementation**: 라이브 편집 기능 (선택사항)
- [ ] **Test**: TOC 생성 테스트
- [ ] **Implementation**: 목차(TOC) 자동 생성
- [ ] **Implementation**: 코드 블록 신택스 하이라이팅

---

### 4-3. 다운로드 기능

**Feature**: Export Functionality

**Test Scenarios** (`docs/scenarios/export-functionality.md`):
- .md 다운로드 → 파일명 형식 검증
- .pdf 다운로드 → 한글 폰트 렌더링 확인
- 레이아웃 → 페이지 넘김 위치 적절성

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/export-functionality.md`
- [ ] **Test**: .md 다운로드 테스트
- [ ] **Implementation**: .md 파일 다운로드 기능
- [ ] **Test**: .pdf 생성 테스트
- [ ] **Implementation**: .pdf 파일 다운로드 기능
  - jsPDF 또는 Puppeteer/Playwright 사용
  - 한글 폰트 지원 확인
  - 페이지 레이아웃 최적화
- [ ] **Test**: 파일명 생성 로직 테스트
- [ ] **Implementation**: 파일명 자동 생성 (서비스명 + 날짜)

**Design Tokens**:
- PDF 스타일링에 tokens.json 적용

---

### 4-4. 사용자 히스토리 (로그인 사용자)

**Feature**: User History

**Test Scenarios** (`docs/scenarios/user-history.md`):
- PRD 목록 조회 → 페이지네이션 동작
- PRD 카드 클릭 → 상세 페이지 이동
- 삭제 버튼 → 확인 모달 → DB 삭제

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/user-history.md`
- [ ] **Test**: 목록 페이지 렌더링 테스트
- [ ] **Implementation**: 과거 생성 PRD 목록 페이지 (/my-prds)
- [ ] **Test**: PRD 카드 컴포넌트 테스트
- [ ] **Implementation**: PRD 카드 컴포넌트 (제목, 생성일, 미리보기)
- [ ] **Implementation**: 특정 PRD 불러오기 기능
- [ ] **Test**: 삭제 기능 테스트
- [ ] **Implementation**: PRD 삭제 기능
- [ ] **Test**: 페이지네이션 테스트
- [ ] **Implementation**: 페이지네이션 또는 무한 스크롤

---

## 🎨 Phase 5: 폴리싱 및 배포

### 5-1. SEO 최적화

**Feature**: SEO Enhancement

**Test Scenarios** (`docs/scenarios/seo-optimization.md`):
- 메타데이터 존재 여부
- Open Graph 이미지 렌더링
- robots.txt 접근 가능성
- sitemap.xml 유효성

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/seo-optimization.md`
- [ ] **Test**: 메타데이터 테스트
- [ ] **Implementation**: 메타데이터 설정 (app/layout.tsx, app/page.tsx)
- [ ] **Implementation**: Open Graph 이미지 생성
- [ ] **Implementation**: robots.txt 설정
- [ ] **Implementation**: sitemap.xml 생성
- [ ] **Test**: SSG 동작 확인
- [ ] **Implementation**: 첫 페이지 SSG(Static Site Generation) 적용 확인
- [ ] **Implementation**: 구조화된 데이터 (JSON-LD) 추가

---

### 5-2. 접근성 및 사용성

**Feature**: Accessibility (a11y)

**Test Scenarios** (`docs/scenarios/accessibility.md`):
- 키보드 네비게이션 → Tab/Enter 동작
- ARIA 레이블 → 스크린 리더 테스트
- 색상 대비 → WCAG AA 기준 충족

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/accessibility.md`
- [ ] **Test**: 키보드 네비게이션 자동 테스트
- [ ] **Implementation**: 키보드 네비게이션 지원
- [ ] **Test**: ARIA 레이블 존재 확인
- [ ] **Implementation**: ARIA 레이블 추가
- [ ] **Test**: 색상 대비 자동 검증
- [ ] **Implementation**: 색상 대비 확인 (WCAG AA 기준)
- [ ] **Implementation**: 스크린 리더 테스트
- [ ] **Implementation**: 에러 메시지 명확성 개선

**Tools**:
- axe-core (자동 접근성 테스트)
- VoiceOver/NVDA (수동 테스트)

---

### 5-3. 성능 최적화

**Feature**: Performance Optimization

**Test Scenarios** (`docs/scenarios/performance.md`):
- 이미지 로딩 → WebP 형식 변환
- Bundle 크기 → 500KB 이하 목표
- Lighthouse 점수 → 90점 이상 목표

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/performance.md`
- [ ] **Test**: 이미지 최적화 검증
- [ ] **Implementation**: 이미지 최적화 (next/image 사용)
- [ ] **Implementation**: 코드 스플리팅 확인
- [ ] **Test**: Bundle 크기 측정
- [ ] **Implementation**: Bundle 크기 분석 (@next/bundle-analyzer)
- [ ] **Test**: Lighthouse CI 통합
- [ ] **Implementation**: Lighthouse 점수 측정 (Performance, Accessibility, SEO)
- [ ] **Implementation**: 폰트 로딩 최적화

**Benchmarks**:
- FCP (First Contentful Paint) < 1.8s
- LCP (Largest Contentful Paint) < 2.5s
- TTI (Time to Interactive) < 3.8s

---

### 5-4. 테스트

**Feature**: Comprehensive Testing

**Test Scenarios** (`docs/scenarios/e2e-testing.md`):
- User Journey: 설문 작성 → PRD 생성 → 다운로드
- Error Recovery: 네트워크 끊김 → 재시도 성공
- Cross-browser: Chrome/Safari/Firefox 일관성

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/e2e-testing.md`
- [ ] **Test**: 모바일 실기기 테스트 (iOS, Android)
- [ ] **Test**: 브라우저 호환성 테스트 (Chrome, Safari, Firefox)
- [ ] **Test**: 네트워크 장애 시나리오 테스트
- [ ] **Test**: 사용자 시나리오 E2E 테스트 (Playwright)
- [ ] **Test**: 단위 테스트 주요 유틸리티 함수

**Tools**:
- Vitest (단위 테스트)
- React Testing Library (컴포넌트 테스트)
- Playwright (E2E 테스트)

---

### 5-5. Vercel 배포

**Feature**: Production Deployment

**Test Scenarios** (`docs/scenarios/deployment.md`):
- 프리뷰 배포 → PR별 고유 URL 생성
- 프로덕션 배포 → 환경 변수 적용 확인
- 모니터링 → 에러 트래킹 동작

**Tasks**:
- [ ] **Scenario**: `docs/scenarios/deployment.md`
- [ ] **Implementation**: Vercel 프로젝트 연결
- [ ] **Implementation**: 환경 변수 설정 (Production)
- [ ] **Implementation**: 도메인 설정 (선택사항)
- [ ] **Test**: 프리뷰 배포 확인
- [ ] **Implementation**: 프리뷰 배포 확인
- [ ] **Implementation**: 프로덕션 배포
- [ ] **Implementation**: 배포 후 모니터링 (Vercel Analytics, Sentry 등)

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

**Protocol**: 각 기능은 `PROTOCOL_FEATURE_DEV` 따름

---

### 문서화

- [ ] **Scenario**: `docs/scenarios/documentation.md`
- [ ] README.md 작성 (프로젝트 소개, 설치 방법)
- [ ] 개발 가이드 문서
- [ ] API 문서
- [ ] 배포 가이드

**Protocol**: `PROTOCOL_DOCS`

---

## 📊 현재 진행 상황

### ✅ 완료됨 (Phase 1 - 핵심 UI)

- Next.js 프로젝트 설정
- 기본 레이아웃 구조 (Header, Container, FloatingActions)
- UI 컴포넌트 라이브러리 (Button, Card, Input, Textarea, Select, Modal)
- 타입 정의 (src/lib/types/questionnaire.ts)
- Zustand 스토어 설정 (src/lib/store/useQuestionnaireStore.ts)
- 3단계 질문지 폼 구현 (Stage1, Stage2, Stage3)
- 폼 검증 및 상태 관리
- 단계별 진행 로직
- 반응형 UI (320px ~ 1920px+)
- Design tokens 적용 (tokens.json 기반)
- Progressive reveal 애니메이션

### 🚧 진행 중

- 없음

### ⏳ 대기 중 (우선순위 순)

1. **Phase 2**: 백엔드 및 데이터베이스 설정
2. **Phase 3**: AI 통합 (Gemini API)
3. **Phase 4**: PRD 기능 구현
4. **Phase 5**: 폴리싱 및 배포

---

## 🎯 성공 기준 (모든 작업 공통)

각 작업은 다음 조건을 만족해야 완료로 간주됩니다:

- ✅ **테스트**: `npm test` 모두 통과
- ✅ **타입 안정성**: `npx tsc --noEmit` 에러 없음
- ✅ **코드 품질**: `npm run lint` 경고 없음
- ✅ **Design Tokens**: tokens.json 참조 (하드코딩 금지)
- ✅ **한국어 UI**: 모든 사용자 대면 텍스트 한국어
- ✅ **반응형**: 320px ~ 1920px+ 대응
- ✅ **문서화**: process/checklist.md 업데이트

---

## 📝 개발 워크플로우 요약

```bash
# 1. 새 기능 개발 시작
# Step 1: Scenario 작성
echo "# Feature Name\n## Test Scenarios" > docs/scenarios/feature-name.md

# Step 2: Test 작성 (RED)
npm test feature-name  # 실패 확인

# Step 3: 구현 (GREEN)
npm test feature-name  # 통과 확인

# Step 4: Refactoring
# Design tokens 적용, 코드 정리

# Step 5: 전체 테스트
npm test              # 모든 테스트 통과 확인
npm run build         # 빌드 성공 확인

# Step 6: 문서 업데이트
# process/checklist.md에 [x] 표시
```

---

**마지막 업데이트**: 2026-01-03
**프로젝트 상태**: Phase 1 완료, Phase 2 대기 중
**개발 방법론**: TDD (Test-Driven Development)
**참고 문서**: CLAUDE.md (워크플로우 프로토콜)
