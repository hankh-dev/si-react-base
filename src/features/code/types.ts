/** 공통코드 한 건. 예: USER_STATUS 그룹의 { code: 'ACTIVE', name: '정상' } */
export interface CodeItem {
  code: string;
  name: string;
  sortOrder: number;
  useYn: 'Y' | 'N';
}

/** 공통코드 그룹. 예: USER_STATUS(사용자 상태) */
export interface CodeGroup {
  groupCode: string;
  groupName: string;
  description: string;
  codeCount: number;
}
