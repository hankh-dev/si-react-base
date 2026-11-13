import { describe, expect, it } from 'vitest';
import { toUserSaveRequest, userFormSchema, type UserFormValues } from './schema';

const valid: UserFormValues = {
  loginId: 'hong01',
  userName: '홍길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  deptCode: 'D001',
  roleCode: 'USER',
  status: 'ACTIVE',
  joinedDate: '2026-11-02',
  remark: '',
};

/** 검증에 실패한 필드와 문구를 { 필드: 문구 } 로 모읍니다. */
function errorsOf(values: UserFormValues): Record<string, string> {
  const result = userFormSchema.safeParse(values);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
  );
}

describe('userFormSchema', () => {
  it('올바른 값은 통과한다', () => {
    expect(errorsOf(valid)).toEqual({});
  });

  it('휴대전화는 비워 둘 수 있다', () => {
    expect(errorsOf({ ...valid, phone: '' })).toEqual({});
  });

  it('필수 항목이 비어 있으면 항목별 안내 문구를 돌려준다', () => {
    expect(errorsOf({ ...valid, userName: '  ', deptCode: '', joinedDate: '' })).toEqual({
      userName: '이름을 입력해 주세요.',
      deptCode: '부서를 선택해 주세요.',
      joinedDate: '입사일을 선택해 주세요.',
    });
  });

  it.each([
    ['abc', '아이디는 4자 이상 입력해 주세요.'],
    ['Hong01', '영문 소문자로 시작하고 영문 소문자·숫자·밑줄(_)만 쓸 수 있습니다.'],
    ['1hong', '영문 소문자로 시작하고 영문 소문자·숫자·밑줄(_)만 쓸 수 있습니다.'],
  ])('아이디 %s 는 거부한다', (loginId, message) => {
    expect(errorsOf({ ...valid, loginId })).toEqual({ loginId: message });
  });

  it('이메일·휴대전화 형식을 검사한다', () => {
    expect(errorsOf({ ...valid, email: 'hong@', phone: '02-123-4567' })).toEqual({
      email: '이메일 형식이 올바르지 않습니다.',
      phone: '휴대전화 번호 형식이 올바르지 않습니다.',
    });
  });
});

describe('toUserSaveRequest', () => {
  it('휴대전화는 숫자만 남겨서 보낸다', () => {
    expect(toUserSaveRequest(valid).phone).toBe('01012345678');
  });
});
