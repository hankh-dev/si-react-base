import { memo, Suspense, useMemo } from 'react';
import { matchScreen } from '@/app/router/screens';
import type { MenuEntry } from '@/features/menu/menuTree';
import ForbiddenPage from '@/pages/error/ForbiddenPage';
import NotFoundPage from '@/pages/error/NotFoundPage';
import { HOME_PATH } from '@/shared/config/constants';
import { ScreenContext, type ScreenAction, type ScreenInfo } from '@/shared/screen/ScreenContext';
import { useTabStore } from '@/shared/screen/tabStore';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { KeepAlive } from '@/shared/ui/KeepAlive';
import { PageLoading } from '@/shared/ui/PageLoading';
import styles from './MainLayout.module.css';

interface TabPaneProps {
  path: string;
  active: boolean;
  /** 서버 메뉴에서 찾은 항목. 없으면 이 사용자에게 권한이 없는 화면입니다. */
  entry: MenuEntry | undefined;
}

/**
 * 탭 하나의 화면.
 * 숨겨진 동안에도 상태를 유지하고(KeepAlive), 화면에 필요한 정보(제목·권한 등)를
 * ScreenContext 로 내려줍니다. 화면에서 난 오류는 이 탭 안에서만 처리됩니다.
 */
const TabPane = memo(function TabPane({ path, active, entry }: TabPaneProps) {
  const match = useMemo(() => matchScreen(path), [path]);

  const screen = useMemo<ScreenInfo>(() => {
    const actions = new Set<ScreenAction>(entry?.menu.actions);
    return {
      path,
      title: entry?.menu.name ?? match?.screen.title ?? path,
      breadcrumb: entry?.trail.map((menu) => menu.name) ?? [],
      params: match?.params ?? {},
      active,
      can: (action) => actions.has(action),
    };
  }, [path, entry, match, active]);

  if (!match) return null;

  const Screen = match.screen.component;
  // 홈은 메뉴 데이터와 무관하게 항상 볼 수 있습니다.
  const allowed = entry !== undefined || path === HOME_PATH;

  return (
    <KeepAlive active={active} className={styles.pane}>
      <ScreenContext value={screen}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoading />}>{allowed ? <Screen /> : <ForbiddenPage />}</Suspense>
        </ErrorBoundary>
      </ScreenContext>
    </KeepAlive>
  );
});

interface TabPanesProps {
  /** 표시할 탭의 경로 (순서대로) */
  paths: string[];
  activePath: string;
  menuIndex: Map<string, MenuEntry>;
}

/** 열린 탭의 화면을 모두 그려 두고, 현재 탭만 보이게 합니다. */
export function TabPanes({ paths, activePath, menuIndex }: TabPanesProps) {
  const versions = useTabStore((state) => state.versions);

  return (
    <div className={styles.panes}>
      {paths.map((path) => (
        <TabPane
          // 새로고침하면 version 이 바뀌어 화면을 처음 상태로 다시 만듭니다.
          key={`${path}#${versions[path] ?? 0}`}
          path={path}
          active={path === activePath}
          entry={menuIndex.get(path)}
        />
      ))}

      {/* 등록되지 않은 주소 */}
      {!paths.includes(activePath) && (
        <div className={styles.pane}>
          <NotFoundPage />
        </div>
      )}
    </div>
  );
}
