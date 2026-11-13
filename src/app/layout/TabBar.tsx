import { Dropdown, Tabs, type MenuProps } from 'antd';
import { useNavigate } from 'react-router';
import { HOME_PATH } from '@/shared/config/constants';
import { nextPathAfterClose, useTabStore } from '@/shared/screen/tabStore';
import styles from './MainLayout.module.css';

type TabCommand = 'refresh' | 'close' | 'closeOthers' | 'closeAll';

interface TabBarProps {
  /** 표시할 탭의 경로 (순서대로) */
  paths: string[];
  activePath: string;
  titleOf: (path: string) => string;
}

/**
 * 열린 화면 탭. 탭을 누르면 그 화면으로 이동하고, 마우스 오른쪽 버튼으로
 * 새로고침 / 닫기 / 다른 탭 닫기 / 전체 닫기를 할 수 있습니다.
 */
export function TabBar({ paths, activePath, titleOf }: TabBarProps) {
  const navigate = useNavigate();
  const { close, closeOthers, closeAll, refresh } = useTabStore.getState();

  // 닫을 때는 먼저 다음 화면으로 이동한 뒤 탭을 없앱니다.
  const closeTab = async (path: string) => {
    const next = nextPathAfterClose(paths, path, activePath);
    if (next) await navigate(next);
    close(path);
  };

  const run = async (command: TabCommand, path: string) => {
    switch (command) {
      case 'refresh':
        refresh(path);
        break;
      case 'close':
        await closeTab(path);
        break;
      case 'closeOthers':
        if (activePath !== path && activePath !== HOME_PATH) await navigate(path);
        closeOthers(path);
        break;
      case 'closeAll':
        if (activePath !== HOME_PATH) await navigate(HOME_PATH);
        closeAll();
        break;
    }
  };

  const contextMenu = (path: string): MenuProps => ({
    items: [
      { key: 'refresh', label: '새로고침' },
      { key: 'close', label: '닫기', disabled: path === HOME_PATH },
      { type: 'divider' },
      { key: 'closeOthers', label: '다른 탭 닫기' },
      { key: 'closeAll', label: '전체 닫기' },
    ],
    onClick: ({ key }) => void run(key as TabCommand, path),
  });

  return (
    <Tabs
      className={styles.tabs}
      type="editable-card"
      size="small"
      hideAdd
      tabBarStyle={{ margin: 0 }}
      activeKey={activePath}
      items={paths.map((path) => ({
        key: path,
        closable: path !== HOME_PATH,
        label: (
          <Dropdown trigger={['contextMenu']} menu={contextMenu(path)}>
            <span className={styles.tabLabel}>{titleOf(path)}</span>
          </Dropdown>
        ),
      }))}
      onChange={(path) => void navigate(path)}
      onEdit={(target, action) => {
        if (action === 'remove' && typeof target === 'string') void closeTab(target);
      }}
    />
  );
}
