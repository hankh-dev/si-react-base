/* 개발 서버용 런타임 환경설정. 배포할 때 이 파일을 config.js 라는 이름으로 덮어씁니다. */
window.__APP_CONFIG__ = {
  envName: 'dev',
  appTitle: '업무 시스템',
  apiBaseUrl: '/api',
  requestTimeoutMs: 30000,
};
