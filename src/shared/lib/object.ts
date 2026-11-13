function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * 값이 빈 문자열·null·undefined 인 속성을 뺀 새 객체를 돌려줍니다.
 * 일반 객체가 아니면(배열, URLSearchParams 등) 그대로 돌려줍니다.
 *
 * 조회조건의 "전체"(빈 값)를 서버에 `status=` 처럼 보내지 않기 위해 사용합니다.
 */
export function omitEmpty<T>(value: T): T {
  if (!isPlainObject(value)) return value;
  const entries = Object.entries(value).filter(
    ([, item]) => item !== '' && item !== null && item !== undefined,
  );
  return Object.fromEntries(entries) as T;
}
