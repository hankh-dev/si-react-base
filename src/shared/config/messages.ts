/*
 * 화면에 표시하는 공통 문구
 *
 * 문구를 화면마다 직접 쓰지 않고 여기서 가져다 씁니다. 표현을 바꿀 때 이 파일만 고치면 됩니다.
 * 다국어가 필요해지면 이 객체를 언어별로 나누는 것부터 시작합니다.
 */
export const messages = {
  saved: '저장되었습니다.',
  deleted: (count: number) => `${count}건을 삭제했습니다.`,
  confirmDelete: (count: number) => `선택한 ${count}건을 삭제하시겠습니까?`,
  selectRows: '대상을 먼저 선택해 주세요.',
  noData: '조회된 데이터가 없습니다.',

  sessionExpired: '세션이 만료되었습니다. 다시 로그인해 주세요.',
  maxTabs: (max: number) =>
    `탭은 최대 ${max}개까지 열 수 있습니다. 사용하지 않는 탭을 닫아 주세요.`,

  error: {
    network: '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.',
    timeout: '응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
    canceled: '요청이 취소되었습니다.',
    badRequest: '요청 내용을 확인해 주세요.',
    unauthorized: '로그인이 필요합니다.',
    forbidden: '이 작업을 수행할 권한이 없습니다.',
    notFound: '요청한 대상을 찾을 수 없습니다.',
    conflict: '다른 사용자가 먼저 변경했습니다. 다시 조회한 뒤 시도해 주세요.',
    server: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    unknown: '알 수 없는 오류가 발생했습니다.',
  },
} as const;
