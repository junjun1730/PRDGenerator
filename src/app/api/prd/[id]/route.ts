import { createServerClient } from '@/lib/supabase/server';
import {
  getPrdDocumentById,
  updatePrdDocument,
  deletePrdDocument,
} from '@/lib/supabase/db';
import {
  handleApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DbError,
} from '@/lib/api/errors';
import { successResponse, noContentResponse } from '@/lib/api/response';
import { uuidSchema, updatePrdSchema } from '@/lib/api/validation';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/prd/[id]
 * Get a single PRD document by ID
 */
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Validate UUID format
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      throw new ValidationError('올바르지 않은 문서 ID 형식입니다');
    }

    // Get document
    const { data, error } = await getPrdDocumentById(id);

    if (error) {
      throw new DbError('문서 조회에 실패했습니다');
    }

    if (!data) {
      throw new NotFoundError('문서를 찾을 수 없습니다');
    }

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/prd/[id]
 * Update a PRD document
 */
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidParsed = uuidSchema.safeParse(id);
    if (!uuidParsed.success) {
      throw new ValidationError('올바르지 않은 문서 ID 형식입니다');
    }

    // Require authentication
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AuthenticationError();
    }

    // Check document exists and ownership
    const { data: existingDoc, error: getError } = await getPrdDocumentById(id);

    if (getError) {
      throw new DbError('문서 조회에 실패했습니다');
    }

    if (!existingDoc) {
      throw new NotFoundError('문서를 찾을 수 없습니다');
    }

    // Check ownership (anonymous documents cannot be updated)
    if (existingDoc.user_id === null) {
      throw new AuthorizationError('익명 문서는 수정할 수 없습니다');
    }

    if (existingDoc.user_id !== user.id) {
      throw new AuthorizationError('이 문서를 수정할 권한이 없습니다');
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new SyntaxError('Unexpected token in JSON');
    }

    // Validate update data
    const parsed = updatePrdSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('입력 데이터가 유효하지 않습니다', {
        errors: parsed.error.issues,
      });
    }

    // Update document
    const { data, error } = await updatePrdDocument(id, parsed.data);

    if (error) {
      throw new DbError('문서 업데이트에 실패했습니다');
    }

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/prd/[id]
 * Delete a PRD document
 */
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Validate UUID format
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      throw new ValidationError('올바르지 않은 문서 ID 형식입니다');
    }

    // Require authentication
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AuthenticationError();
    }

    // Check document exists and ownership
    const { data: existingDoc, error: getError } = await getPrdDocumentById(id);

    if (getError) {
      throw new DbError('문서 조회에 실패했습니다');
    }

    // If document doesn't exist, return 204 (idempotent)
    if (!existingDoc) {
      return noContentResponse();
    }

    // Check ownership (anonymous documents cannot be deleted)
    if (existingDoc.user_id === null) {
      throw new AuthorizationError('익명 문서는 삭제할 수 없습니다');
    }

    if (existingDoc.user_id !== user.id) {
      throw new AuthorizationError('이 문서를 삭제할 권한이 없습니다');
    }

    // Delete document
    const { error } = await deletePrdDocument(id);

    if (error) {
      throw new DbError('문서 삭제에 실패했습니다');
    }

    return noContentResponse();
  } catch (error) {
    return handleApiError(error);
  }
}
