import { Button, Layout, Result } from 'antd';
import { useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import { matchScreen, normalizePath } from '@/app/router/screens';
import { useMenuIndex, useMyMenus } from '@/features/menu/queries';
import { useTabStore } from '@/shared/screen/tabStore';
import { PageLoading } from '@/shared/ui/PageLoading';
import { AppHeader } from './AppHeader';
import styles from './MainLayout.module.css';
import { SideMenu } from './SideMenu';
import { TabBar } from './TabBar';
import { TabPanes } from './TabPanes';

/**
 * 로그인 후의 기본 화면 틀: 상단 바 + 좌측 메뉴 + 탭 + 화면 영역.
 *
 * 지금 보이는 화면(활성 탭)은 항상 현재 주소입니다. 열린 탭 목록은 tabStore 가 가지고 있고,
 * 주소가 바뀔 때 탭을 여는 일은 라우터 구독(app/router/syncTabs.ts)이 합니다.
 */
export function MainLayout() {
  const location = useLocation();
  const activePath = normalizePath(location.pathname);

  const menus = useMyMenus();
  const menuIndex = useMenuIndex();
  const openPaths = useTabStore((state) => state.paths);
  const [collapsed, setCollapsed] = useState(false);

  const titleOf = useCallback(
    (path: string) => menuIndex.get(path)?.menu.name ?? matchScreen(path)?.screen.title ?? path,
    [menuIndex],
  );

  if (menus.isPending) return <PageLoading fullscreen />;

  if (menus.isError) {
    return (
      <Result
        status="error"
        title="메뉴 정보를 불러오지 못했습니다."
        extra={<Button onClick={() => void menus.refetch()}>다시 시도</Button>}
      />
    );
  }

  // 탭 목록과 주소가 한 박자 어긋나는 순간(탭을 닫는 중 등)에도 현재 주소의 화면은 계속 보여줍니다.
  const paths =
    openPaths.includes(activePath) || !matchScreen(activePath)
      ? openPaths
      : [...openPaths, activePath];

  return (
    <Layout className={styles.layout}>
      <AppHeader collapsed={collapsed} onToggleMenu={() => setCollapsed((value) => !value)} />
      <Layout>
        <Layout.Sider
          className={styles.sider}
          theme="light"
          width={220}
          collapsedWidth={56}
          collapsed={collapsed}
        >
          <SideMenu
            menus={menus.data}
            menuIndex={menuIndex}
            activePath={activePath}
            collapsed={collapsed}
          />
        </Layout.Sider>
        <Layout.Content className={styles.content}>
          <TabBar paths={paths} activePath={activePath} titleOf={titleOf} />
          <TabPanes paths={paths} activePath={activePath} menuIndex={menuIndex} />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
