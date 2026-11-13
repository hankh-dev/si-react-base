import type { createBrowserRouter } from 'react-router';
import { useAuthStore } from '@/features/auth/store';
import { useTabStore } from '@/shared/screen/tabStore';
import { matchScreen, normalizePath } from './screens';

type AppRouter = ReturnType<typeof createBrowserRouter>;

/** 라우터가 알려주는 경로에는 배포 경로(/portal 등)가 붙어 있으므로 떼어냅니다. */
function stripBasename(pathname: string, basename: string | undefined): string {
  if (!basename || basename === '/') return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) return pathname;
  return pathname.slice(basename.length) || '/';
}

/**
 * 주소(URL)와 탭 목록을 맞춥니다.
 *
 * 주소가 바뀔 때마다 그 경로가 등록된 화면이면 탭으로 엽니다.
 * 메뉴 클릭뿐 아니라 주소 직접 입력, 브라우저 뒤로/앞으로 가기도 모두 이 한 곳을 거칩니다.
 */
export function syncTabsWithRouter(router: AppRouter): void {
  const sync = () => {
    // 로그인 전에 들어온 주소는 탭으로 만들지 않습니다.
    if (useAuthStore.getState().status !== 'authenticated') return;

    const path = normalizePath(stripBasename(router.state.location.pathname, router.basename));
    if (matchScreen(path)) useTabStore.getState().open(path);
  };

  sync();
  router.subscribe(sync);
  // 로그인(또는 로그인 상태 복원)이 끝난 시점의 주소도 탭으로 엽니다.
  useAuthStore.subscribe(sync);
}
