import {
  AppstoreOutlined,
  CodeOutlined,
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ComponentType } from 'react';

/*
 * 메뉴 아이콘 등록부
 *
 * 서버의 메뉴 데이터는 아이콘을 이름(문자열)으로 가지고 있습니다.
 * 여기 등록된 이름만 화면에 표시되므로, 새 아이콘을 쓰려면 이 목록에 추가합니다.
 * (아이콘 전체를 불러오지 않고 쓰는 것만 번들에 넣기 위한 방식입니다.)
 */
const ICONS: Record<string, ComponentType> = {
  dashboard: DashboardOutlined,
  setting: SettingOutlined,
  team: TeamOutlined,
  code: CodeOutlined,
  file: FileTextOutlined,
  app: AppstoreOutlined,
};

export function MenuIcon({ name }: { name?: string }) {
  const Icon = name ? ICONS[name] : undefined;
  return Icon ? <Icon /> : null;
}
