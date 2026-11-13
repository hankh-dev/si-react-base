import { authHandlers } from './auth';
import { codeHandlers } from './code';
import { dashboardHandlers } from './dashboard';
import { menuHandlers } from './menu';
import { userHandlers } from './user';

/** 목 API 전체. 브라우저(개발·시연)와 테스트가 같은 핸들러를 씁니다. */
export const handlers = [
  ...authHandlers,
  ...menuHandlers,
  ...codeHandlers,
  ...userHandlers,
  ...dashboardHandlers,
];
