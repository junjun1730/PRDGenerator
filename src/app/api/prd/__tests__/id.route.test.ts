import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from '../[id]/route';

// Mock data
const validQuestionnaireData = {
  stage1: {
    serviceName: 'Test Service',
    coreFeatures: ['Feature 1', 'Feature 2'],
    mainScreens: 'Home, Profile',
    userJourney: 'User journey description',
    serviceMood: 'Professional',
  },
  stage2: {
    themes: ['minimal'],
    brandKeywords: ['modern', 'clean', 'simple'],
    colorSystem: { primary: '#000000', background: '#FFFFFF' },
    typography: 'gothic' as const,
    uiDetails: {
      buttonRadius: 'md' as const,
      iconWeight: 'regular' as const,
      shadowIntensity: 'sm' as const,
    },
    references: '',
  },
  stage3: {
    techStack: {
      frontend: ['React'],
      database: ['PostgreSQL'],
      backend: ['Node.js'],
      other: [],
    },
    dataManagement: {
      realtimeRequired: false,
      largeMediaHandling: false,
    },
    externalAPIs: [],
    exceptionHandling: 'Standard error handling',
  },
  currentStage: 1 as const,
  completedStages: [1],
};

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockPrdDocument = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: 'user-123',
  questionnaire_data: validQuestionnaireData,
  generated_prd: null,
  created_at: '2026-01-09T00:00:00Z',
  updated_at: '2026-01-09T00:00:00Z',
};

const mockAnonymousDocument = {
  ...mockPrdDocument,
  id: '550e8400-e29b-41d4-a716-446655440001',
  user_id: null,
};

// Mock Supabase
const mockGetUser = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// Mock DB functions
const mockGetPrdDocumentById = vi.fn();
const mockUpdatePrdDocument = vi.fn();
const mockDeletePrdDocument = vi.fn();

vi.mock('@/lib/supabase/db', () => ({
  getPrdDocumentById: (...args: unknown[]) => mockGetPrdDocumentById(...args),
  updatePrdDocument: (...args: unknown[]) => mockUpdatePrdDocument(...args),
  deletePrdDocument: (...args: unknown[]) => mockDeletePrdDocument(...args),
}));

// Helper to create params
function createParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

// Helper to create NextRequest with body
function createRequest(
  method: string,
  body?: unknown
): Request {
  const url = 'http://localhost:3000/api/prd/123';
  if (body) {
    return new Request(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  return new Request(url, { method });
}

describe('GET /api/prd/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should return own document (200)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: mockPrdDocument,
        error: null,
      });

      const request = createRequest('GET');
      const params = createParams(mockPrdDocument.id);
      const response = await GET(request, params);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual(mockPrdDocument);
    });

    it('should return anonymous document (200)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: mockAnonymousDocument,
        error: null,
      });

      const request = createRequest('GET');
      const params = createParams(mockAnonymousDocument.id);
      const response = await GET(request, params);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.user_id).toBeNull();
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid UUID', async () => {
      const request = createRequest('GET');
      const params = createParams('invalid-uuid');
      const response = await GET(request, params);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent document', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = createRequest('GET');
      const params = createParams('550e8400-e29b-41d4-a716-446655440999');
      const response = await GET(request, params);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });
});

describe('PUT /api/prd/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should update generated_prd (200)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: mockPrdDocument,
        error: null,
      });
      mockUpdatePrdDocument.mockResolvedValue({
        data: { ...mockPrdDocument, generated_prd: '# New PRD Content' },
        error: null,
      });

      const request = createRequest('PUT', { generated_prd: '# New PRD Content' });
      const params = createParams(mockPrdDocument.id);
      const response = await PUT(request, params);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.generated_prd).toBe('# New PRD Content');
    });

    it('should update questionnaire_data (200)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: mockPrdDocument,
        error: null,
      });
      const updatedData = {
        ...validQuestionnaireData,
        stage1: { ...validQuestionnaireData.stage1, serviceName: 'Updated Name' },
      };
      mockUpdatePrdDocument.mockResolvedValue({
        data: { ...mockPrdDocument, questionnaire_data: updatedData },
        error: null,
      });

      const request = createRequest('PUT', { questionnaire_data: updatedData });
      const params = createParams(mockPrdDocument.id);
      const response = await PUT(request, params);
      const body = await response.json();

      expect(response.status).toBe(200);
    });
  });

  describe('Authentication Errors', () => {
    it('should return 401 for unauthenticated request', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = createRequest('PUT', { generated_prd: 'test' });
      const params = createParams(mockPrdDocument.id);
      const response = await PUT(request, params);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('Authorization Errors', () => {
    it('should return 403 for other user document', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { ...mockUser, id: 'other-user' } },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: mockPrdDocument,
        error: null,
      });

      const request = createRequest('PUT', { generated_prd: 'test' });
      const params = createParams(mockPrdDocument.id);
      const response = await PUT(request, params);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should return 403 for anonymous document', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: mockAnonymousDocument,
        error: null,
      });

      const request = createRequest('PUT', { generated_prd: 'test' });
      const params = createParams(mockAnonymousDocument.id);
      const response = await PUT(request, params);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error.code).toBe('AUTHORIZATION_ERROR');
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent document', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = createRequest('PUT', { generated_prd: 'test' });
      const params = createParams('550e8400-e29b-41d4-a716-446655440999');
      const response = await PUT(request, params);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });
});

describe('DELETE /api/prd/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should delete own document (204)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: mockPrdDocument,
        error: null,
      });
      mockDeletePrdDocument.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = createRequest('DELETE');
      const params = createParams(mockPrdDocument.id);
      const response = await DELETE(request, params);

      expect(response.status).toBe(204);
    });

    it('should return 204 for non-existent document (idempotent)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = createRequest('DELETE');
      const params = createParams('550e8400-e29b-41d4-a716-446655440999');
      const response = await DELETE(request, params);

      expect(response.status).toBe(204);
    });
  });

  describe('Authentication Errors', () => {
    it('should return 401 for unauthenticated request', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = createRequest('DELETE');
      const params = createParams(mockPrdDocument.id);
      const response = await DELETE(request, params);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('Authorization Errors', () => {
    it('should return 403 for other user document', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { ...mockUser, id: 'other-user' } },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: mockPrdDocument,
        error: null,
      });

      const request = createRequest('DELETE');
      const params = createParams(mockPrdDocument.id);
      const response = await DELETE(request, params);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should return 403 for anonymous document', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetPrdDocumentById.mockResolvedValue({
        data: mockAnonymousDocument,
        error: null,
      });

      const request = createRequest('DELETE');
      const params = createParams(mockAnonymousDocument.id);
      const response = await DELETE(request, params);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error.code).toBe('AUTHORIZATION_ERROR');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid UUID', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = createRequest('DELETE');
      const params = createParams('invalid-uuid');
      const response = await DELETE(request, params);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
