# Database Schema & CRUD Operations - Test Scenarios

## Context
- **Feature**: Database CRUD operations for PRD documents
- **Affected Files**:
  - `src/lib/supabase/db.ts` (Database operations)
  - `src/lib/supabase/types.ts` (Database type definitions)
  - `src/lib/validators/prd-document.ts` (Zod schemas for validation)
  - `src/lib/supabase/__tests__/db.test.ts` (CRUD operation tests)
- **Dependencies**:
  - `@supabase/supabase-js` (v2.x)
  - Supabase client (browser/server)
  - Zod (schema validation)
  - `src/lib/types/questionnaire.ts` (QuestionnaireState types)
- **Related Types**:
  - `PrdDocument` (database row type)
  - `PrdDocumentInsert` (insert payload type)
  - `PrdDocumentUpdate` (update payload type)
  - `QuestionnaireState` (questionnaire data structure)
- **Testing Framework**: Vitest + Supabase mocking

---

## Database Schema Reference

### Table: `prd_documents`

```sql
CREATE TABLE prd_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_data JSONB NOT NULL,
  generated_prd TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_prd_documents_user_id ON prd_documents(user_id);
CREATE INDEX idx_prd_documents_created_at ON prd_documents(created_at DESC);

-- RLS Policies
ALTER TABLE prd_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own documents or anonymous documents
CREATE POLICY prd_documents_select_policy ON prd_documents
  FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Policy: Users can insert their own documents
CREATE POLICY prd_documents_insert_policy ON prd_documents
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Policy: Users can update their own documents
CREATE POLICY prd_documents_update_policy ON prd_documents
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Policy: Users can delete their own documents
CREATE POLICY prd_documents_delete_policy ON prd_documents
  FOR DELETE USING (
    auth.uid() = user_id
  );
```

---

## Scenario Categories

### 1. Happy Path Scenarios

#### Scenario 1.1: Create PRD Document (Authenticated User)
- **Given**:
  - User is authenticated (user_id = "auth-user-uuid-123")
  - Valid questionnaire data:
    ```typescript
    {
      stage1: {
        serviceName: "AI PRD 생성기",
        coreFeatures: ["질문지 폼", "AI 생성", "다운로드"],
        mainScreens: "홈, 질문지, 결과",
        userJourney: "질문 작성 → AI 생성 → 다운로드",
        serviceMood: "전문적이고 효율적인"
      },
      stage2: { /* valid Stage2Data */ },
      stage3: { /* valid Stage3Data */ },
      currentStage: 3,
      completedStages: new Set([1, 2, 3])
    }
    ```
  - No generated PRD yet
- **When**: `createPrdDocument(questionnaireData, userId)` is called
- **Then**:
  - Document inserted into `prd_documents` table
  - Returns inserted document with auto-generated `id`
  - `user_id` set to authenticated user's ID
  - `questionnaire_data` stored as JSONB
  - `generated_prd` is NULL
  - `created_at` and `updated_at` are auto-set to current timestamp
- **Acceptance Criteria**:
  - Returns `{ data: PrdDocument, error: null }`
  - `data.id` is valid UUID v4 format
  - `data.user_id` matches input user ID
  - `data.questionnaire_data` matches input data (deep equality)
  - `data.created_at` is within 1 second of NOW()
- **Technical Details**:
  - Use Supabase client: `client.from('prd_documents').insert({ ... }).select().single()`
  - Validate questionnaire_data with Zod schema before insertion
  - RLS policy allows insertion when `user_id` matches `auth.uid()`

#### Scenario 1.2: Create PRD Document (Anonymous User)
- **Given**:
  - User is NOT authenticated (no session)
  - Valid questionnaire data (same structure as 1.1)
- **When**: `createPrdDocument(questionnaireData, null)` is called
- **Then**:
  - Document inserted with `user_id = NULL`
  - Returns inserted document with auto-generated `id`
  - Anonymous document can be viewed by anyone
- **Acceptance Criteria**:
  - Returns `{ data: PrdDocument, error: null }`
  - `data.user_id` is `null`
  - Document is readable without authentication
  - No RLS policy violation
- **Technical Details**:
  - RLS policy: `user_id IS NULL` allows anonymous insertion
  - Anonymous documents are not deletable (no matching user_id)

#### Scenario 1.3: Read Single PRD Document by ID (Own Document)
- **Given**:
  - Document exists with `id = "doc-uuid-456"`
  - User is authenticated (user_id = "auth-user-uuid-123")
  - Document belongs to this user (user_id matches)
- **When**: `getPrdDocumentById("doc-uuid-456")` is called
- **Then**:
  - Returns document with matching ID
  - All fields populated correctly
- **Acceptance Criteria**:
  - Returns `{ data: PrdDocument, error: null }`
  - `data.id` matches requested ID
  - `data.user_id` matches authenticated user
  - `data.questionnaire_data` is deserialized from JSONB
  - `data.generated_prd` is string or null
- **Technical Details**:
  - Use: `client.from('prd_documents').select('*').eq('id', id).single()`
  - RLS policy allows read when `user_id = auth.uid()`

#### Scenario 1.4: Read Single PRD Document by ID (Anonymous Document)
- **Given**:
  - Document exists with `user_id = NULL` (anonymous)
  - User is authenticated OR unauthenticated
- **When**: `getPrdDocumentById("anonymous-doc-uuid")` is called
- **Then**:
  - Returns anonymous document
  - Accessible by anyone (RLS allows `user_id IS NULL`)
- **Acceptance Criteria**:
  - Returns `{ data: PrdDocument, error: null }`
  - `data.user_id` is `null`
  - No authentication required
- **Technical Details**:
  - RLS policy: `user_id IS NULL` allows read by anyone

#### Scenario 1.5: List All PRD Documents for User (Paginated)
- **Given**:
  - User is authenticated (user_id = "auth-user-uuid-123")
  - User has 15 documents in database
  - Pagination: page 1, limit 10
- **When**: `getUserPrdDocuments(userId, { page: 1, limit: 10 })` is called
- **Then**:
  - Returns first 10 documents ordered by `created_at DESC`
  - Each document belongs to the user
  - Total count metadata included
- **Acceptance Criteria**:
  - Returns `{ data: PrdDocument[], count: 15, error: null }`
  - `data.length` is 10 (page size)
  - Documents sorted by newest first
  - Only user's documents returned (RLS enforced)
