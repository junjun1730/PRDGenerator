# Supabase Setup - Test Scenarios

## Context
- **Feature**: Supabase Client Initialization & Database Infrastructure
- **Affected Files**:
  - `src/lib/supabase/client.ts` (Browser client)
  - `src/lib/supabase/server.ts` (Server-side client)
  - `src/lib/supabase/types.ts` (Database type definitions)
  - `.env.local` (Environment variables)
- **Dependencies**:
  - `@supabase/supabase-js` (v2.x)
  - `@supabase/ssr` (for Next.js App Router)
  - Next.js 15 App Router cookies API
- **Related Types**:
  - `Database` (auto-generated from Supabase schema)
  - `SupabaseClient<Database>` (typed client instance)
- **Testing Framework**: Vitest + Testing Library

---

## Scenario Categories

### 1. Happy Path Scenarios

#### Scenario 1.1: Browser Client Initialization Success
- **Given**:
  - `NEXT_PUBLIC_SUPABASE_URL` = "https://project-id.supabase.co"
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = "valid-anon-key-string"
  - Environment variables are properly loaded in `.env.local`
- **When**: `createBrowserClient()` is called from a client component
- **Then**:
  - Client instance is created without errors
  - Client has valid `auth`, `from`, `rpc`, `storage` methods
  - Client can be used to query database (mock test)
- **Acceptance Criteria**:
  - Returns instance of `SupabaseClient<Database>` type
  - No console errors or warnings
  - Client instance is singleton (same instance on repeated calls)
- **Technical Details**:
  - Use `createBrowserClient` from `@supabase/ssr`
  - Singleton pattern: Create client once, reuse across components
  - Type parameter: `createBrowserClient<Database>(...)`

#### Scenario 1.2: Server Client Initialization Success
- **Given**:
  - Valid environment variables (same as 1.1)
  - Next.js App Router `cookies()` API available
  - Server component or API route context
- **When**: `createServerClient()` is called from server component/route handler
- **Then**:
  - Client instance created with cookie support
  - Can read user session from cookies
  - Can set auth cookies via cookie getter/setter
- **Acceptance Criteria**:
  - Returns typed `SupabaseClient<Database>` instance
  - Cookie getter returns proper cookie values
  - Cookie setter queues cookies for response headers
- **Technical Details**:
  - Use `createServerClient` from `@supabase/ssr`
  - Pass `cookies()` getter/setter callbacks
  - Example:
    ```typescript
    const cookieStore = cookies()
    const supabase = createServerClient(url, key, {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({name, value, ...options}) }
      }
    })
    ```

#### Scenario 1.3: Database Type Safety Validation
- **Given**:
  - Supabase project has `prd_documents` table
  - Types generated via `supabase gen types typescript --project-id project-id`
  - `Database` interface exists in `src/lib/supabase/types.ts`
- **When**: Using client to query `prd_documents` table
- **Then**:
  - TypeScript autocomplete works for table names
  - TypeScript autocomplete works for column names
  - Type inference works for query results
- **Acceptance Criteria**:
  - `client.from('prd_documents')` has autocomplete
  - `.select('*')` returns typed result: `{ data: PrdDocument[], error: null }`
  - Invalid table/column names cause TypeScript errors
- **Technical Details**:
  - Database type structure:
    ```typescript
    export interface Database {
      public: {
        Tables: {
          prd_documents: {
            Row: { id: string, user_id: string | null, ... }
            Insert: { ... }
            Update: { ... }
          }
        }
      }
    }
    ```

---

### 2. Edge Cases

#### Scenario 2.1: Missing NEXT_PUBLIC_SUPABASE_URL
- **Given**:
  - `NEXT_PUBLIC_SUPABASE_URL` is undefined or empty string
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
- **When**: `createBrowserClient()` is called
- **Then**:
  - Throw error with message: "Supabase 환경 변수가 설정되지 않았습니다"
  - Error includes hint: "NEXT_PUBLIC_SUPABASE_URL을 확인하세요"
  - Application does not crash (error boundary catches it)
