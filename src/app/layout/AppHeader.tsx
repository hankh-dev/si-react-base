import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, ConfigProvider, Layout, Tag, theme } from 'antd';
import { logout } from '@/app/session';
import { useAuthStore } from '@/features/auth/store';
import { runtimeConfig } from '@/shared/config/runtimeConfig';
import styles from './MainLayout.module.css';

const ENV_LABELS = { local: '로컬', dev: '개발', stg: '검증', prod: '운영' } as const;

interface AppHeaderProps {
  collapsed: boolean;
  onToggleMenu: () => void;
}

/** 상단 바: 메뉴 접기 버튼, 시스템 이름, 접속 환경 표시, 로그인 사용자, 로그아웃 */
export function AppHeader({ collapsed, onToggleMenu }: AppHeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    // 어두운 배경 위에 놓이므로 이 영역의 버튼·글자만 어두운 테마 색을 씁니다.
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Layout.Header className={styles.header}>
        <Button
          type="text"
          aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleMenu}
        />
        <span className={styles.brand}>{runtimeConfig.appTitle}</span>
        {/* 운영이 아닌 환경에서는 어디에 접속했는지 눈에 띄게 표시합니다. */}
        {runtimeConfig.envName !== 'prod' && (
          <Tag color="gold">{ENV_LABELS[runtimeConfig.envName]}</Tag>
        )}

        <div className={styles.spacer} />

        {user && (
          <span className={styles.user}>
            <UserOutlined /> {user.userName} ({user.deptName} · {user.roleName})
          </span>
        )}
        <Button type="text" icon={<LogoutOutlined />} onClick={() => void logout()}>
          로그아웃
        </Button>
      </Layout.Header>
    </ConfigProvider>
  );
}
