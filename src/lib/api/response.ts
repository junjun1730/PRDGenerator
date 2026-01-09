import { NextResponse } from 'next/server';

/**
 * Return success response (200 OK)
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

/**
 * Return created response (201 Created)
 */
export function createdResponse<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 });
}

/**
 * Return no content response (204 No Content)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Return paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): NextResponse {
  return NextResponse.json({
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
}
