import { delay, HttpResponse } from 'msw';
import type { User } from '@/features/user/types';
import type { FieldError } from '@/shared/api/ApiError';
import { runtimeConfig } from '@/shared/config/runtimeConfig';
import { verifyAccessToken } from '../db/session';
import { userDb } from '../db/users';

/** API 경로를 만듭니다. 예: api('/users') → '/api/users' */
export const api = (path: string): string => `${runtimeConfig.apiBaseUrl}${path}`;

/** 실제 서버처럼 응답에 약간의 지연을 둡니다. 로딩 표시를 눈으로 확인할 수 있습니다. */
export async function networkDelay(): Promise<void> {
  await delay(import.meta.env.MODE === 'test' ? 0 : 250);
}

/** 공통 오류 응답 (docs/03-api-contract.md 의 오류 규격) */
export function errorResponse(
  status: number,
  code: string,
  message: string,
  fieldErrors?: FieldError[],
) {
  const traceId = `mock-${Date.now().toString(36)}`;
  return HttpResponse.json({ code, message, fieldErrors, traceId }, { status });
}

export const unauthorized = () =>
  errorResponse(401, 'AUTH_TOKEN_EXPIRED', '인증이 만료되었습니다.');

export const forbidden = () => errorResponse(403, 'FORBIDDEN', '이 작업을 수행할 권한이 없습니다.');

export const notFound = () => errorResponse(404, 'NOT_FOUND', '요청한 대상을 찾을 수 없습니다.');

/** 액세스 토큰으로 요청한 사용자를 찾습니다. 토큰이 없거나 만료됐으면 null */
export function authenticate(request: Request): User | null {
  const userId = verifyAccessToken(request.headers.get('Authorization'));
  return userId === null ? null : (userDb.find(userId) ?? null);
}
