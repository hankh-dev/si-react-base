import { createContext, use } from 'react';

/** 화면 안의 버튼 단위 권한. 서버의 메뉴 정보(features/menu)가 화면별로 내려줍니다. */
export type ScreenAction = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXCEL';

/** 탭으로 열린 화면 하나에 대한 정보. 레이아웃이 화면마다 채워서 내려줍니다. */
export interface ScreenInfo {
  /** 화면 경로이자 탭의 키 */
  path: string;
  /** 화면 이름 (서버 메뉴 이름) */
  title: string;
  /** 상위 메뉴부터 이 화면까지의 이름 목록 */
  breadcrumb: string[];
  /** 경로 변수. 예: /orders/:orderId 로 등록한 화면의 { orderId } */
  params: Record<string, string | undefined>;
  /** 지금 보이는 탭인지 여부. 숨겨진 탭도 상태를 유지한 채 마운트돼 있습니다. */
  active: boolean;
  /** 현재 사용자가 이 화면에서 해당 동작을 할 수 있는지 */
  can: (action: ScreenAction) => boolean;
}

export const ScreenContext = createContext<ScreenInfo | null>(null);

/** 현재 화면 정보. 탭으로 열리는 화면(pages) 안에서만 사용할 수 있습니다. */
export function useScreen(): ScreenInfo {
  const screen = use(ScreenContext);
  if (!screen) {
    throw new Error('useScreen 은 탭으로 열린 화면 안에서만 사용할 수 있습니다.');
  }
  return screen;
}

/** 현재 화면이 보이는 탭인지 여부. 화면 밖(로그인 화면, 레이아웃)에서는 항상 true 입니다. */
export function useScreenActive(): boolean {
  return use(ScreenContext)?.active ?? true;
}
