import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/shared/api/ApiError';

/**
 * 서버가 돌려준 입력값 검증 오류(fieldErrors)를 폼의 해당 입력란 아래에 표시합니다.
 * 예: 아이디 중복처럼 서버만 판단할 수 있는 검증.
 *
 * @returns 입력란에 표시한 오류가 있으면 true
 */
export function applyFieldErrors<TValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TValues>,
): boolean {
  if (!(error instanceof ApiError) || error.fieldErrors.length === 0) return false;

  error.fieldErrors.forEach(({ field, message }, index) => {
    setError(
      field as FieldPath<TValues>,
      { type: 'server', message },
      { shouldFocus: index === 0 },
    );
  });
  return true;
}
