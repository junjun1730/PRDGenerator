import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

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
  id: 'doc-123',
  user_id: 'user-123',
  questionnaire_data: validQuestionnaireData,
  generated_prd: null,
  created_at: '2026-01-09T00:00:00Z',
  updated_at: '2026-01-09T00:00:00Z',
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
const mockCreatePrdDocument = vi.fn();
const mockGetUserPrdDocuments = vi.fn();
vi.mock('@/lib/supabase/db', () => ({
  createPrdDocument: (...args: unknown[]) => mockCreatePrdDocument(...args),
  getUserPrdDocuments: (...args: unknown[]) => mockGetUserPrdDocuments(...args),
}));

// Helper to create NextRequest
function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/prd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/prd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should create document for authenticated user (201)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockCreatePrdDocument.mockResolvedValue({
        data: mockPrdDocument,
        error: null,
      });

      const request = createRequest({
        questionnaire_data: validQuestionnaireData,
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.data).toEqual(mockPrdDocument);
      expect(mockCreatePrdDocument).toHaveBeenCalledWith(
        validQuestionnaireData,
        'user-123'
      );
    });

    it('should create document for anonymous user (201)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      mockCreatePrdDocument.mockResolvedValue({
        data: { ...mockPrdDocument, user_id: null },
        error: null,
      });

      const request = createRequest({
        questionnaire_data: validQuestionnaireData,
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.data.user_id).toBeNull();
      expect(mockCreatePrdDocument).toHaveBeenCalledWith(
        validQuestionnaireData,
        null
      );
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for empty serviceName', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const invalidData = {
        ...validQuestionnaireData,
        stage1: { ...validQuestionnaireData.stage1, serviceName: '' },
      };
      const request = createRequest({ questionnaire_data: invalidData });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty coreFeatures', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const invalidData = {
        ...validQuestionnaireData,
        stage1: { ...validQuestionnaireData.stage1, coreFeatures: [] },
      };
      const request = createRequest({ questionnaire_data: invalidData });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing questionnaire_data', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = createRequest({});
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/prd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'not valid json',
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('잘못된 JSON 형식입니다');
    });
  });

  describe('Database Errors', () => {
    it('should return 500 for database error', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockCreatePrdDocument.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      const request = createRequest({
        questionnaire_data: validQuestionnaireData,
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error.code).toBe('DATABASE_ERROR');
    });
  });
});

describe('GET /api/prd (List)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should list documents with default pagination (200)', async () => {
      const mockDocuments = [mockPrdDocument];
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserPrdDocuments.mockResolvedValue({
        data: mockDocuments,
        count: 1,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/prd');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual(mockDocuments);
      expect(body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should list documents with custom pagination (200)', async () => {
      const mockDocuments = Array(5).fill(mockPrdDocument);
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserPrdDocuments.mockResolvedValue({
        data: mockDocuments,
        count: 15,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/prd?page=2&limit=5');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
    });

    it('should return empty array for user with no documents (200)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserPrdDocuments.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/prd');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual([]);
      expect(body.pagination.total).toBe(0);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for page=0', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/prd?page=0');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for limit=101', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/prd?limit=101');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Authentication Errors', () => {
    it('should return 401 for unauthenticated request', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/prd');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });
});
