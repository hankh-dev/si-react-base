import { Menu, type MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import type { MenuEntry } from '@/features/menu/menuTree';
import type { MenuNode } from '@/features/menu/types';
import { useOpenScreen } from '@/shared/screen/useOpenScreen';
import styles from './MainLayout.module.css';
import { MenuIcon } from './menuIcons';

type MenuItem = NonNullable<MenuProps['items']>[number];

/** 화면이 있는 메뉴는 경로를, 하위 메뉴를 묶는 메뉴는 id 를 키로 씁니다. */
function toItems(menus: MenuNode[]): MenuItem[] {
  return menus.map((menu) => {
    const icon = <MenuIcon name={menu.icon} />;
    if (menu.children?.length) {
      return { key: menu.id, icon, label: menu.name, children: toItems(menu.children) };
    }
    return { key: menu.path ?? menu.id, icon, label: menu.name };
  });
}

/** 해당 화면의 상위 메뉴 id 목록 (펼쳐야 할 메뉴) */
function parentKeys(menuIndex: Map<string, MenuEntry>, path: string): string[] {
  return (
    menuIndex
      .get(path)
      ?.trail.slice(0, -1)
      .map((menu) => menu.id) ?? []
  );
}

interface SideMenuProps {
  menus: MenuNode[];
  menuIndex: Map<string, MenuEntry>;
  activePath: string;
  collapsed: boolean;
}

/** 좌측 메뉴. 서버가 내려준 메뉴 트리를 그대로 그리고, 누르면 그 화면을 탭으로 엽니다. */
export function SideMenu({ menus, menuIndex, activePath, collapsed }: SideMenuProps) {
  const openScreen = useOpenScreen();
  const items = useMemo(() => toItems(menus), [menus]);

  const [openKeys, setOpenKeys] = useState(() => parentKeys(menuIndex, activePath));

  // 탭 전환 등으로 화면이 바뀌면 그 화면이 속한 상위 메뉴를 펼칩니다.
  // (이전 값과 비교해 렌더링 중에 상태를 맞추는 방식 — effect 를 쓰지 않습니다.)
  const [syncedPath, setSyncedPath] = useState(activePath);
  if (syncedPath !== activePath) {
    setSyncedPath(activePath);
    setOpenKeys((keys) => [...new Set([...keys, ...parentKeys(menuIndex, activePath)])]);
  }

  return (
    <Menu
      className={styles.menu}
      mode="inline"
      items={items}
      selectedKeys={[activePath]}
      // 접힌 상태에서는 하위 메뉴가 떠서 열리므로 펼침 상태를 넘기지 않습니다.
      {...(collapsed ? {} : { openKeys, onOpenChange: setOpenKeys })}
      onClick={({ key }) => {
        if (menuIndex.has(key)) openScreen(key);
      }}
    />
  );
}
