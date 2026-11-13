import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/shared/config/zod';
import '@/app/styles/global.css';
import { App } from '@/app/App';
import { ConfigErrorScreen } from '@/app/ConfigErrorScreen';
import { installSessionExpiredHandler } from '@/app/session';
import { restoreSession } from '@/features/auth/session';
import { runtimeConfig, runtimeConfigError } from '@/shared/config/runtimeConfig';

async function start(): Promise<void> {
  const root = createRoot(document.getElementById('root')!);

  // config.js 가 잘못됐으면 앱 대신 원인을 보여줍니다.
  if (runtimeConfigError) {
    root.render(<ConfigErrorScreen message={runtimeConfigError} />);
    return;
  }

  document.title = runtimeConfig.appTitle;

  // 목 API. 이 조건은 빌드할 때 상수로 바뀌므로, 목을 끈 빌드에는 목 코드가 포함되지 않습니다.
  if (import.meta.env.VITE_ENABLE_MOCK === 'true') {
    const { startMockWorker } = await import('@/mocks/browser');
    await startMockWorker();
  }

  installSessionExpiredHandler();
  // 이전 로그인이 살아 있으면 복원합니다. 끝나기 전까지 화면은 로딩 표시를 보여줍니다.
  void restoreSession();

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
