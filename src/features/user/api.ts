import { downloadFile } from '@/shared/api/download';
import { http } from '@/shared/api/http';
import type { PageResponse } from '@/shared/api/types';
import { toPageParams, type ListQuery } from '@/shared/lib/useListQuery';
import type { User, UserSaveRequest, UserSearchCondition } from './types';

/** 폼의 조회조건을 서버 파라미터로 바꿉니다. 빈 값은 http 클라이언트가 알아서 뺍니다. */
function toConditionParams(condition: UserSearchCondition) {
  const [joinedFrom, joinedTo] = condition.joinedRange;
  return {
    keyword: condition.keyword.trim(),
    deptCode: condition.deptCode,
    status: condition.status,
    joinedFrom,
    joinedTo,
  };
}

export async function fetchUsers(
  query: ListQuery<UserSearchCondition>,
  signal?: AbortSignal,
): Promise<PageResponse<User>> {
  const { data } = await http.get<PageResponse<User>>('/users', {
    params: { ...toConditionParams(query.condition), ...toPageParams(query) },
    signal,
  });
  return data;
}

export async function fetchUser(id: number, signal?: AbortSignal): Promise<User> {
  const { data } = await http.get<User>(`/users/${id}`, { signal });
  return data;
}

export async function createUser(body: UserSaveRequest): Promise<User> {
  const { data } = await http.post<User>('/users', body);
  return data;
}

export async function updateUser(id: number, body: UserSaveRequest): Promise<User> {
  const { data } = await http.put<User>(`/users/${id}`, body);
  return data;
}

export async function deleteUsers(ids: number[]): Promise<void> {
  await http.delete('/users', { params: { ids } });
}

/** 현재 조회조건에 해당하는 전체 건을 서버가 엑셀로 만들어 내려줍니다 (페이지와 무관). */
export async function downloadUsersExcel(condition: UserSearchCondition): Promise<void> {
  await downloadFile('/users/excel', {
    params: toConditionParams(condition),
    fallbackFilename: '사용자목록.xlsx',
  });
}
