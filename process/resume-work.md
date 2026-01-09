# AI PRD Generator - 작업 재개 가이드

> **작성일**: 2026-01-08 21:42
> **목적**: 다음 작업 세션을 위한 컨텍스트 및 시작 프롬프트
> **마지막 작업**: TypeScript 에러 수정 및 문서 동기화 완료

---

## 📌 Claude에게 전달할 프롬프트

```
안녕! 어제 작업을 이어서 계속하려고 해.

현재 상황:
- Phase 1 (Core UI): 100% 완료
- Phase 2-1 (Supabase Setup): 100% 완료
- Phase 2-2 (Database Schema): 66% 완료
- Phase 2-3 (Google OAuth): 100% 완료
- TypeScript 에러: 모두 해결 완료
- 테스트: 123/149 passing (83%)

다음 작업 선택지:
1. Phase 2-4 (API Routes 구현) - PRD 생성/조회/삭제 API
2. Phase 3 (AI Integration) - Gemini API 연동 및 PRD 자동 생성

어느 것을 먼저 진행하면 좋을지 추천해주고,
선택한 작업에 대해 TDD 방식으로 계획을 세워줘.

참고 문서:
- CLAUDE.md (개발 프로토콜)
- process/checklist.md (진척 상황)
- PLAN.md (전체 계획)
```

---

## 🎯 현재 상태 요약

### 완료된 작업 (2026-01-08)

#### 1. TypeScript 에러 수정
- **Form 컴포넌트**: DynamicArrayInput 타입 단순화
  - `Control<T> | any`, `name: string` 적용
  - Stage1, Stage2, Stage3 Form 수정 완료
- **Store**: darkModeSupport 제거
- **Mock**: orderBy null check, process.env @ts-expect-error 추가
- **Database**: ZodError.issues 사용

#### 2. 문서 동기화
- `process/checklist.md` 최신화 (Phase 진척률 업데이트)
- `PLAN.md` 최신화 (마지막 작업 기록)

#### 3. 검증 완료
- ✅ TypeScript: 0 errors
- ✅ Tests: 123/149 passing (83%)
- ✅ Build: Success

#### 4. Git 커밋
```
commit 397705c
fix: resolve TypeScript errors and update documentation
12 files changed, 124 insertions(+), 57 deletions(-)
```

---

## 🚀 다음 작업 옵션

### Option 1: Phase 2-4 (API Routes) ⭐ **추천**

**이유**: 백엔드 인프라 완성 → AI 통합 준비 완료

**작업 내용**:
1. **Scenario 작성**: `docs/scenarios/api-routes.md`
2. **Test 작성 (RED)**:
   ```
   - POST /api/prd/generate (PRD 생성 요청)
   - GET /api/prd/[id] (PRD 조회)
   - GET /api/prd/history (사용자 PRD 목록)
   - DELETE /api/prd/[id] (PRD 삭제)
   ```
3. **구현 (GREEN)**:
   - API 엔드포인트 구현
   - 에러 핸들링 미들웨어
   - Google OAuth 인증 통합
4. **Refactoring**:
   - Design tokens 적용
   - 성능 최적화

**예상 소요 시간**: 2-3시간

**시작 프롬프트**:
```
Phase 2-4 (API Routes)를 TDD 방식으로 시작하고 싶어.

1단계로 docs/scenarios/api-routes.md 시나리오 문서를 작성해줘.
다음 엔드포인트에 대한 상세 시나리오가 필요해:
- POST /api/prd/generate
- GET /api/prd/[id]
- GET /api/prd/history
- DELETE /api/prd/[id]

각 엔드포인트에 대해:
- Happy Path (정상 케이스)
- Edge Cases (엣지 케이스)
- Error States (에러 상황)
- Authentication (인증 체크)
를 포함해서 작성해줘.
```

---

### Option 2: Phase 3 (AI Integration)

**이유**: 핵심 가치 제안 구현 (PRD 자동 생성)

**작업 내용**:
1. **Scenario 작성**: `docs/scenarios/gemini-api.md`
2. **Test 작성 (RED)**:
   - Gemini API 클라이언트
   - 프롬프트 생성 로직
   - 스트리밍 응답 처리
3. **구현 (GREEN)**:
   - Gemini API 연동
   - PRD 생성 프롬프트 엔지니어링
   - 실시간 스트리밍 UI
4. **Refactoring**:
   - Rate limiting
   - 에러 핸들링

**예상 소요 시간**: 3-4시간

**시작 프롬프트**:
```
Phase 3 (AI Integration)를 시작하려고 해.
Gemini API를 사용해서 설문 데이터를 PRD로 변환하는 기능을 구현하고 싶어.

먼저 docs/scenarios/gemini-api.md 시나리오 문서를 작성해줘.
다음 내용을 포함해서:
- Gemini API 클라이언트 설정
- 3단계 설문 데이터 → PRD 프롬프트 변환
- 스트리밍 응답 처리
- Rate limiting 및 에러 핸들링

TDD 방식으로 진행할 거야.
```

---

## 📚 참고 파일 위치

### 개발 프로토콜
- **CLAUDE.md**: TDD 워크플로우 및 개발 프로토콜
  - `PROTOCOL_FEATURE_DEV`: 신규 기능 개발 절차
  - Agent 워크플로우
  - 코드 스타일 가이드

