import { describe, expect, it } from 'vitest';
import { parseFilename } from './download';

describe('parseFilename', () => {
  it('한글 파일명(filename*)을 우선해서 읽는다', () => {
    const header = `attachment; filename="users.xlsx"; filename*=UTF-8''${encodeURIComponent('사용자목록_20261112.xlsx')}`;
    expect(parseFilename(header)).toBe('사용자목록_20261112.xlsx');
  });

  it('filename* 이 없으면 일반 filename 을 읽는다', () => {
    expect(parseFilename('attachment; filename="report 2026.xlsx"')).toBe('report 2026.xlsx');
    expect(parseFilename('attachment; filename=report.csv')).toBe('report.csv');
  });

  it('filename* 의 인코딩이 잘못됐으면 일반 filename 으로 대신한다', () => {
    expect(parseFilename(`attachment; filename="fallback.xlsx"; filename*=UTF-8''%E0%A4%A`)).toBe(
      'fallback.xlsx',
    );
  });

  it('파일명이 없으면 null 을 돌려준다', () => {
    expect(parseFilename('attachment')).toBeNull();
    expect(parseFilename(null)).toBeNull();
    expect(parseFilename(undefined)).toBeNull();
  });
});
