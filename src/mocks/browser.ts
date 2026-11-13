import { setupWorker } from 'msw/browser';
import { runtimeConfig } from '@/shared/config/runtimeConfig';
import { mockControls } from './db/session';
import { handlers } from './handlers';

declare global {
  interface Window {
    /** 목 전용 도구. 콘솔에서 __mock.expireAccessToken() / __mock.expireSession() 으로 만료 상황을 재현합니다. */
    __mock?: typeof mockControls;
  }
}

/**
 * 브라우저에서 목 API 를 켭니다. (npm run dev, npm run build:mock)
 * 서비스 워커가 API 요청을 가로채 src/mocks/handlers 의 응답을 돌려줍니다.
 */
export async function startMockWorker(): Promise<void> {
  const worker = setupWorker(...handlers);

  await worker.start({
    // 하위 경로(/portal/ 등)에 배포해도 워커를 찾을 수 있게 배포 경로를 붙입니다.
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    onUnhandledFrame({ frame, defaults }) {
      // API 경로인데 핸들러가 없는 요청만 경고합니다. 그 외(화면 파일 등)는 그대로 통과시킵니다.
      if (frame.protocol !== 'http') return;
      const { request } = frame.data as { request: Request };
      if (new URL(request.url).pathname.startsWith(runtimeConfig.apiBaseUrl)) defaults.warn();
    },
  });

  window.__mock = mockControls;
}
