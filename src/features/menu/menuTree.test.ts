import { describe, expect, it } from 'vitest';
import { indexMenusByPath } from './menuTree';
import type { MenuNode } from './types';

const menus: MenuNode[] = [
  { id: 'M100', name: '대시보드', path: '/' },
  {
    id: 'M900',
    name: '시스템 관리',
    children: [
      { id: 'M910', name: '사용자 관리', path: '/system/users', actions: ['READ', 'CREATE'] },
      { id: 'M920', name: '공통코드 조회', path: '/system/codes' },
    ],
  },
];

describe('indexMenusByPath', () => {
  it('화면 경로로 메뉴 항목을 찾을 수 있다', () => {
    const index = indexMenusByPath(menus);

    expect(index.get('/system/users')?.menu.actions).toEqual(['READ', 'CREATE']);
    expect(index.get('/')?.menu.name).toBe('대시보드');
  });

  it('최상위 메뉴부터 자신까지의 경로를 함께 돌려준다', () => {
    const trail = indexMenusByPath(menus).get('/system/codes')?.trail;

    expect(trail?.map((menu) => menu.name)).toEqual(['시스템 관리', '공통코드 조회']);
  });

  it('화면이 없는 묶음 메뉴와 등록되지 않은 경로는 색인에 없다', () => {
    const index = indexMenusByPath(menus);

    expect(index.size).toBe(3);
    expect(index.has('/system')).toBe(false);
  });
});