- **Technical Details**:
  - Query: `client.from('prd_documents').select('*', { count: 'exact' }).eq('user_id', userId).order('created_at', { ascending: false }).range(0, 9)`
  - RLS automatically filters by `user_id`

#### Scenario 1.6: Update PRD Document with Generated Content
- **Given**:
  - Document exists with `id = "doc-uuid-456"`
  - User owns this document (user_id matches)
  - Generated PRD content:
    ```markdown
    # AI PRD 생성기
    ## 프로젝트 개요
    ...
    ```
- **When**: `updatePrdDocument("doc-uuid-456", { generated_prd: content })` is called
- **Then**:
  - `generated_prd` field updated with new content
  - `updated_at` timestamp refreshed to NOW()
  - Other fields remain unchanged
- **Acceptance Criteria**:
  - Returns `{ data: PrdDocument, error: null }`
  - `data.generated_prd` matches new content
  - `data.updated_at` is greater than `created_at`
  - `data.questionnaire_data` unchanged
- **Technical Details**:
  - Use: `client.from('prd_documents').update({ generated_prd, updated_at: new Date().toISOString() }).eq('id', id).select().single()`
  - RLS policy allows update when `user_id = auth.uid()`

#### Scenario 1.7: Update Questionnaire Data (Re-edit)
- **Given**:
  - Document exists with existing questionnaire_data
  - User wants to modify Stage 1 data
  - Partial update: `{ stage1: { serviceName: "New Name" } }`
- **When**: `updatePrdDocument(id, { questionnaire_data: newData })` is called
- **Then**:
  - `questionnaire_data` fully replaced with new data
  - `updated_at` refreshed
  - `generated_prd` may be cleared or kept (design decision)
- **Acceptance Criteria**:
  - Returns `{ data: PrdDocument, error: null }`
  - `data.questionnaire_data` reflects new data
  - `data.updated_at` updated to current time
- **Technical Details**:
  - JSONB field is replaced entirely (not merged)
  - Client-side should merge partial updates before sending

#### Scenario 1.8: Delete PRD Document (Own Document)
- **Given**:
  - Document exists with `id = "doc-uuid-456"`
  - User is authenticated and owns the document
- **When**: `deletePrdDocument("doc-uuid-456")` is called
- **Then**:
  - Document permanently deleted from database
  - Returns success response
- **Acceptance Criteria**:
  - Returns `{ error: null }`
  - Subsequent read of same ID returns null/error
  - Database row no longer exists
- **Technical Details**:
  - Use: `client.from('prd_documents').delete().eq('id', id)`
  - RLS policy allows delete when `user_id = auth.uid()`
  - Hard delete (not soft delete)

---

### 2. Edge Cases

#### Scenario 2.1: Read Non-existent Document ID
- **Given**:
  - Document ID "non-existent-uuid" does NOT exist in database
  - User is authenticated
- **When**: `getPrdDocumentById("non-existent-uuid")` is called
- **Then**:
  - Returns null data with no error (Supabase behavior)
  - Client should handle gracefully
- **Acceptance Criteria**:
  - Returns `{ data: null, error: null }` (Supabase .single() returns null if not found)
  - No exception thrown
  - Client displays 404 page
- **Error Details**:
  - **Type**: NotFoundError (application-level)
  - **Message**: "요청한 문서를 찾을 수 없습니다"
  - **Recovery**: Redirect to homepage or document list

#### Scenario 2.2: Empty Questionnaire Data Array
- **Given**:
  - User submits empty coreFeatures: `[]`
  - Other fields valid
- **When**: `createPrdDocument(data, userId)` is called
- **Then**:
  - Zod validation rejects empty array (if required)
  - Error returned before database insertion
- **Acceptance Criteria**:
  - Returns `{ data: null, error: ZodError }`
  - Error message: "핵심 기능은 최소 1개 이상 입력해야 합니다"
  - No database mutation
- **Validation Rule**:
  - `coreFeatures: z.array(z.string()).min(1).max(10)`

#### Scenario 2.3: Maximum JSONB Size Limit
- **Given**:
  - Questionnaire data with extremely long strings (> 100KB total)
  - Each field within individual limits but total JSON size excessive
- **When**: `createPrdDocument(data, userId)` is called
- **Then**:
  - Validation catches oversized payload
  - Error before database insertion
- **Acceptance Criteria**:
  - Returns `{ data: null, error: ValidationError }`
  - Error message: "입력 데이터 크기가 제한을 초과했습니다 (최대 100KB)"
  - No database mutation
- **Validation Rule**:
  - Check: `JSON.stringify(data).length <= 100000` (100KB)

#### Scenario 2.4: Empty String for Generated PRD
- **Given**:
  - User updates document with `generated_prd = ""`
- **When**: `updatePrdDocument(id, { generated_prd: "" })` is called
- **Then**:
  - Accept empty string (valid state: PRD not yet generated)
  - Database stores empty string (not NULL)
- **Acceptance Criteria**:
  - Returns `{ data: PrdDocument, error: null }`
  - `data.generated_prd` is `""` (empty string)
  - Distinguished from NULL (never generated) vs "" (cleared)

#### Scenario 2.5: Special Characters in JSONB Data
- **Given**:
  - Questionnaire data contains special characters:
    - `serviceName: "AI \"PRD\" 생성기 <v1.0>"`
    - `userJourney: "Step 1 → Step 2 → Step 3"`
    - `references: "https://example.com?param=value&other=true"`
- **When**: `createPrdDocument(data, userId)` is called
- **Then**:
  - JSONB safely stores all special characters
  - Data retrieved without corruption
- **Acceptance Criteria**:
  - Stored data matches input exactly (no escaping issues)
  - Special characters: quotes, <>, &, →, emoji preserved
  - Retrieved data deep-equals original input
- **Technical Details**:
  - PostgreSQL JSONB handles escaping automatically
  - Test with: quotes, HTML tags, URLs, emojis, CJK characters

#### Scenario 2.6: Concurrent Updates (Optimistic Locking)
- **Given**:
  - Two clients have same document loaded
  - Client A updates `generated_prd` at time T
  - Client B updates `questionnaire_data` at time T+1ms
- **When**: Both updates execute concurrently
- **Then**:
  - Both updates succeed (last write wins)
  - No optimistic locking implemented (PostgreSQL default)
  - Client B's update overwrites Client A's timestamp
