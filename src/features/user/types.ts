import type { DateRange } from '@/shared/lib/dateRange';

/** 사용자. 코드 필드(deptCode, roleCode, status)는 공통코드의 code 값입니다. */
export interface User {
  id: number;
  loginId: string;
  userName: string;
  email: string;
  /** 숫자만 저장합니다. 화면에 보일 때 formatPhone 으로 서식을 입힙니다. */
  phone: string;
  /** 공통코드 DEPT */
  deptCode: string;
  /** 공통코드 ROLE */
  roleCode: string;
  /** 공통코드 USER_STATUS */
  status: string;
  /** YYYY-MM-DD */
  joinedDate: string;
  /** YYYY-MM-DDTHH:mm:ss. 로그인한 적이 없으면 null */
  lastLoginAt: string | null;
  remark: string;
}

/** 등록·수정 요청 본문 */
export type UserSaveRequest = Omit<User, 'id' | 'lastLoginAt'>;

/** 목록 화면의 조회조건 (폼 값). 선택하지 않은 항목은 '' 입니다. */
export interface UserSearchCondition {
  /** 이름 또는 아이디 */
  keyword: string;
  deptCode: string;
  status: string;
  /** 입사일 기간 */
  joinedRange: DateRange;
}
