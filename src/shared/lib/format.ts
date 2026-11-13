import dayjs from 'dayjs';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@/shared/config/constants';

/*
 * 화면 표시용 서식 함수
 *
 * 값이 없거나 형식이 잘못된 경우 빈 문자열을 돌려주므로 그리드·상세 화면에서 그대로 쓸 수 있습니다.
 */

type Nullable<T> = T | null | undefined;

function formatWith(value: Nullable<string>, template: string): string {
  if (!value) return '';
  const date = dayjs(value);
  return date.isValid() ? date.format(template) : '';
}

/** 2026-11-12T09:30:00 → 2026-11-12 */
export function formatDate(value: Nullable<string>): string {
  return formatWith(value, DATE_FORMAT);
}

/** 2026-11-12T09:30:00 → 2026-11-12 09:30 */
export function formatDateTime(value: Nullable<string>): string {
  return formatWith(value, DATE_TIME_FORMAT);
}

/** 1234567 → 1,234,567 */
export function formatNumber(value: Nullable<number>): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return value.toLocaleString('ko-KR');
}

/** 01012345678 → 010-1234-5678, 0212345678 → 02-1234-5678. 형식을 알 수 없으면 입력값 그대로. */
export function formatPhone(value: Nullable<string>): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('02')) {
    if (digits.length === 9) return digits.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
  } else {
    if (digits.length === 10) return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    if (digits.length === 11) return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  if (digits.length === 8) return digits.replace(/(\d{4})(\d{4})/, '$1-$2');

  return value;
}