- **Acceptance Criteria**:
  - Last write wins (PostgreSQL default behavior)
  - No data loss if updating different fields (JSONB vs TEXT)
  - Client should fetch latest version before updates (best practice)
- **Technical Details**:
  - PostgreSQL row-level locking handles concurrency
  - Consider adding `version` column for optimistic locking (future enhancement)

#### Scenario 2.7: Null vs Undefined in Update Payload
- **Given**:
  - Update payload: `{ generated_prd: null }` vs `{ generated_prd: undefined }`
- **When**: `updatePrdDocument(id, payload)` is called
- **Then**:
  - `null` → clears field (sets to NULL)
  - `undefined` → field not updated (omitted from query)
- **Acceptance Criteria**:
  - `null`: Field set to NULL in database
  - `undefined`: Field ignored, existing value retained
  - TypeScript types enforce correct usage
- **Technical Details**:
  - Filter undefined values before Supabase query
  - Example: `Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined))`

#### Scenario 2.8: Very Long Generated PRD Content
- **Given**:
  - Generated PRD content is 500KB+ (very detailed document)
  - TEXT field in PostgreSQL (no size limit by default)
- **When**: `updatePrdDocument(id, { generated_prd: longContent })` is called
- **Then**:
  - Content stored successfully (TEXT field has no practical limit)
  - Retrieval may be slow for very large content
- **Acceptance Criteria**:
  - Content stored without truncation
  - No database error
  - Performance consideration: query time < 500ms even for large content
- **Technical Details**:
  - PostgreSQL TEXT field supports up to 1GB
  - Consider compression for very large content (future optimization)

---

### 3. Error States

#### Scenario 3.1: Unauthorized Access (Read Other User's Document)
- **Given**:
  - Document exists with `user_id = "user-A-uuid"`
  - User B is authenticated (user_id = "user-B-uuid")
  - User B attempts to read User A's document
- **When**: `getPrdDocumentById("user-A-doc-uuid")` is called by User B
- **Then**:
  - RLS policy blocks access
  - Returns empty result (no data)
- **Acceptance Criteria**:
  - Returns `{ data: null, error: null }` (RLS filters it out)
  - No exception thrown
  - Client displays 403 or 404 page
- **Error Details**:
  - **Type**: UnauthorizedError (application-level)
  - **Message**: "이 문서에 접근할 권한이 없습니다"
  - **Recovery**: Redirect to user's own documents

#### Scenario 3.2: Unauthorized Update (Modify Other User's Document)
- **Given**:
  - Document exists with `user_id = "user-A-uuid"`
  - User B attempts to update it
- **When**: `updatePrdDocument("user-A-doc-uuid", { generated_prd: "hacked" })` is called by User B
- **Then**:
  - RLS policy blocks update
  - Returns error
- **Acceptance Criteria**:
  - Returns `{ data: null, error: PostgrestError }` (RLS violation)
  - Database unchanged
  - Error logged for security monitoring
- **Error Details**:
  - **Type**: AuthorizationError
  - **Message**: "문서를 수정할 권한이 없습니다"
  - **Recovery**: Show error message, do not retry

#### Scenario 3.3: Unauthorized Delete (Delete Other User's Document)
- **Given**:
  - Document exists with `user_id = "user-A-uuid"`
  - User B attempts to delete it
- **When**: `deletePrdDocument("user-A-doc-uuid")` is called by User B
- **Then**:
  - RLS policy blocks delete
  - Document remains in database
- **Acceptance Criteria**:
  - Returns `{ error: PostgrestError }` (RLS violation)
  - Database unchanged
  - Error logged
- **Error Details**:
  - **Type**: AuthorizationError
  - **Message**: "문서를 삭제할 권한이 없습니다"
  - **Recovery**: Show error message

#### Scenario 3.4: Delete Anonymous Document (Forbidden)
- **Given**:
  - Document exists with `user_id = NULL` (anonymous)
  - Any user attempts to delete it
- **When**: `deletePrdDocument("anonymous-doc-uuid")` is called
- **Then**:
  - RLS policy blocks delete (no matching user_id)
  - Document remains in database
- **Acceptance Criteria**:
  - Returns `{ error: PostgrestError }` (RLS violation)
  - Anonymous documents cannot be deleted
  - Permanent storage (design decision)
- **Error Details**:
  - **Type**: ForbiddenError
  - **Message**: "익명 문서는 삭제할 수 없습니다"
  - **Recovery**: Inform user anonymous documents are permanent

#### Scenario 3.5: Network Connection Failure During Create
- **Given**:
  - Valid questionnaire data
  - Network disconnects during request
- **When**: `createPrdDocument(data, userId)` is called
- **Then**:
  - Request times out or fails
  - Returns network error
  - No database mutation (transaction rolls back)
- **Acceptance Criteria**:
  - Returns `{ data: null, error: NetworkError }`
  - Error message: "네트워크 연결을 확인해주세요"
  - Retry button displayed
  - No partial data in database
- **Error Details**:
  - **Type**: NetworkError (fetch failure)
  - **Message**: "네트워크 연결을 확인해주세요"
  - **Recovery**: Retry mechanism with exponential backoff

#### Scenario 3.6: Database Connection Pool Exhausted
- **Given**:
  - Supabase project under heavy load
  - All database connections in use
- **When**: Any database operation is called
- **Then**:
  - Supabase returns 500 error
  - Request queued or rejected
- **Acceptance Criteria**:
  - Returns `{ data: null, error: ServiceUnavailableError }`
  - Error message: "서비스가 일시적으로 이용 불가능합니다. 잠시 후 다시 시도해주세요"
  - Auto-retry after delay
- **Error Details**:
  - **Type**: ServiceUnavailableError
  - **Message**: "서비스가 일시적으로 이용 불가능합니다"
  - **Recovery**: Exponential backoff retry (3 attempts)

#### Scenario 3.7: Invalid UUID Format
- **Given**:
  - Document ID "not-a-valid-uuid" (invalid format)
- **When**: `getPrdDocumentById("not-a-valid-uuid")` is called
- **Then**:
  - Validation rejects invalid UUID before query
  - Returns error
- **Acceptance Criteria**:
  - Returns `{ data: null, error: ValidationError }`
  - Error message: "올바르지 않은 문서 ID 형식입니다"
  - No database query executed
- **Validation Rule**:
  - Use Zod: `z.string().uuid()`
  - Validate before all database operations

