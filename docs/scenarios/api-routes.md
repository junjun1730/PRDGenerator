# API Routes - Test Scenarios

> **Feature**: REST API for PRD Document Management
> **작성일**: 2026-01-09
> **작성자**: Claude Code

---

## Context

### API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/prd | Create PRD document | Optional (anonymous allowed) |
| GET | /api/prd | List user's documents | Required |
| GET | /api/prd/[id] | Get single document | RLS auto |
| PUT | /api/prd/[id] | Update document | Required + ownership |
| DELETE | /api/prd/[id] | Delete document | Required + ownership |

### Dependencies

- `src/lib/supabase/db.ts` - CRUD functions
- `src/lib/supabase/server.ts` - Server client
- `src/lib/supabase/types.ts` - TypeScript types
- Row Level Security (RLS) policies in Supabase

---

## 1. POST /api/prd (Create Document)

### 1.1 Happy Path

#### Scenario: Authenticated user creates document
```
Given: User is authenticated (valid session)
When: POST /api/prd with valid questionnaire_data
Then:
  - Status: 201 Created
  - Response: { data: PrdDocument }
  - Document has user_id = authenticated user's id
  - Document has generated_prd = null
  - created_at and updated_at are set
```

#### Scenario: Anonymous user creates document
```
Given: User is not authenticated (no session)
When: POST /api/prd with valid questionnaire_data
Then:
  - Status: 201 Created
  - Response: { data: PrdDocument }
  - Document has user_id = null
```

### 1.2 Edge Cases

#### Scenario: Empty serviceName
```
Given: User submits with stage1.serviceName = ""
When: POST /api/prd
Then:
  - Status: 400 Bad Request
  - Response: { error: { code: "VALIDATION_ERROR", message: "서비스 이름은 필수입니다" } }
```

#### Scenario: Empty coreFeatures array
```
Given: User submits with stage1.coreFeatures = []
When: POST /api/prd
Then:
  - Status: 400 Bad Request
  - Response: { error: { code: "VALIDATION_ERROR", message: "핵심 기능은 최소 1개 이상 입력해야 합니다" } }
```

#### Scenario: Oversized payload (> 100KB)
```
Given: User submits questionnaire_data larger than 100KB
When: POST /api/prd
Then:
  - Status: 400 Bad Request
  - Response: { error: { code: "VALIDATION_ERROR", message: "데이터 크기가 너무 큽니다 (최대 100KB)" } }
```

#### Scenario: Special characters in data
```
Given: User submits with serviceName containing special chars (한글, emoji, etc.)
When: POST /api/prd
Then:
  - Status: 201 Created
  - Data is properly escaped and stored
```

### 1.3 Error States

#### Scenario: Invalid JSON body
```
Given: Request body is not valid JSON
When: POST /api/prd
Then:
  - Status: 400 Bad Request
  - Response: { error: { code: "VALIDATION_ERROR", message: "잘못된 JSON 형식입니다" } }
```

#### Scenario: Missing questionnaire_data field
```
Given: Request body does not contain questionnaire_data
When: POST /api/prd
Then:
  - Status: 400 Bad Request
  - Response: { error: { code: "VALIDATION_ERROR", message: "questionnaire_data는 필수입니다" } }
```

#### Scenario: Database unavailable
```
Given: Supabase is unavailable
When: POST /api/prd
Then:
  - Status: 503 Service Unavailable
  - Response: { error: { code: "SERVICE_UNAVAILABLE", message: "서비스를 일시적으로 사용할 수 없습니다" } }
```

---

## 2. GET /api/prd/[id] (Get Single Document)

### 2.1 Happy Path

#### Scenario: Get own document
```
Given: User is authenticated
And: Document with [id] exists with user_id = current user
When: GET /api/prd/[id]
Then:
  - Status: 200 OK
  - Response: { data: PrdDocument }
  - All fields returned (questionnaire_data, generated_prd, timestamps)
```

#### Scenario: Get anonymous document
```
Given: Document with [id] exists with user_id = null
When: GET /api/prd/[id] (authenticated or not)
Then:
  - Status: 200 OK
  - Response: { data: PrdDocument }
```

### 2.2 Edge Cases

#### Scenario: Invalid UUID format
```
Given: [id] is not a valid UUID (e.g., "abc123")
When: GET /api/prd/[id]
Then:
  - Status: 400 Bad Request
  - Response: { error: { code: "VALIDATION_ERROR", message: "올바르지 않은 문서 ID 형식입니다" } }
```

#### Scenario: Non-existent document
```
Given: [id] is valid UUID but no document exists
When: GET /api/prd/[id]
Then:
  - Status: 404 Not Found
  - Response: { error: { code: "NOT_FOUND", message: "문서를 찾을 수 없습니다" } }
```

