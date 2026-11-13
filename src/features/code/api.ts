import { http } from '@/shared/api/http';
import type { CodeGroup, CodeItem } from './types';

/** 공통코드 그룹 목록 */
export async function fetchCodeGroups(keyword: string, signal?: AbortSignal): Promise<CodeGroup[]> {
  const { data } = await http.get<CodeGroup[]>('/code-groups', { params: { keyword }, signal });
  return data;
}

/** 한 그룹에 속한 공통코드 (정렬순서대로) */
export async function fetchCodes(groupCode: string, signal?: AbortSignal): Promise<CodeItem[]> {
  const { data } = await http.get<CodeItem[]>(`/codes/${encodeURIComponent(groupCode)}`, {
    signal,
  });
  return data;
}