- **Examples**:
  - `undefined` → error thrown
  - `""` (empty string) → error thrown
  - `null` → error thrown
- **Error Details**:
  - **Type**: `EnvironmentError` (custom error class)
  - **Message**: "Supabase 환경 변수가 설정되지 않았습니다"
  - **Recovery**: Display user-facing error message directing to documentation

#### Scenario 2.2: Missing NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Given**:
  - `NEXT_PUBLIC_SUPABASE_URL` is valid
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is undefined or empty string
- **When**: `createBrowserClient()` is called
- **Then**:
  - Throw error with message: "Supabase 환경 변수가 설정되지 않았습니다"
  - Error includes hint: "NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요"
- **Examples**:
  - `undefined` → error thrown
  - `""` (empty string) → error thrown
  - `null` → error thrown

#### Scenario 2.3: Invalid URL Format
- **Given**:
  - `NEXT_PUBLIC_SUPABASE_URL` = "invalid-url-format"
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
- **When**: Client initialization is attempted
- **Then**:
  - Validation catches invalid URL before passing to Supabase SDK
  - Throw error with message: "Supabase URL 형식이 올바르지 않습니다"
- **Examples**:
  - "http://localhost" → error (not HTTPS in production)
  - "not-a-url" → error (invalid format)
  - "https://project-id.supabase.co" → valid
  - "https://custom-domain.com" → valid (custom domain)
- **Validation Rule**:
  - Must be valid URL format
  - Must use HTTPS (except localhost in development)

#### Scenario 2.4: Server-side Missing Cookies API
- **Given**:
  - Running in server context
  - `cookies()` API not available (edge case: middleware context)
- **When**: `createServerClient()` is called without cookie handlers
- **Then**:
  - Client created but without cookie support
  - Auth state cannot be read from cookies
  - Warn in console: "쿠키 API를 사용할 수 없습니다. 인증 상태를 읽을 수 없습니다"
- **Recovery**:
  - Use browser client as fallback in client component
  - Or use service role client (admin access) if appropriate

#### Scenario 2.5: Whitespace in Environment Variables
- **Given**:
  - `NEXT_PUBLIC_SUPABASE_URL` = " https://project-id.supabase.co " (leading/trailing spaces)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = " valid-key " (leading/trailing spaces)
- **When**: Client initialization is attempted
- **Then**:
  - Values are trimmed automatically
  - Client initializes successfully
- **Acceptance Criteria**:
  - `.trim()` applied to all environment variables
  - No initialization errors due to whitespace

---

### 3. Error States

#### Scenario 3.1: Network Connection Failure on First Query
- **Given**:
  - Client initialized successfully
  - Network is unavailable when first query is made
- **When**: `client.from('prd_documents').select('*')` is called
- **Then**:
  - Query returns error object: `{ data: null, error: PostgrestError }`
  - Error message displayed to user: "네트워크 연결을 확인해주세요"
  - Retry button displayed
- **Error Details**:
  - **Type**: `NetworkError` (Supabase SDK error)
  - **Message**: "네트워크 연결을 확인해주세요"
  - **Recovery**: Provide retry mechanism, cache last known state

#### Scenario 3.2: Invalid Anon Key (401 Unauthorized)
- **Given**:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid format but incorrect value
  - Client initialized
- **When**: Any database query is made
- **Then**:
  - Query returns 401 error
  - User sees: "인증 오류가 발생했습니다. 관리자에게 문의하세요"
  - Error logged to monitoring service (Sentry/Vercel Analytics)
- **Error Details**:
  - **Type**: `AuthenticationError`
  - **Message**: "인증 오류가 발생했습니다"
  - **Recovery**: Developer must fix environment variable

#### Scenario 3.3: Supabase Service Unavailable (5xx Error)
- **Given**:
  - Client initialized successfully
  - Supabase service returns 503 error
- **When**: Database query is made
- **Then**:
  - Error caught and handled gracefully
  - User sees: "서비스가 일시적으로 이용 불가능합니다. 잠시 후 다시 시도해주세요"
  - Exponential backoff retry logic triggered (3 attempts)