#### Scenario 3.8: JSONB Schema Validation Failure
- **Given**:
  - Questionnaire data missing required field: `serviceName`
  - Other fields valid
- **When**: `createPrdDocument(invalidData, userId)` is called
- **Then**:
  - Zod validation fails before database insertion
  - Returns validation error with specific field
- **Acceptance Criteria**:
  - Returns `{ data: null, error: ZodError }`
  - Error message: "서비스 이름은 필수입니다"
  - Error points to specific field: `stage1.serviceName`
  - No database mutation
- **Validation Schema**:
  ```typescript
  const questionnaireDataSchema = z.object({
    stage1: z.object({
      serviceName: z.string().min(1, "서비스 이름은 필수입니다").max(100),
      coreFeatures: z.array(z.string()).min(1).max(10),
      mainScreens: z.string().min(1),
      userJourney: z.string().min(1),
      serviceMood: z.string().min(1)
    }),
    stage2: z.object({ /* ... */ }),
    stage3: z.object({ /* ... */ }),
    currentStage: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    completedStages: z.instanceof(Set)
  });
  ```

---

### 4. State Transitions

#### Scenario 4.1: Document Lifecycle (Create → Update → Delete)
- **Initial State**: No document exists
- **Transition Steps**:
  1. **Create**: User submits questionnaire
     - Expected: Document created with `generated_prd = NULL`
     - State: `{ id, user_id, questionnaire_data, generated_prd: null, created_at, updated_at }`
  2. **Update (Generate PRD)**: AI generates PRD content
     - Expected: `generated_prd` populated, `updated_at` refreshed
     - State: `{ ..., generated_prd: "# PRD Content", updated_at: T+5s }`
  3. **Update (Re-edit)**: User modifies questionnaire
     - Expected: `questionnaire_data` updated, `generated_prd` optionally cleared
     - State: `{ ..., questionnaire_data: newData, updated_at: T+10s }`
  4. **Delete**: User deletes document
     - Expected: Document removed from database
     - State: Document no longer exists
- **Invariants**:
  - `created_at` never changes
  - `updated_at` always >= `created_at`
  - `id` remains constant throughout lifecycle
  - `user_id` immutable (cannot transfer ownership)

#### Scenario 4.2: Anonymous → Authenticated Conversion
- **Initial State**:
  - User creates document anonymously (user_id = NULL)
  - Document ID: "anon-doc-uuid"
- **Transition Steps**:
  1. User signs in with Google
     - Expected: User now has `auth.uid()`
  2. User wants to claim anonymous document
     - Expected: Update `user_id` from NULL → `auth.uid()`
     - Query: `UPDATE prd_documents SET user_id = 'auth.uid()' WHERE id = 'anon-doc-uuid' AND user_id IS NULL`
  3. Document now owned by user
     - Expected: User can delete/update document
     - RLS policies now apply
- **Invariants**:
  - Only NULL → user_id transition allowed (not user A → user B)
  - Once claimed, cannot revert to anonymous

#### Scenario 4.3: Re-generation Flow (Update After PRD Generated)
- **Initial State**:
  - Document exists with generated PRD
  - User modifies Stage 1 data
- **Transition Steps**:
  1. User edits questionnaire (Stage 1 serviceName changed)
     - Expected: `questionnaire_data` updated
     - Decision: Clear `generated_prd` or mark as "stale"?
  2. User triggers re-generation
     - Expected: AI generates new PRD based on updated questionnaire
     - `generated_prd` replaced with new content
  3. `updated_at` reflects latest change
- **Invariants**:
  - Old PRD content lost (no version history in MVP)
  - Consider adding `prd_version` counter (future enhancement)

---

### 5. Integration Scenarios

#### Scenario 5.1: Zustand Store + Database Sync
- **Components Involved**:
  - `useQuestionnaireStore` (Zustand)
  - `createPrdDocument` (database operation)
  - Client component (form submission)
- **Data Flow**:
  1. User fills questionnaire → Zustand store updated
  2. Zustand middleware syncs to localStorage
  3. User clicks "PRD 생성" → read from Zustand store
  4. Call `createPrdDocument(store.getState(), userId)`
  5. Database returns inserted document with `id`
  6. Navigate to `/prd/[id]` page
- **Side Effects**:
  - localStorage updated by Zustand
  - Database record created
  - Navigation triggered
  - Zustand store may be reset after successful submission

#### Scenario 5.2: Server Component + Database Query
- **Components Involved**:
  - Server Component (`app/prd/[id]/page.tsx`)
  - Server Supabase client
  - PRD display component
- **Data Flow**:
  1. User navigates to `/prd/doc-uuid-456`
  2. Server component creates server client with cookies
  3. Server queries: `getPrdDocumentById("doc-uuid-456")`
  4. RLS policy checks user authentication
  5. Data returned, rendered as React Server Component
  6. HTML streamed to client
- **Side Effects**:
  - No client-side state mutation
  - SEO-friendly (SSR)
  - Auth state from cookies used for RLS

#### Scenario 5.3: API Route + Database Mutation
- **Components Involved**:
  - API route (`app/api/prd/route.ts`)
  - Server Supabase client
  - Client-side fetch
- **Data Flow**:
  1. Client sends POST request: `/api/prd` with questionnaire_data
  2. API route validates request body (Zod)
  3. API route creates server client
  4. API route calls `createPrdDocument(data, userId)`
  5. Database returns inserted document
  6. API route returns JSON: `{ id, created_at }`
  7. Client receives response, navigates to `/prd/[id]`
- **Side Effects**:
  - Database mutation committed
  - Response cached by Next.js (if GET)
  - Revalidation may be triggered

#### Scenario 5.4: RLS Policy Enforcement Across Contexts
- **Components Involved**:
  - Browser client (client component)
  - Server client (server component)
  - API route handler
  - Database RLS policies
- **Data Flow**:
  1. **Browser context**: User A logged in
     - Client query: `getPrdDocumentById("user-A-doc")` → Success
     - Client query: `getPrdDocumentById("user-B-doc")` → Blocked by RLS
  2. **Server context**: Same user session from cookies
     - Server query: `getPrdDocumentById("user-A-doc")` → Success
     - RLS uses `auth.uid()` from cookies
  3. **API route context**: Server client with cookies
     - Same RLS enforcement as server component
