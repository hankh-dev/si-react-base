/*
 * 런타임 환경설정
 *
 * 이 파일은 번들되지 않고 그대로 배포됩니다.
 * 같은 빌드 산출물을 개발·검증·운영 서버에 올릴 때, 서버마다 이 파일만 바꿔서 사용합니다.
 * 환경별 예시는 deploy/ 폴더를 참고하세요.
 */
window.__APP_CONFIG__ = {
  // 화면 상단에 표시되는 환경 구분: local | dev | stg | prod
  envName: 'local',
  // 시스템 이름 (브라우저 탭 제목, 상단 로고 옆)
  appTitle: '업무 시스템',
  // API 기본 경로. 같은 도메인의 리버스 프록시를 쓰면 '/api', 아니면 전체 주소.
  apiBaseUrl: '/api',
  // API 요청 제한 시간(ms)
  requestTimeoutMs: 30000,
};