- **Error Details**:
  - **Type**: `ServiceUnavailableError`
  - **Message**: "서비스가 일시적으로 이용 불가능합니다"
  - **Recovery**: Auto-retry with backoff (500ms, 1s, 2s)

#### Scenario 3.4: Client Initialization in Node.js Context (Middleware)
- **Given**:
  - Running in Next.js middleware
  - Using `NEXT_PUBLIC_*` variables (client-side variables)
- **When**: Browser client is used in middleware
- **Then**:
  - Throw error: "Middleware에서는 서버 클라이언트를 사용해야 합니다"
  - Guide developer to use server client instead
- **Technical Details**:
  - Middleware runs on Edge Runtime
  - Must use server client with appropriate edge-compatible configuration

---

### 4. State Transitions

#### Scenario 4.1: Client-side → Server-side Context Switch
- **Initial State**:
  - Browser client used in client component
  - User authenticated, session stored in cookie
- **Transition Steps**:
  1. User navigates to server component page
     - Expected: Server client reads session from cookie
  2. Server client fetches user-specific data
     - Expected: Data filtered by user_id automatically (RLS)
  3. Data returned to client component
     - Expected: Same user session maintained
- **Invariants**:
  - User session consistent across client/server boundary
  - Auth state never lost during navigation

#### Scenario 4.2: Unauthenticated → Authenticated Flow
- **Initial State**:
  - User not logged in
  - Client initialized with anon key
- **Transition Steps**:
  1. User clicks "Google 로그인" button
     - Expected: Redirect to Google OAuth
  2. Google callback returns with session
     - Expected: Server client sets auth cookies
  3. Client refreshes, browser client reads new session
     - Expected: `client.auth.getSession()` returns user data
- **Invariants**:
  - Session persisted in cookies
  - Client automatically refreshes token before expiry

#### Scenario 4.3: Token Refresh Flow
- **Initial State**:
  - User authenticated
  - Access token near expiry (< 5 minutes)
- **Transition Steps**:
  1. Client detects token expiry approaching
     - Expected: Auto-refresh triggered
  2. Refresh token sent to Supabase
     - Expected: New access token received
  3. New token stored in cookies
     - Expected: User session continues without interruption
- **Invariants**:
  - No user-visible interruption
  - Ongoing requests not affected

---

### 5. Integration Scenarios

#### Scenario 5.1: Client + Zustand Store Integration
- **Components Involved**:
  - Supabase client
  - `useQuestionnaireStore` (Zustand)
  - Client components
- **Data Flow**:
  1. User fills questionnaire → stored in Zustand
  2. User clicks "PRD 생성" → data sent to API route
  3. API route uses server client to insert into `prd_documents`
  4. Database returns inserted row with `id`
  5. Client navigates to `/prd/[id]` with generated ID
- **Side Effects**:
  - localStorage updated by Zustand middleware
  - Database record created
  - Auth cookies may be set/updated

#### Scenario 5.2: Server Actions + Supabase Client
- **Components Involved**:
  - Server Actions (`"use server"`)
  - Server Supabase client
  - Client components
- **Data Flow**:
  1. Client component calls server action
  2. Server action creates server client with cookies
  3. Server action queries/mutates database
  4. Result returned to client component
  5. Client component updates UI
- **Side Effects**:
  - Database mutations committed
  - Cookies updated via server action
  - Revalidation triggered for cached data

#### Scenario 5.3: API Route + RLS (Row Level Security)
- **Components Involved**:
  - API route handler (`/api/prd/[id]`)
  - Server Supabase client
  - RLS policies on `prd_documents` table
- **Data Flow**:
  1. Client sends GET request to `/api/prd/[id]`
  2. API route creates server client
  3. Server client queries `prd_documents` with RLS enabled
  4. RLS policy checks: `user_id = auth.uid() OR user_id IS NULL`
  5. Only authorized rows returned
- **Side Effects**:
  - Unauthorized access prevented by database
  - No application-level permission checks needed