- **Side Effects**:
  - Authorization handled at database level
  - No application-level permission checks needed
  - Consistent security across all contexts

---

### 6. Performance & UX Scenarios

#### Scenario 6.1: Pagination Performance (Large Dataset)
- **Performance Requirement**:
  - Query 10 documents from user with 1000+ documents
  - Response time < 200ms
- **UX Expectation**:
  - Smooth pagination, no lag
  - Total count displayed correctly
- **Measurement**:
  - Query: `SELECT * FROM prd_documents WHERE user_id = 'uuid' ORDER BY created_at DESC LIMIT 10 OFFSET 0`
  - Verify: Index on (user_id, created_at) is used
  - Performance: P95 query latency < 200ms
- **Technical Details**:
  - Index: `CREATE INDEX idx_prd_user_created ON prd_documents(user_id, created_at DESC)`
  - Supabase automatically uses index for sorting

#### Scenario 6.2: JSONB Query Performance
- **Performance Requirement**:
  - Filter documents by serviceName (JSONB field)
  - Query: `SELECT * WHERE questionnaire_data->'stage1'->>'serviceName' = 'AI PRD 생성기'`
  - Response time < 500ms (JSONB queries slower than indexed columns)
- **UX Expectation**:
  - Search results appear quickly
  - Loading state shown during query
- **Measurement**:
  - Consider adding GIN index on questionnaire_data: `CREATE INDEX idx_questionnaire_data_gin ON prd_documents USING GIN (questionnaire_data)`
  - Performance: P95 query latency < 500ms
- **Technical Details**:
  - GIN index supports JSONB queries
  - Trade-off: Faster reads, slower writes

#### Scenario 6.3: Large Result Set Loading
- **Performance Requirement**:
  - User has 500 documents
  - Load first 10 instantly
  - Remaining pages load on-demand
- **UX Expectation**:
  - Virtual scrolling or pagination
  - No full dataset load on initial render
- **Measurement**:
  - Initial page load: < 1 second
  - Subsequent pages: < 300ms each
- **Technical Details**:
  - Use cursor-based pagination for better performance
  - Example: `SELECT * WHERE created_at < 'cursor' ORDER BY created_at DESC LIMIT 10`

#### Scenario 6.4: Optimistic UI Updates
- **Performance Requirement**:
  - User clicks "삭제" button
  - UI updates immediately (optimistic)
  - Database deletion happens in background
- **UX Expectation**:
  - Instant feedback, no waiting
  - Rollback if deletion fails
- **Measurement**:
  - UI update: 0ms (synchronous)
  - Database deletion: < 300ms (async)
  - Rollback animation: < 200ms if failed
- **Technical Details**:
  - Client-side: Remove item from list immediately
  - Server call: `deletePrdDocument(id)` in background
  - On error: Re-insert item with error toast

---

## Boundary Value Analysis

### Input: `id` (Document UUID)
- **Type**: `string` (UUID v4 format)
- **Valid Range**: Valid UUID format
- **Test Values**:
  - Below minimum: `""` → error "문서 ID가 제공되지 않았습니다"
  - Invalid format: `"not-a-uuid"` → error "올바르지 않은 문서 ID 형식입니다"
  - Valid UUID: `"550e8400-e29b-41d4-a716-446655440000"` → valid
  - Non-existent UUID: `"00000000-0000-0000-0000-000000000000"` → not found (null data)
  - Special characters: `"abc-123-xyz"` → error "올바르지 않은 문서 ID 형식입니다"
- **Validation**:
  - Zod schema: `z.string().uuid("올바르지 않은 문서 ID 형식입니다")`

### Input: `user_id` (User UUID or NULL)
- **Type**: `string | null`
- **Valid Range**: Valid UUID or NULL (anonymous)
- **Test Values**:
  - NULL: `null` → valid (anonymous document)
  - Valid UUID: `"user-uuid-123"` → valid
  - Invalid UUID: `"invalid"` → error (caught by Zod)
  - Empty string: `""` → error "사용자 ID 형식이 올바르지 않습니다"
- **Validation**:
  - Zod schema: `z.string().uuid().nullable()`

### Input: `questionnaire_data` (JSONB Object)
- **Type**: `QuestionnaireState` (complex object)
- **Valid Range**: Must satisfy Zod schema
- **Test Values**:
  - Minimal valid:
    ```typescript
    {
      stage1: {
        serviceName: "A",
        coreFeatures: ["F1"],
        mainScreens: "S1",
        userJourney: "J1",
        serviceMood: "M1"
      },
      stage2: { /* minimal valid */ },
      stage3: { /* minimal valid */ },
      currentStage: 1,
      completedStages: new Set([1])
    }
    ```
  - Maximum valid: All fields at max length (e.g., serviceName 100 chars, coreFeatures 10 items)
  - Missing required field: `{ stage1: { /* missing serviceName */ } }` → error
  - Extra fields: `{ stage1: { ..., extraField: "value" } }` → stripped by Zod `.strict()` or allowed
  - Invalid type: `{ stage1: { serviceName: 123 } }` → error "서비스 이름은 문자열이어야 합니다"
  - Empty arrays: `{ stage1: { coreFeatures: [] } }` → error "최소 1개 이상"
- **Validation**:
  - Full Zod schema covering all Stage1/2/3 fields
  - Nested validation for arrays and objects

### Input: `generated_prd` (TEXT)
- **Type**: `string | null`
- **Valid Range**: Any string length (PostgreSQL TEXT has no limit)
- **Test Values**:
  - NULL: `null` → valid (not yet generated)
  - Empty string: `""` → valid (cleared)
  - Short content: `"# Title\nContent"` → valid
  - Long content: 500KB markdown → valid (performance consideration)
  - Unicode: `"한글 콘텐츠 🚀"` → valid
  - Special chars: `"<script>alert('xss')</script>"` → valid (stored as-is, escaped on render)
- **Validation**:
  - Zod schema: `z.string().nullable()`
  - Consider max length validation for performance: `z.string().max(1000000)` (1MB)

### Input: Pagination Parameters
- **Type**: `{ page: number, limit: number }`
- **Valid Range**: page >= 1, limit 1-100
- **Test Values**:
  - Below minimum: `{ page: 0, limit: 0 }` → error "페이지는 1 이상이어야 합니다"
  - At minimum: `{ page: 1, limit: 1 }` → valid
  - Normal: `{ page: 2, limit: 10 }` → valid
  - At maximum: `{ page: 9999, limit: 100 }` → valid (may return empty array)
  - Above maximum: `{ page: 1, limit: 1000 }` → error "페이지 크기는 최대 100입니다"
  - Negative: `{ page: -1, limit: 10 }` → error
  - Float: `{ page: 1.5, limit: 10.7 }` → coerced to int or error
