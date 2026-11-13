import { z } from 'zod';
import { EMPTY_DATE_RANGE } from '@/shared/lib/dateRange';
import type { User, UserSaveRequest, UserSearchCondition } from './types';

/** 목록 화면 조회조건의 처음 값 */
export const DEFAULT_USER_SEARCH: UserSearchCondition = {
  keyword: '',
  deptCode: '',
  status: '',
  joinedRange: EMPTY_DATE_RANGE,
};

/*
 * 사용자 등록·수정 폼의 검증 규칙
 *
 * 화면에서 바로 판단할 수 있는 규칙(필수, 길이, 형식)만 여기에 둡니다.
 * 아이디 중복처럼 서버만 알 수 있는 규칙은 서버가 fieldErrors 로 돌려주고,
 * 화면은 applyFieldErrors 로 같은 입력란에 표시합니다.
 */
export const userFormSchema = z.object({
  loginId: z
    .string()
    .min(4, '아이디는 4자 이상 입력해 주세요.')
    .max(20, '아이디는 20자까지 입력할 수 있습니다.')
    .regex(
      /^[a-z][a-z0-9_]*$/,
      '영문 소문자로 시작하고 영문 소문자·숫자·밑줄(_)만 쓸 수 있습니다.',
    ),
  userName: z
    .string()
    .trim()
    .min(1, '이름을 입력해 주세요.')
    .max(20, '이름은 20자까지 입력할 수 있습니다.'),
  email: z.email('이메일 형식이 올바르지 않습니다.'),
  phone: z
    .string()
    .regex(/^(01[016789]-?\d{3,4}-?\d{4})?$/, '휴대전화 번호 형식이 올바르지 않습니다.'),
  deptCode: z.string().min(1, '부서를 선택해 주세요.'),
  roleCode: z.string().min(1, '권한을 선택해 주세요.'),
  status: z.string().min(1, '상태를 선택해 주세요.'),
  joinedDate: z.string().min(1, '입사일을 선택해 주세요.'),
  remark: z.string().max(200, '비고는 200자까지 입력할 수 있습니다.'),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

/** 폼 값 → 저장 요청 본문. 휴대전화는 숫자만 남깁니다. */
export function toUserSaveRequest(values: UserFormValues): UserSaveRequest {
  return { ...values, phone: values.phone.replace(/\D/g, '') };
}

/** 조회한 사용자 → 수정 폼의 처음 값 */
export function toUserFormValues(user: User): UserFormValues {
  return {
    loginId: user.loginId,
    userName: user.userName,
    email: user.email,
    phone: user.phone,
    deptCode: user.deptCode,
    roleCode: user.roleCode,
    status: user.status,
    joinedDate: user.joinedDate,
    remark: user.remark,
  };
}

/** 등록 폼의 처음 값 */
export const EMPTY_USER_FORM: UserFormValues = {
  loginId: '',
  userName: '',
  email: '',
  phone: '',
  deptCode: '',
  roleCode: 'USER',
  status: 'ACTIVE',
  joinedDate: '',
  remark: '',
};