---

### 6. Performance & UX Scenarios

#### Scenario 6.1: Client Instance Singleton Pattern
- **Performance Requirement**:
  - Client instance created only once per environment (browser/server)
  - Subsequent calls return cached instance
- **UX Expectation**:
  - No repeated initialization overhead
  - Consistent client state across components
- **Measurement**:
  - Test with spy: `createBrowserClient` called once, subsequent `getSupabaseClient()` calls return same instance
  - Performance: Instance creation < 10ms

#### Scenario 6.2: Lazy Client Initialization
- **Performance Requirement**:
  - Client not initialized until first use
  - No blocking initialization on app load
- **UX Expectation**:
  - Faster initial page load
  - Client created on-demand
- **Measurement**:
  - Test: Client undefined until first query
  - Performance: Time to Interactive (TTI) not affected by Supabase SDK

#### Scenario 6.3: Connection Pooling Efficiency
- **Performance Requirement**:
  - Server client reuses connections across requests
  - No connection leak
- **UX Expectation**:
  - Consistent response times
  - No degradation under load
- **Measurement**:
  - Monitor: Connection count stable under 100 concurrent requests
  - Performance: P95 query latency < 200ms

---

## Boundary Value Analysis

### Input: NEXT_PUBLIC_SUPABASE_URL
- **Type**: `string`
- **Valid Range**: Valid HTTPS URL (except localhost in dev)
- **Test Values**:
  - Below minimum: `""` → throw error "환경 변수가 설정되지 않았습니다"
  - At minimum: `"https://a.supabase.co"` → valid (shortest valid URL)
  - Normal: `"https://project-id.supabase.co"` → valid
  - Custom domain: `"https://custom-domain.com"` → valid
  - Invalid protocol: `"http://project-id.supabase.co"` → error in production, valid in dev
  - Invalid format: `"not-a-url"` → throw error "URL 형식이 올바르지 않습니다"

### Input: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Type**: `string`
- **Valid Range**: Non-empty string (format validated by Supabase SDK)
- **Test Values**:
  - Below minimum: `""` → throw error "환경 변수가 설정되지 않았습니다"
  - At minimum: `"x"` → accepted (SDK will validate further)
  - Normal: `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` (JWT format) → valid
  - Invalid JWT: `"invalid-key"` → accepted at init, fails on first query (401)

---

## Accessibility Scenarios

**Note**: Supabase client is backend infrastructure, no direct UI accessibility concerns. However:

- Error messages must be screen-reader friendly
- Error states should use ARIA live regions when displayed in UI
- Loading states during queries should be announced

---

## Localization Scenarios

### Error Messages (Korean)

| Scenario | English (Dev) | Korean (User-facing) |
|----------|---------------|----------------------|
| Missing env var | "Missing environment variable" | "환경 변수가 설정되지 않았습니다" |
| Invalid URL | "Invalid URL format" | "URL 형식이 올바르지 않습니다" |
| Network error | "Network connection failed" | "네트워크 연결을 확인해주세요" |
| Auth error | "Authentication failed" | "인증 오류가 발생했습니다" |
| Service unavailable | "Service unavailable" | "서비스가 일시적으로 이용 불가능합니다" |

---

## Test Data Examples

### Valid Data Sets

```typescript
// Example 1: Development environment
const devEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.fake-key"
};

// Example 2: Production environment
const prodEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://xyzproject.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real-production-key"
};

// Example 3: Custom domain
const customEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://db.mycompany.com",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.custom-domain-key"
};
```

### Invalid Data Sets

```typescript
// Example 1: Missing URL
const missingUrl = {
  NEXT_PUBLIC_SUPABASE_URL: undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "valid-key"
};
// Expected: Throw error "환경 변수가 설정되지 않았습니다"

// Example 2: Missing key
const missingKey = {
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined
};
// Expected: Throw error "환경 변수가 설정되지 않았습니다"

// Example 3: Invalid URL format
const invalidUrl = {
  NEXT_PUBLIC_SUPABASE_URL: "not-a-valid-url",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "valid-key"
};
// Expected: Throw error "URL 형식이 올바르지 않습니다"

// Example 4: Empty strings
const emptyStrings = {
  NEXT_PUBLIC_SUPABASE_URL: "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ""
};
// Expected: Throw error "환경 변수가 설정되지 않았습니다"
```