- **Validation**:
  - Zod schema:
    ```typescript
    z.object({
      page: z.number().int().min(1, "페이지는 1 이상이어야 합니다"),
      limit: z.number().int().min(1).max(100, "페이지 크기는 최대 100입니다")
    })
    ```

---

## Accessibility Scenarios

**Note**: Database operations are backend logic, no direct UI accessibility concerns. However:

- Error messages must be clear and Korean
- Loading states should be announced to screen readers (client-side)
- Success/failure feedback should use ARIA live regions

---

## Localization Scenarios

### All User-Facing Error Messages (Korean)

| Scenario | Error Type | Korean Message | English (Dev/Logs) |
|----------|-----------|----------------|-------------------|
| Missing document | NotFoundError | "요청한 문서를 찾을 수 없습니다" | "Document not found" |
| Unauthorized read | UnauthorizedError | "이 문서에 접근할 권한이 없습니다" | "Access denied" |
| Unauthorized update | AuthorizationError | "문서를 수정할 권한이 없습니다" | "Update not allowed" |
| Unauthorized delete | AuthorizationError | "문서를 삭제할 권한이 없습니다" | "Delete not allowed" |
| Anonymous delete | ForbiddenError | "익명 문서는 삭제할 수 없습니다" | "Anonymous documents cannot be deleted" |
| Network error | NetworkError | "네트워크 연결을 확인해주세요" | "Network connection failed" |
| Service unavailable | ServiceUnavailableError | "서비스가 일시적으로 이용 불가능합니다. 잠시 후 다시 시도해주세요" | "Service temporarily unavailable" |
| Invalid UUID | ValidationError | "올바르지 않은 문서 ID 형식입니다" | "Invalid document ID format" |
| Missing serviceName | ZodError | "서비스 이름은 필수입니다" | "Service name is required" |
| Empty coreFeatures | ZodError | "핵심 기능은 최소 1개 이상 입력해야 합니다" | "At least 1 core feature required" |
| Oversized payload | ValidationError | "입력 데이터 크기가 제한을 초과했습니다 (최대 100KB)" | "Payload size exceeds limit" |
| Invalid page number | ValidationError | "페이지는 1 이상이어야 합니다" | "Page must be >= 1" |
| Excessive limit | ValidationError | "페이지 크기는 최대 100입니다" | "Page size max 100" |

---

## Test Data Examples

### Valid Data Sets

```typescript
// Example 1: Minimal valid authenticated document
const minimalAuthDoc = {
  user_id: "550e8400-e29b-41d4-a716-446655440000",
  questionnaire_data: {
    stage1: {
      serviceName: "AI PRD Generator",
      coreFeatures: ["Form", "AI", "Download"],
      mainScreens: "Home, Form, Result",
      userJourney: "Fill form → Generate → Download",
      serviceMood: "Professional"
    },
    stage2: {
      themes: ["minimal"],
      brandKeywords: ["simple", "fast", "smart"],
      colorSystem: { primary: "#0ea5e9", background: "#ffffff" },
      typography: "gothic" as const,
      uiDetails: {
        buttonRadius: "md" as const,
        iconWeight: "regular" as const,
        shadowIntensity: "sm" as const
      },
      references: ""
    },
    stage3: {
      techStack: {
        frontend: ["Next.js"],
        database: ["Supabase"],
        backend: [],
        other: []
      },
      dataManagement: {
        realtimeRequired: false,
        largeMediaHandling: false
      },
      externalAPIs: [],
      exceptionHandling: "Show error message"
    },
    currentStage: 3 as const,
    completedStages: new Set([1, 2, 3])
  },
  generated_prd: null
};

// Example 2: Anonymous document with generated PRD
const anonDocWithPrd = {
  user_id: null,
  questionnaire_data: { /* same structure */ },
  generated_prd: `# AI PRD 생성기

## 프로젝트 개요
3단계 질문을 통해 PRD를 자동 생성하는 서비스

## 핵심 기능
1. 질문지 폼
2. AI 기반 PRD 생성
3. 마크다운 다운로드

...
`
};

// Example 3: Full questionnaire with all fields populated
const fullQuestionnaireDoc = {
  user_id: "user-uuid-123",
  questionnaire_data: {
    stage1: {
      serviceName: "AI PRD 생성기 v2.0",
      coreFeatures: [
        "3단계 질문지 폼",
        "Gemini API 연동 PRD 생성",
        ".md/.pdf 다운로드",
        "사용자 히스토리",
        "Google OAuth 로그인"
      ],
      mainScreens: "홈, 질문지, 생성 중, 결과, 히스토리",
      userJourney: "질문 작성 → AI 생성 → 결과 확인 → 다운로드 → 히스토리 저장",
      serviceMood: "전문적이면서도 접근하기 쉬운, 효율적이고 신뢰감 있는"
    },
    stage2: {
      themes: ["minimal", "interactive", "trustworthy"],
      brandKeywords: ["AI", "효율성", "전문성"],
      colorSystem: {
        primary: "#0ea5e9",
        background: "#ffffff"
      },
      typography: "gothic" as const,
      customFont: undefined,
      uiDetails: {
        buttonRadius: "md" as const,
        iconWeight: "regular" as const,
        shadowIntensity: "md" as const
      },
      references: "Notion, Linear, Figma"
    },
    stage3: {
      techStack: {
        frontend: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS"],
        database: ["Supabase"],
        backend: ["Next.js API Routes"],
        other: ["Vercel AI SDK", "Gemini API"]
      },
      dataManagement: {
        realtimeRequired: false,
        largeMediaHandling: false
      },
      externalAPIs: ["Google Gemini API", "Google OAuth"],
      authMethod: "email" as const,
      exceptionHandling: "에러 발생 시 사용자에게 명확한 메시지 표시, 재시도 옵션 제공"
    },
    currentStage: 3 as const,
    completedStages: new Set([1, 2, 3])
  },
  generated_prd: null
};
```

### Invalid Data Sets

