import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { matchPath } from 'react-router';

/*
 * 화면 등록부
 *
 * 탭으로 열 수 있는 화면을 "경로 → 화면 컴포넌트" 로 등록합니다.
 * 화면을 추가할 때는 여기에 한 줄을 추가하고, 서버의 메뉴 데이터에 같은 경로를 등록합니다.
 * (자세한 순서는 docs/02-new-screen.md)
 *
 * 화면 파일은 처음 열 때 내려받도록 lazy 로 불러옵니다.
 */
export interface ScreenDef {
  /** 경로. /orders/:orderId 처럼 변수를 쓸 수 있고, 값은 useScreen().params 로 읽습니다. */
  path: string;
  /** 서버 메뉴에 이름이 없을 때 쓰는 화면 이름 */
  title: string;
  component: LazyExoticComponent<ComponentType>;
}

export const screens: ScreenDef[] = [
  {
    path: '/',
    title: '대시보드',
    component: lazy(() => import('@/pages/dashboard/DashboardPage')),
  },
  {
    path: '/system/users',
    title: '사용자 관리',
    component: lazy(() => import('@/pages/system/user/UserListPage')),
  },
  {
    path: '/system/codes',
    title: '공통코드 조회',
    component: lazy(() => import('@/pages/system/code/CodeListPage')),
  },
];

export interface ScreenMatch {
  screen: ScreenDef;
  params: Record<string, string | undefined>;
}

/** 경로에 해당하는 화면을 찾습니다. 등록되지 않은 경로면 null */
export function matchScreen(pathname: string, registry: ScreenDef[] = screens): ScreenMatch | null {
  for (const screen of registry) {
    const match = matchPath({ path: screen.path, end: true }, pathname);
    if (match) return { screen, params: match.params };
  }
  return null;
}

/** 탭 키로 쓰기 위해 경로 끝의 '/' 를 뗍니다. ('/system/users/' → '/system/users') */
export function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}
