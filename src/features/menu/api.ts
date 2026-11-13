import { http } from '@/shared/api/http';
import type { MenuNode } from './types';

/** 로그인한 사용자의 메뉴 트리 */
export async function fetchMyMenus(signal?: AbortSignal): Promise<MenuNode[]> {
  const { data } = await http.get<MenuNode[]>('/menus/my', { signal });
  return data;
}