```typescript
// Example 1: Missing required field (serviceName)
const missingServiceName = {
  user_id: "user-uuid-123",
  questionnaire_data: {
    stage1: {
      // serviceName missing!
      coreFeatures: ["F1"],
      mainScreens: "S1",
      userJourney: "J1",
      serviceMood: "M1"
    },
    stage2: { /* ... */ },
    stage3: { /* ... */ },
    currentStage: 1,
    completedStages: new Set([1])
  },
  generated_prd: null
};
// Expected: ZodError "서비스 이름은 필수입니다"

// Example 2: Invalid UUID format
const invalidUserId = {
  user_id: "not-a-uuid",
  questionnaire_data: { /* valid */ },
  generated_prd: null
};
// Expected: ZodError "올바르지 않은 사용자 ID 형식입니다"

// Example 3: Empty coreFeatures array
const emptyCoreFeatures = {
  user_id: "user-uuid-123",
  questionnaire_data: {
    stage1: {
      serviceName: "Test",
      coreFeatures: [], // Empty!
      mainScreens: "S1",
      userJourney: "J1",
      serviceMood: "M1"
    },
    // ...
  },
  generated_prd: null
};
// Expected: ZodError "핵심 기능은 최소 1개 이상 입력해야 합니다"

// Example 4: Invalid type (serviceName is number)
const invalidType = {
  user_id: "user-uuid-123",
  questionnaire_data: {
    stage1: {
      serviceName: 12345, // Should be string!
      coreFeatures: ["F1"],
      mainScreens: "S1",
      userJourney: "J1",
      serviceMood: "M1"
    },
    // ...
  },
  generated_prd: null
};
// Expected: ZodError "서비스 이름은 문자열이어야 합니다"

// Example 5: Oversized payload (> 100KB)
const oversizedPayload = {
  user_id: "user-uuid-123",
  questionnaire_data: {
    stage1: {
      serviceName: "A".repeat(200000), // Way too long!
      coreFeatures: ["F1"],
      mainScreens: "S1",
      userJourney: "J1",
      serviceMood: "M1"
    },
    // ...
  },
  generated_prd: null
};
// Expected: ValidationError "입력 데이터 크기가 제한을 초과했습니다"
```

---

## Mock Requirements

### Supabase Client Mocking

```typescript
import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client for CRUD tests
export const mockSupabaseClient = {
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockDocument, error: null }),
    // Mock successful responses
    mockResolvedValueOnce: vi.fn()
  }))
} as unknown as SupabaseClient;

// Mock document data
export const mockDocument = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  user_id: "user-uuid-123",
  questionnaire_data: {
    stage1: {
      serviceName: "Test Service",
      coreFeatures: ["F1", "F2"],
      mainScreens: "S1, S2",
      userJourney: "J1 → J2",
      serviceMood: "Professional"
    },
    stage2: { /* ... */ },
    stage3: { /* ... */ },
    currentStage: 3,
    completedStages: new Set([1, 2, 3])
  },
  generated_prd: null,
  created_at: "2026-01-07T10:00:00Z",
  updated_at: "2026-01-07T10:00:00Z"
};

// Mock error responses
export const mockNotFoundError = {
  data: null,
  error: null // Supabase returns null for both if not found
};

export const mockUnauthorizedError = {
  data: null,
  error: {
    message: "row-level security policy violation",
    code: "42501"
  }
};

export const mockNetworkError = {
  data: null,
  error: {
    message: "FetchError: Failed to fetch",
    code: "NETWORK_ERROR"
  }
};

// Mock pagination response
export const mockPaginatedResponse = {
  data: [mockDocument, { ...mockDocument, id: "doc-uuid-2" }],
  count: 15, // Total count
  error: null
};
```

### Zod Schema Mocking

```typescript
// Mock Zod validation for tests
import { z } from 'zod';

export const questionnaireDataSchema = z.object({
  stage1: z.object({
    serviceName: z.string().min(1, "서비스 이름은 필수입니다").max(100),
    coreFeatures: z.array(z.string()).min(1, "핵심 기능은 최소 1개 이상 입력해야 합니다").max(10),
    mainScreens: z.string().min(1),
    userJourney: z.string().min(1),
    serviceMood: z.string().min(1)
  }),
  stage2: z.object({
    themes: z.array(z.string()),
    brandKeywords: z.array(z.string()),
    colorSystem: z.object({
      primary: z.string(),
      background: z.string()
    }),
    typography: z.enum(["gothic", "serif", "custom"]),
    customFont: z.string().optional(),
    uiDetails: z.object({
      buttonRadius: z.enum(["none", "sm", "md", "lg", "full"]),
      iconWeight: z.enum(["thin", "regular", "bold"]),
      shadowIntensity: z.enum(["none", "sm", "md", "lg"])
    }),
    references: z.string()
  }),
  stage3: z.object({
    techStack: z.object({
      frontend: z.array(z.string()),
      database: z.array(z.string()),
      backend: z.array(z.string()),
      other: z.array(z.string())
    }),
    dataManagement: z.object({
      realtimeRequired: z.boolean(),
      largeMediaHandling: z.boolean()
    }),
    externalAPIs: z.array(z.string()),
    authMethod: z.enum(["email", "two-factor"]).optional(),
    exceptionHandling: z.string()
  }),
  currentStage: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  completedStages: z.instanceof(Set)
});

export const uuidSchema = z.string().uuid("올바르지 않은 문서 ID 형식입니다");

export const paginationSchema = z.object({
  page: z.number().int().min(1, "페이지는 1 이상이어야 합니다"),
  limit: z.number().int().min(1).max(100, "페이지 크기는 최대 100입니다")
});
```

### RLS Policy Testing Mocks

```typescript
// Mock different user contexts for RLS testing
export const mockAuthContexts = {
  authenticatedUserA: {
    uid: "user-A-uuid",
    session: { access_token: "token-A" }
  },
  authenticatedUserB: {
    uid: "user-B-uuid",
    session: { access_token: "token-B" }
  },
  anonymous: {
    uid: null,
    session: null
  }
};

// Mock RLS enforcement (client-side simulation)
export function applyRlsFilter(documents: any[], currentUserId: string | null) {
  return documents.filter(doc =>
    doc.user_id === currentUserId || doc.user_id === null
  );
}
```

---

## Notes for Test Writer

### Critical Implementation Details

