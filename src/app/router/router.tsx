import { createBrowserRouter } from 'react-router';
import { MainLayout } from '@/app/layout/MainLayout';
import LoginPage from '@/pages/login/LoginPage';
import { LOGIN_PATH } from '@/shared/config/constants';
import { RequireAuth } from './RequireAuth';
import { syncTabsWithRouter } from './syncTabs';

/*
 * 라우터
 *
 * 경로는 두 갈래뿐입니다.
 * - /login : 로그인 화면
 * - 그 외  : 로그인한 사용자용 레이아웃. 어떤 화면을 보여줄지는 레이아웃이
 *            화면 등록부(screens.ts)와 열린 탭 목록으로 결정합니다.
 */
export const router = createBrowserRouter(
  [
    { path: LOGIN_PATH, element: <LoginPage /> },
    {
      path: '*',
      element: (
        <RequireAuth>
          <MainLayout />
        </RequireAuth>
      ),
    },
  ],
  {
    // 배포 경로(VITE_BASE_PATH). '/portal/' 로 빌드하면 '/portal' 아래에서 동작합니다.
    basename: import.meta.env.BASE_URL.replace(/\/+$/, '') || '/',
  },
);

syncTabsWithRouter(router);
