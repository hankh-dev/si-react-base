import type { CodeGroup, CodeItem } from '@/features/code/types';

interface CodeGroupRecord {
  groupCode: string;
  groupName: string;
  description: string;
  codes: CodeItem[];
}

/** [코드, 코드명] 목록을 순서대로 CodeItem 으로 만듭니다. 세 번째 값이 'N' 이면 사용 안 함. */
function items(...rows: [code: string, name: string, useYn?: 'Y' | 'N'][]): CodeItem[] {
  return rows.map(([code, name, useYn = 'Y'], index) => ({
    code,
    name,
    sortOrder: index + 1,
    useYn,
  }));
}

const groups: CodeGroupRecord[] = [
  {
    groupCode: 'USER_STATUS',
    groupName: '사용자 상태',
    description: '사용자 계정의 상태',
    codes: items(['ACTIVE', '정상'], ['LOCKED', '잠김'], ['INACTIVE', '사용중지']),
  },
  {
    groupCode: 'DEPT',
    groupName: '부서',
    description: '사용자가 속한 부서',
    codes: items(
      ['D001', '경영지원팀'],
      ['D002', '인사팀'],
      ['D003', '재무팀'],
      ['D004', '영업1팀'],
      ['D005', '영업2팀'],
      ['D006', '개발팀'],
      ['D007', '운영팀'],
      ['D008', '품질관리팀'],
      ['D009', '고객지원팀', 'N'],
    ),
  },
  {
    groupCode: 'ROLE',
    groupName: '권한',
    description: '사용자의 시스템 권한',
    codes: items(['ADMIN', '시스템관리자'], ['MANAGER', '부서관리자'], ['USER', '일반사용자']),
  },
  {
    groupCode: 'NOTICE_TYPE',
    groupName: '공지 유형',
    description: '공지사항 분류',
    codes: items(['GENERAL', '일반'], ['SYSTEM', '시스템'], ['URGENT', '긴급']),
  },
  {
    groupCode: 'APPROVAL_STATUS',
    groupName: '결재 상태',
    description: '결재 문서의 진행 상태',
    codes: items(
      ['DRAFT', '임시저장'],
      ['REQUESTED', '결재요청'],
      ['APPROVED', '승인'],
      ['REJECTED', '반려'],
      ['CANCELED', '회수'],
    ),
  },
  {
    groupCode: 'USE_YN',
    groupName: '사용 여부',
    description: '공통 사용 여부',
    codes: items(['Y', '사용'], ['N', '미사용']),
  },
];

export const codeDb = {
  groups(keyword: string): CodeGroup[] {
    const term = keyword.trim().toLowerCase();
    return groups
      .filter(
        (group) =>
          !term ||
          group.groupCode.toLowerCase().includes(term) ||
          group.groupName.toLowerCase().includes(term),
      )
      .map(({ codes, ...group }) => ({ ...group, codeCount: codes.length }));
  },

  /** 그룹이 없으면 null */
  items(groupCode: string): CodeItem[] | null {
    return groups.find((group) => group.groupCode === groupCode)?.codes ?? null;
  },

  name(groupCode: string, code: string): string {
    return this.items(groupCode)?.find((item) => item.code === code)?.name ?? code;
  },
};
