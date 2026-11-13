import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchMyMenus } from './api';
import { indexMenusByPath, type MenuEntry } from './menuTree';

const EMPTY_INDEX = new Map<string, MenuEntry>();

/** 로그인한 사용자의 메뉴. 로그인 중에는 한 번만 조회합니다. */
export function useMyMenus() {
  return useQuery({
    queryKey: ['menus', 'my'],
    queryFn: ({ signal }) => fetchMyMenus(signal),
    staleTime: Infinity,
  });
}

/** "화면 경로 → 메뉴 항목" 찾기용 색인. 메뉴를 아직 못 받았으면 빈 색인입니다. */
export function useMenuIndex(): Map<string, MenuEntry> {
  const { data } = useMyMenus();
  return useMemo(() => (data ? indexMenusByPath(data) : EMPTY_INDEX), [data]);
}