### 2.3 RLS Policy Scenarios

#### Scenario: Get other user's document (RLS blocks)
```
Given: User is authenticated as user A
And: Document belongs to user B (user_id = B)
When: GET /api/prd/[id]
Then:
  - Status: 404 Not Found (RLS filters out the document)
  - Response: { error: { code: "NOT_FOUND", message: "문서를 찾을 수 없습니다" } }
```

---

## 3. GET /api/prd (List Documents)

### 3.1 Happy Path

#### Scenario: List with default pagination
```
Given: User is authenticated
And: User has 15 documents
When: GET /api/prd (no query params)
Then:
  - Status: 200 OK
  - Response: {
      data: PrdDocument[] (10 items),
      pagination: { page: 1, limit: 10, total: 15, totalPages: 2 }
    }
  - Documents ordered by created_at DESC
```

#### Scenario: List with custom pagination
```
Given: User is authenticated
And: User has 15 documents
When: GET /api/prd?page=2&limit=5
Then:
  - Status: 200 OK
  - Response: {
      data: PrdDocument[] (5 items, 6th-10th),
      pagination: { page: 2, limit: 5, total: 15, totalPages: 3 }
    }
```

#### Scenario: Empty result set
```
Given: User is authenticated
And: User has no documents
When: GET /api/prd
Then:
  - Status: 200 OK
  - Response: {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    }
```

### 3.2 Edge Cases

#### Scenario: Page beyond available data
```
Given: User has 5 documents
When: GET /api/prd?page=100
Then:
  - Status: 200 OK
  - Response: { data: [], pagination: { page: 100, limit: 10, total: 5, totalPages: 1 } }
```

#### Scenario: page=0 (invalid)
```
Given: Any authenticated user
When: GET /api/prd?page=0
Then:
  - Status: 400 Bad Request
  - Response: { error: { code: "VALIDATION_ERROR", message: "페이지는 1 이상이어야 합니다" } }
```

#### Scenario: limit=101 (exceeds max)
```
Given: Any authenticated user
When: GET /api/prd?limit=101
Then:
  - Status: 400 Bad Request
  - Response: { error: { code: "VALIDATION_ERROR", message: "페이지 크기는 최대 100입니다" } }
```

#### Scenario: limit=0 (invalid)
```
Given: Any authenticated user
When: GET /api/prd?limit=0
Then:
  - Status: 400 Bad Request
  - Response: { error: { code: "VALIDATION_ERROR", message: "페이지 크기는 1 이상이어야 합니다" } }
```

### 3.3 Error States

#### Scenario: Unauthenticated request
```
Given: User is not authenticated
When: GET /api/prd
Then:
  - Status: 401 Unauthorized
  - Response: { error: { code: "AUTHENTICATION_ERROR", message: "인증이 필요합니다" } }
```

---

## 4. PUT /api/prd/[id] (Update Document)

### 4.1 Happy Path

#### Scenario: Update generated_prd
```
Given: User is authenticated
And: Document belongs to current user
When: PUT /api/prd/[id] with { generated_prd: "# PRD Content..." }
Then:
  - Status: 200 OK
  - Response: { data: PrdDocument }
  - generated_prd field is updated
  - updated_at is refreshed
```

#### Scenario: Update questionnaire_data
```
Given: User is authenticated
And: Document belongs to current user
When: PUT /api/prd/[id] with { questionnaire_data: {...} }
Then:
  - Status: 200 OK
  - Response: { data: PrdDocument }
  - questionnaire_data is replaced
  - updated_at is refreshed
```

#### Scenario: Update both fields
```
Given: User is authenticated
And: Document belongs to current user
When: PUT /api/prd/[id] with { questionnaire_data: {...}, generated_prd: "..." }
Then:
  - Status: 200 OK
  - Both fields updated
```

### 4.2 Edge Cases

#### Scenario: Empty request body
```
Given: User is authenticated and owns the document
When: PUT /api/prd/[id] with {}
Then:
  - Status: 200 OK
  - No changes made
  - updated_at may or may not be refreshed (implementation choice)
```

#### Scenario: Set generated_prd to null
```
Given: Document has generated_prd = "some content"
When: PUT /api/prd/[id] with { generated_prd: null }
Then:
  - Status: 200 OK
  - generated_prd is cleared to null
```

#### Scenario: Invalid UUID format
```
Given: [id] is not a valid UUID
When: PUT /api/prd/[id]
Then:
  - Status: 400 Bad Request
  - Response: { error: { code: "VALIDATION_ERROR", message: "올바르지 않은 문서 ID 형식입니다" } }
```