---

## Mock Requirements

### Browser Client Tests
```typescript
// Mock @supabase/ssr createBrowserClient
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn((url, key) => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn((table) => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockResolvedValue({ data: null, error: null })
    }))
  }))
}));

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
```

### Server Client Tests
```typescript
// Mock Next.js cookies API
const mockCookies = {
  get: vi.fn((name) => ({ name, value: 'mock-cookie-value' })),
  set: vi.fn(),
  delete: vi.fn()
};

vi.mock('next/headers', () => ({
  cookies: () => mockCookies
}));

// Mock @supabase/ssr createServerClient
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((url, key, options) => ({
    // ... similar to browser client mock
  }))
}));
```

### Database Type Mocking
```typescript
// Mock Database types for testing
export interface MockDatabase {
  public: {
    Tables: {
      prd_documents: {
        Row: {
          id: string;
          user_id: string | null;
          questionnaire_data: Record<string, unknown>;
          generated_prd: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Insert>;
      };
    };
  };
}
```

---

## Notes for Test Writer

### Critical Implementation Details

1. **Environment Variable Validation**:
   - Always validate before passing to Supabase SDK
   - Provide clear Korean error messages for missing/invalid vars
   - Use `process.env.NEXT_PUBLIC_*` for client-side
   - Never expose service role key in client code

2. **Singleton Pattern**:
   - Browser client: Create once per browser session
   - Server client: Create per request (with cookies)
   - Test both creation and reuse paths

3. **Cookie Handling**:
   - Server client MUST use Next.js `cookies()` API
   - Test cookie get/set callbacks thoroughly
   - Verify auth state persists across requests

4. **Error Handling Strategy**:
   - All errors should be caught and wrapped in custom error classes
   - Error messages must be user-friendly and in Korean
   - Developer errors (env vars) vs user errors (network) need different handling

5. **Type Safety**:
   - Always use generic type parameter: `SupabaseClient<Database>`
   - Test that TypeScript catches invalid table/column names
   - Ensure generated types match actual database schema

### Test Organization Suggestions

```
src/lib/supabase/__tests__/
├── client.test.ts              # Browser client tests
├── server.test.ts              # Server client tests
├── validation.test.ts          # Env var validation tests
├── integration.test.ts         # Client + store integration
└── types.test.ts               # TypeScript type tests (tsd)
```

### Performance Considerations

- Client initialization should be < 10ms
- Mock network calls to avoid actual Supabase connections in tests
- Test suite should run in < 2 seconds total
- Use `vi.useFakeTimers()` for testing retry/backoff logic

### Dependencies to Install

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D @types/node
```

### TypeScript Configuration

Ensure `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "strict": true,
    "types": ["vitest/globals", "node"]
  }
}
```

---

## Checklist for Test Writer

Before implementing tests, verify:

- [ ] All happy path scenarios have corresponding test cases
- [ ] All edge cases (missing/invalid env vars) are tested
- [ ] All error states have Korean error messages
- [ ] Browser and server clients are tested separately
- [ ] Type safety is verified (consider using `tsd` for type tests)
- [ ] Mocks are properly set up for `@supabase/ssr` and `next/headers`
- [ ] Singleton pattern is tested (client reuse)
- [ ] Cookie handling is tested (server client)
- [ ] Integration with Zustand store is tested (if applicable)
- [ ] Performance benchmarks are in place (< 10ms init)
- [ ] All tests use Korean error messages for user-facing errors
- [ ] Test data examples (valid/invalid) are used consistently

---

**Document Version**: 1.0
**Last Updated**: 2026-01-07
**Status**: Ready for RED phase (test writing)
**Next Step**: Create test files in `src/lib/supabase/__tests__/`
