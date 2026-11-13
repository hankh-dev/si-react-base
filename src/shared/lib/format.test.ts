import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, formatNumber, formatPhone } from './format';

describe('formatDate / formatDateTime', () => {
  it('날짜·시간 문자열을 화면 표시 형식으로 바꾼다', () => {
    expect(formatDate('2026-11-12T09:30:00')).toBe('2026-11-12');
    expect(formatDateTime('2026-11-12T09:30:00')).toBe('2026-11-12 09:30');
  });

  it('값이 없거나 날짜가 아니면 빈 문자열을 돌려준다', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
    expect(formatDateTime('날짜 아님')).toBe('');
  });
});

describe('formatNumber', () => {
  it('세 자리마다 쉼표를 넣는다', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(0)).toBe('0');
  });

  it('값이 없으면 빈 문자열을 돌려준다', () => {
    expect(formatNumber(null)).toBe('');
    expect(formatNumber(undefined)).toBe('');
    expect(formatNumber(Number.NaN)).toBe('');
  });
});

describe('formatPhone', () => {
  it.each([
    ['01012345678', '010-1234-5678'],
    ['0111234567', '011-123-4567'],
    ['0212345678', '02-1234-5678'],
    ['021234567', '02-123-4567'],
    ['0311234567', '031-123-4567'],
    ['15881234', '1588-1234'],
    ['010-1234-5678', '010-1234-5678'],
  ])('%s → %s', (input, expected) => {
    expect(formatPhone(input)).toBe(expected);
  });

  it('형식을 알 수 없으면 입력값을 그대로 돌려준다', () => {
    expect(formatPhone('12345')).toBe('12345');
    expect(formatPhone(null)).toBe('');
  });
});