### 4.3 Error States

#### Scenario: Unauthenticated request
```
Given: User is not authenticated
When: PUT /api/prd/[id]
Then:
  - Status: 401 Unauthorized
  - Response: { error: { code: "AUTHENTICATION_ERROR", message: "인증이 필요합니다" } }
```

#### Scenario: Update other user's document
```
Given: User is authenticated as user A
And: Document belongs to user B
When: PUT /api/prd/[id]
Then:
  - Status: 403 Forbidden
  - Response: { error: { code: "AUTHORIZATION_ERROR", message: "이 문서를 수정할 권한이 없습니다" } }
```

#### Scenario: Update anonymous document
```
Given: User is authenticated
And: Document has user_id = null (anonymous)
When: PUT /api/prd/[id]
Then:
  - Status: 403 Forbidden
  - Response: { error: { code: "AUTHORIZATION_ERROR", message: "익명 문서는 수정할 수 없습니다" } }
```

#### Scenario: Document not found
```
Given: [id] does not exist
When: PUT /api/prd/[id]
Then:
  - Status: 404 Not Found
  - Response: { error: { code: "NOT_FOUND", message: "문서를 찾을 수 없습니다" } }
```

---

## 5. DELETE /api/prd/[id] (Delete Document)

### 5.1 Happy Path

#### Scenario: Delete own document
```
Given: User is authenticated
And: Document belongs to current user
When: DELETE /api/prd/[id]
Then:
  - Status: 204 No Content
  - No response body
  - Document is removed from database
```

### 5.2 Edge Cases

#### Scenario: Delete non-existent document (idempotent)
```
Given: User is authenticated
And: [id] does not exist
When: DELETE /api/prd/[id]
Then:
  - Status: 204 No Content
  - Operation is idempotent
```

#### Scenario: Invalid UUID format
```
Given: [id] is not a valid UUID
When: DELETE /api/prd/[id]
Then:
  - Status: 400 Bad Request
  - Response: { error: { code: "VALIDATION_ERROR", message: "올바르지 않은 문서 ID 형식입니다" } }
```

### 5.3 Error States

#### Scenario: Unauthenticated request
```
Given: User is not authenticated
When: DELETE /api/prd/[id]
Then:
  - Status: 401 Unauthorized
  - Response: { error: { code: "AUTHENTICATION_ERROR", message: "인증이 필요합니다" } }
```

#### Scenario: Delete other user's document
```
Given: User is authenticated as user A
And: Document belongs to user B
When: DELETE /api/prd/[id]
Then:
  - Status: 403 Forbidden
  - Response: { error: { code: "AUTHORIZATION_ERROR", message: "이 문서를 삭제할 권한이 없습니다" } }
```

#### Scenario: Delete anonymous document
```
Given: User is authenticated
And: Document has user_id = null (anonymous)
When: DELETE /api/prd/[id]
Then:
  - Status: 403 Forbidden
  - Response: { error: { code: "AUTHORIZATION_ERROR", message: "익명 문서는 삭제할 수 없습니다" } }
```

---

## 6. Error Response Format

All error responses follow this structure:

```typescript
interface ErrorResponse {
  error: {
    code: string;      // Machine-readable error code
    message: string;   // Korean user-friendly message
    details?: {        // Optional additional info
      [key: string]: unknown;
    };
  };
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| AUTHENTICATION_ERROR | 401 | Not authenticated |
| AUTHORIZATION_ERROR | 403 | Not authorized |
| NOT_FOUND | 404 | Resource not found |
| DATABASE_ERROR | 500 | Database operation failed |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

---

## 7. Test Implementation Notes

### Mocking Strategy

```typescript
// Mock authenticated user
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      }),
    },
  })),
}));

// Mock database functions
vi.mock('@/lib/supabase/db', () => ({
  createPrdDocument: vi.fn(),
  getPrdDocumentById: vi.fn(),
  getUserPrdDocuments: vi.fn(),
  updatePrdDocument: vi.fn(),
  deletePrdDocument: vi.fn(),
}));
```

### Test File Structure

```
src/
├── lib/api/__tests__/
│   ├── errors.test.ts      # Error class tests
│   └── middleware.test.ts  # Middleware tests
└── app/api/prd/__tests__/
    ├── route.test.ts       # POST, GET list tests
    └── [id]/
        └── route.test.ts   # GET, PUT, DELETE tests
```

---

## 8. Performance Considerations

- All endpoints should respond within 200ms under normal load
- Pagination limits prevent large data transfers (max 100 items)
- RLS policies are enforced at database level for security
- JSONB validation happens in application layer

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-09 | Claude Code | Initial scenario document |
