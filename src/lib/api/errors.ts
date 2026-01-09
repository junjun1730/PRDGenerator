import { NextResponse } from 'next/server';

/**
 * Base API Error class
 * All API errors should extend this class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 400 Bad Request - Validation Error
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

/**
 * 401 Unauthorized - Authentication Required
 */
export class AuthenticationError extends ApiError {
  constructor(message = '인증이 필요합니다') {
    super(401, 'AUTHENTICATION_ERROR', message);
    this.name = 'AuthenticationError';
  }
}

/**
 * 403 Forbidden - Authorization Error
 */
export class AuthorizationError extends ApiError {
  constructor(message = '접근 권한이 없습니다') {
    super(403, 'AUTHORIZATION_ERROR', message);
    this.name = 'AuthorizationError';
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
  constructor(message = '요청한 리소스를 찾을 수 없습니다') {
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

/**
 * 500 Internal Server Error - Database Error
 */
export class DbError extends ApiError {
  constructor(message = '데이터베이스 오류가 발생했습니다') {
    super(500, 'DATABASE_ERROR', message);
    this.name = 'DbError';
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = '서비스를 일시적으로 사용할 수 없습니다') {
    super(503, 'SERVICE_UNAVAILABLE', message);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Handle API errors and return appropriate NextResponse
 */
export function handleApiError(error: unknown): NextResponse {
  // Handle known API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle JSON parse errors
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: '잘못된 JSON 형식입니다',
        },
      },
      { status: 400 }
    );
  }

  // Log unexpected errors
  console.error('Unexpected API error:', error);

  // Return generic error for unknown errors
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다',
      },
    },
    { status: 500 }
  );
}
