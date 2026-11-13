import type { ScreenAction } from '@/shared/screen/ScreenContext';

/**
 * 서버가 내려주는 메뉴 한 항목.
 * 서버는 로그인한 사용자가 볼 수 있는 메뉴만 내려줍니다. 목록에 없는 화면은 접근 권한이 없는 화면입니다.
 */
export interface MenuNode {
  id: string;
  name: string;
  /** 화면 경로. 하위 메뉴를 묶기만 하는 항목이면 없습니다. */
  path?: string;
  /** 아이콘 이름. 화면에서 쓸 수 있는 이름은 app/layout/menuIcons.tsx 에 등록합니다. */
  icon?: string;
  /** 이 화면에서 현재 사용자에게 허용된 동작 (버튼 단위 권한) */
  actions?: ScreenAction[];
  children?: MenuNode[];
}
