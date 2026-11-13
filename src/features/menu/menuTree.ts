import type { MenuNode } from './types';

/** 화면 경로로 찾은 메뉴 항목과, 최상위부터 그 항목까지의 경로 */
export interface MenuEntry {
  menu: MenuNode;
  /** 최상위 메뉴부터 자신까지 (자신 포함) */
  trail: MenuNode[];
}

/** 메뉴 트리를 "화면 경로 → 메뉴 항목" 으로 찾을 수 있게 펼칩니다. */
export function indexMenusByPath(menus: MenuNode[]): Map<string, MenuEntry> {
  const index = new Map<string, MenuEntry>();

  const visit = (nodes: MenuNode[], parents: MenuNode[]) => {
    for (const menu of nodes) {
      const trail = [...parents, menu];
      if (menu.path) index.set(menu.path, { menu, trail });
      if (menu.children) visit(menu.children, trail);
    }
  };

  visit(menus, []);
  return index;
}
