import type { MenuNode } from '@/features/menu/types';

/*
 * 목 메뉴 데이터
 *
 * 실제 시스템에서는 "메뉴 관리 / 권한 관리" 화면으로 DB 에 저장하는 내용입니다.
 * 권한(roleCode)별로 볼 수 있는 메뉴와 화면 안에서 할 수 있는 동작이 다릅니다.
 */

const ALL_ACTIONS: MenuNode['actions'] = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXCEL'];
const READ_ONLY: MenuNode['actions'] = ['READ'];

const adminMenus: MenuNode[] = [
  { id: 'M100', name: '대시보드', path: '/', icon: 'dashboard', actions: READ_ONLY },
  {
    id: 'M900',
    name: '시스템 관리',
    icon: 'setting',
    children: [
      {
        id: 'M910',
        name: '사용자 관리',
        path: '/system/users',
        icon: 'team',
        actions: ALL_ACTIONS,
      },
      {
        id: 'M920',
        name: '공통코드 조회',
        path: '/system/codes',
        icon: 'code',
        actions: READ_ONLY,
      },
    ],
  },
];

/** 일반 사용자: 사용자 관리는 조회만, 공통코드 조회 메뉴는 없음 */
const userMenus: MenuNode[] = [
  { id: 'M100', name: '대시보드', path: '/', icon: 'dashboard', actions: READ_ONLY },
  {
    id: 'M900',
    name: '시스템 관리',
    icon: 'setting',
    children: [
      { id: 'M910', name: '사용자 관리', path: '/system/users', icon: 'team', actions: READ_ONLY },
    ],
  },
];

export function menusForRole(roleCode: string): MenuNode[] {
  return roleCode === 'ADMIN' ? adminMenus : userMenus;
}