1. **Database Type Definitions**:
   - Create `src/lib/supabase/types.ts` with:
     ```typescript
     export interface PrdDocument {
       id: string;
       user_id: string | null;
       questionnaire_data: QuestionnaireState;
       generated_prd: string | null;
       created_at: string;
       updated_at: string;
     }

     export type PrdDocumentInsert = Omit<PrdDocument, 'id' | 'created_at' | 'updated_at'>;
     export type PrdDocumentUpdate = Partial<Pick<PrdDocument, 'questionnaire_data' | 'generated_prd'>>;
     ```

2. **CRUD Functions to Implement** (`src/lib/supabase/db.ts`):
   ```typescript
   // CREATE
   async function createPrdDocument(
     questionnaireData: QuestionnaireState,
     userId: string | null
   ): Promise<{ data: PrdDocument | null, error: Error | null }>

   // READ
   async function getPrdDocumentById(
     id: string
   ): Promise<{ data: PrdDocument | null, error: Error | null }>

   async function getUserPrdDocuments(
     userId: string,
     options?: { page?: number, limit?: number }
   ): Promise<{ data: PrdDocument[], count: number, error: Error | null }>

   // UPDATE
   async function updatePrdDocument(
     id: string,
     updates: PrdDocumentUpdate
   ): Promise<{ data: PrdDocument | null, error: Error | null }>

   // DELETE
   async function deletePrdDocument(
     id: string
   ): Promise<{ error: Error | null }>
   ```

3. **Validation Strategy**:
   - Always validate input BEFORE database operations
   - Use Zod schemas for all input validation
   - Return Korean error messages for user-facing errors
   - Log English error messages for developers
   - Example:
     ```typescript
     const result = questionnaireDataSchema.safeParse(data);
     if (!result.success) {
       return { data: null, error: new ValidationError(result.error.errors[0].message) };
     }
     ```

4. **Error Handling Pattern**:
   ```typescript
   try {
     // Validate input
     const validatedData = questionnaireDataSchema.parse(data);

     // Database operation
     const { data, error } = await client
       .from('prd_documents')
       .insert({ questionnaire_data: validatedData, user_id: userId })
       .select()
       .single();

     if (error) {
       // Handle Supabase errors
       if (error.code === '42501') {
         return { data: null, error: new AuthorizationError("문서를 생성할 권한이 없습니다") };
       }
       throw error;
     }

     return { data, error: null };
   } catch (error) {
     // Handle unexpected errors
     if (error instanceof z.ZodError) {
       return { data: null, error: new ValidationError(error.errors[0].message) };
     }
     return { data: null, error: new Error("알 수 없는 오류가 발생했습니다") };
   }
   ```

5. **RLS Testing Strategy**:
   - Test with different user contexts (authenticated, anonymous)
   - Verify RLS policies block unauthorized access
   - Test that anonymous documents are accessible by all
   - Test that users can only modify their own documents
   - Use Supabase's `rpc` function to test policies if needed

6. **Performance Considerations**:
   - Use indexes for frequent queries (user_id, created_at)
   - Limit JSONB queries (slower than indexed columns)
   - Use pagination for large datasets
   - Consider adding GIN index on questionnaire_data for search

7. **Type Safety**:
   - Always use typed Supabase client: `SupabaseClient<Database>`
   - Ensure QuestionnaireState type matches JSONB structure
   - Use TypeScript strict mode
   - Validate all external data with Zod

### Test Organization Suggestions

```
src/lib/supabase/__tests__/
├── db.test.ts                 # Main CRUD operation tests
│   ├── describe('createPrdDocument')
│   │   ├── Happy Path (authenticated)
│   │   ├── Happy Path (anonymous)
│   │   ├── Validation errors
│   │   └── Network errors
│   ├── describe('getPrdDocumentById')
│   │   ├── Own document
│   │   ├── Anonymous document
│   │   ├── Other user's document (RLS)
│   │   └── Non-existent ID
│   ├── describe('getUserPrdDocuments')
│   │   ├── Pagination
│   │   ├── Empty results
│   │   └── Large dataset
│   ├── describe('updatePrdDocument')
│   │   ├── Update generated_prd
│   │   ├── Update questionnaire_data
│   │   ├── Unauthorized update (RLS)
│   │   └── Concurrent updates
│   └── describe('deletePrdDocument')
│       ├── Own document
│       ├── Anonymous document (forbidden)
│       └── Other user's document (RLS)
├── validation.test.ts         # Zod schema validation tests
└── rls.test.ts                # RLS policy enforcement tests (optional)
```

### Performance Benchmarks

- **createPrdDocument**: < 300ms (includes validation + DB insert)
- **getPrdDocumentById**: < 100ms (indexed query)
- **getUserPrdDocuments** (10 items): < 200ms (indexed, paginated)
- **updatePrdDocument**: < 200ms (indexed update)
- **deletePrdDocument**: < 150ms (indexed delete)

### Dependencies to Install

```bash
npm install @supabase/supabase-js zod
npm install -D @types/node vitest
```

### TypeScript Configuration

Ensure `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "strict": true,
    "types": ["vitest/globals", "node"],
    "lib": ["ES2022", "DOM"]
  }
}
```

---

## Checklist for Test Writer

Before implementing tests, verify:

- [ ] All happy path scenarios have corresponding test cases
- [ ] All edge cases (invalid UUIDs, empty data, etc.) are tested
- [ ] All error states have Korean error messages
- [ ] RLS policies are tested (authenticated vs anonymous)
- [ ] CRUD operations are tested separately (Create, Read, Update, Delete)
- [ ] Zod schemas are defined and tested
- [ ] Type safety is verified (TypeScript types match database schema)
- [ ] Mocks are properly set up for Supabase client
- [ ] Pagination is tested (page, limit, offset)
- [ ] Performance benchmarks are in place (< 300ms for writes)
- [ ] All tests use Korean error messages for user-facing errors
- [ ] Test data examples (valid/invalid) are used consistently
- [ ] Concurrent update scenarios are considered
- [ ] Anonymous document scenarios are tested
- [ ] Boundary value analysis is applied to all inputs

---

**Document Version**: 1.0
**Last Updated**: 2026-01-07
**Status**: Ready for RED phase (test writing)
**Next Step**: Create test file `src/lib/supabase/__tests__/db.test.ts`
**Related Documents**:
- `docs/scenarios/supabase-setup.md` (infrastructure setup)
- `PLAN.md` (Phase 2-2: Database Schema Design)
