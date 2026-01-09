import { describe, it, expect, vi } from 'vitest';
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DbError,
  ServiceUnavailableError,
  handleApiError,
} from '../errors';

describe('API Error Classes', () => {
  describe('ApiError', () => {
    it('should create error with correct properties', () => {
      const error = new ApiError(400, 'TEST_ERROR', 'Test message', {
        field: 'value',
      });

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual({ field: 'value' });
      expect(error.name).toBe('ApiError');
    });

    it('should work without details', () => {
      const error = new ApiError(500, 'ERROR', 'Message');

      expect(error.details).toBeUndefined();
    });
  });

  describe('ValidationError', () => {
    it('should create 400 error with VALIDATION_ERROR code', () => {
      const error = new ValidationError('Invalid input');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
    });

    it('should include details when provided', () => {
      const error = new ValidationError('Invalid input', {
        errors: [{ field: 'name', message: 'Required' }],
      });

      expect(error.details).toEqual({
        errors: [{ field: 'name', message: 'Required' }],
      });
    });
  });

  describe('AuthenticationError', () => {
    it('should create 401 error with default message', () => {
      const error = new AuthenticationError();

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('인증이 필요합니다');
      expect(error.name).toBe('AuthenticationError');
    });

    it('should use custom message when provided', () => {
      const error = new AuthenticationError('세션이 만료되었습니다');

      expect(error.message).toBe('세션이 만료되었습니다');
    });
  });

  describe('AuthorizationError', () => {
    it('should create 403 error with default message', () => {
      const error = new AuthorizationError();

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.message).toBe('접근 권한이 없습니다');
      expect(error.name).toBe('AuthorizationError');
    });

    it('should use custom message when provided', () => {
      const error = new AuthorizationError('이 문서를 수정할 권한이 없습니다');

      expect(error.message).toBe('이 문서를 수정할 권한이 없습니다');
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 error with default message', () => {
      const error = new NotFoundError();

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('요청한 리소스를 찾을 수 없습니다');
      expect(error.name).toBe('NotFoundError');
    });

    it('should use custom message when provided', () => {
      const error = new NotFoundError('문서를 찾을 수 없습니다');

      expect(error.message).toBe('문서를 찾을 수 없습니다');
    });
  });

  describe('DbError', () => {
    it('should create 500 error with default message', () => {
      const error = new DbError();

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.message).toBe('데이터베이스 오류가 발생했습니다');
      expect(error.name).toBe('DbError');
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create 503 error with default message', () => {
      const error = new ServiceUnavailableError();

      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
      expect(error.message).toBe('서비스를 일시적으로 사용할 수 없습니다');
      expect(error.name).toBe('ServiceUnavailableError');
    });
  });
});

describe('handleApiError', () => {
  it('should handle ApiError and return correct response', async () => {
    const error = new ValidationError('Invalid input', { field: 'name' });
    const response = handleApiError(error);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: { field: 'name' },
      },
    });
  });

  it('should not include details if undefined', async () => {
    const error = new AuthenticationError();
    const response = handleApiError(error);
    const body = await response.json();

    expect(body.error.details).toBeUndefined();
  });

  it('should handle JSON SyntaxError', async () => {
    const error = new SyntaxError('Unexpected token in JSON');
    const response = handleApiError(error);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: '잘못된 JSON 형식입니다',
      },
    });
  });

  it('should handle unknown errors with 500', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Unknown error');
    const response = handleApiError(error);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다',
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith('Unexpected API error:', error);

    consoleSpy.mockRestore();
  });

  it('should handle null/undefined errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response1 = handleApiError(null);
    const response2 = handleApiError(undefined);

    expect(response1.status).toBe(500);
    expect(response2.status).toBe(500);

    consoleSpy.mockRestore();
  });
});