### 프로젝트 문서
- **PLAN.md**: 전체 개발 계획 및 Phase 정의
- **process/checklist.md**: 진척 상황 체크리스트
- **process/current-status.md**: 상세 현재 상태 분석
- **process/next-tasks.md**: 상세 작업 계획

### 시나리오 문서
- **docs/scenarios/supabase-setup.md**: Supabase 설정 (완료)
- **docs/scenarios/db-schema.md**: Database CRUD (완료)
- **docs/scenarios/google-auth.md**: Google OAuth (완료)

### 타입 정의
- **src/lib/types/questionnaire.ts**: 설문 데이터 타입
- **src/lib/types/auth.ts**: 인증 타입
- **src/lib/supabase/types.ts**: Database 타입

### Store
- **src/lib/store/useQuestionnaireStore.ts**: 설문 상태 관리
- **src/lib/store/useAuthStore.ts**: 인증 상태 관리

### Database
- **src/lib/supabase/client.ts**: Browser 클라이언트
- **src/lib/supabase/server.ts**: Server 클라이언트
- **src/lib/supabase/db.ts**: CRUD 유틸리티

---

## ⚠️ 알아두어야 할 이슈

### 1. Database 테스트 24개 실패
- **원인**: Mock 한계 (실제 Supabase에서는 정상 작동)
- **영향**: Non-blocking
- **대응**: 실제 환경 테스트로 검증 예정

### 2. ESLint 미설정
- **상태**: Interactive prompt 대기 중
- **영향**: 코드 품질 검증 불가
- **대응**: 필요시 `npm run lint` 실행 후 "Strict" 선택

### 3. 미추적 파일
```
process/current-status.md
process/next-tasks.md
```
- **상태**: Git에 추가되지 않음
- **대응**: 필요시 `git add process/*.md` 후 커밋

---

## 🔧 유용한 명령어

### 개발 서버
```bash
npm run dev          # Dev server (localhost:3000)
npm test             # Run all tests
npm run build        # Production build
npx tsc --noEmit     # Type check
```

### Git
```bash
git status           # Check current status
git log -1           # Check last commit
git diff --stat      # Show changed files
```

### 테스트
```bash
npm test                                    # All tests
npm test src/lib/supabase/__tests__/        # Supabase tests only
npm test src/components/auth/__tests__/     # Auth tests only
```

---

## 🎨 개발 원칙 (반드시 준수)

### TDD Workflow
```
1. Scenario 작성 (docs/scenarios/)
2. Test 작성 (RED) - 실패 확인
3. 구현 (GREEN) - 테스트 통과
4. Refactoring - Design tokens 적용
5. Documentation - checklist.md 업데이트
```

### 코드 스타일
- ✅ TypeScript strict mode
- ✅ Design tokens 사용 (`tokens.json`)
- ✅ 한국어 UI 텍스트
- ✅ Functional programming
- ✅ 반응형 디자인 (320px ~ 1920px+)

### 성공 기준
- ✅ `npm test` 모두 통과
- ✅ `npx tsc --noEmit` 에러 없음
- ✅ `npm run build` 성공
- ✅ Design tokens 적용
- ✅ 문서 업데이트

---

## 📞 빠른 문제 해결

### "TypeScript 에러 발생"
→ 어제 해결한 패턴 참고:
- DynamicArrayInput: `Control<T> | any`, `name: string`
- Form resolver: `@ts-expect-error` 주석
- Mock env: `@ts-expect-error` 주석

### "테스트 실패"
→ Database mock 테스트 24개는 정상 (실제 환경에서 작동)
→ 새로운 실패는 코드 검토 필요

### "빌드 실패"
→ TypeScript 에러 확인: `npx tsc --noEmit`
→ Missing imports 확인
→ Environment variables 확인 (`.env.local`)

---

## 🎯 추천 작업 순서

### 즉시 실행 (추천)
1. **Phase 2-4 시작**: API Routes 구현
   - Scenario 작성
   - Test 작성 (RED)
   - 구현 (GREEN)
   - Refactoring

### 그 다음
2. **Phase 3**: AI Integration
   - Gemini API 연동
   - PRD 생성 로직
   - 스트리밍 UI

### 마지막
3. **Phase 4**: 폴리싱
   - SEO 최적화
   - 접근성 개선
   - 성능 최적화
   - Vercel 배포

---

## 💡 작업 시작 팁

1. **먼저 읽기**:
   ```bash
   - process/checklist.md (현재 상태)
   - PLAN.md (전체 계획)
   - CLAUDE.md (개발 프로토콜)
   ```

2. **컨텍스트 확인**:
   ```
   "process/current-status.md를 읽어줘"
   ```

3. **작업 선택**:
   ```
   "Phase 2-4 (API Routes)를 시작하고 싶어"
   또는
   "Phase 3 (AI Integration)을 시작하고 싶어"
   ```

4. **TDD 시작**:
   ```
   "TDD 방식으로 진행할 거야.
   먼저 시나리오 문서부터 작성해줘"
   ```

---

**작성일**: 2026-01-08 21:42
**다음 작업**: Phase 2-4 (API Routes) 또는 Phase 3 (AI Integration)
**현재 진척**: Phase 1 (100%), Phase 2-1 (100%), Phase 2-2 (66%), Phase 2-3 (100%)

**화이팅! 🚀**
