import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListQuery } from '@/shared/lib/useListQuery';
import {
  createUser,
  deleteUsers,
  downloadUsersExcel,
  fetchUser,
  fetchUsers,
  updateUser,
} from './api';
import type { UserSaveRequest, UserSearchCondition } from './types';

/*
 * 조회 키
 * 저장·삭제 후 userKeys.lists() 를 무효화하면 화면에 떠 있는 목록이 다시 조회됩니다.
 * (상세는 팝업을 열 때마다 새로 조회하므로 무효화할 필요가 없습니다.)
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (query: ListQuery<UserSearchCondition>) => [...userKeys.lists(), query] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const,
};

/** 사용자 목록. 페이지를 넘기는 동안에는 이전 페이지를 그대로 보여줍니다. */
export function useUserList(query: ListQuery<UserSearchCondition>) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: ({ signal }) => fetchUsers(query, signal),
    placeholderData: keepPreviousData,
  });
}

/** 사용자 한 건. id 가 null 이면(등록 화면) 조회하지 않습니다. */
export function useUser(id: number | null) {
  return useQuery({
    queryKey: userKeys.detail(id ?? 0),
    queryFn: ({ signal }) => fetchUser(id ?? 0, signal),
    enabled: id !== null,
    // 수정 화면은 항상 서버의 최신 값으로 엽니다.
    gcTime: 0,
  });
}

/** 등록(id 없음) 또는 수정(id 있음) */
export function useSaveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: UserSaveRequest }) =>
      id === null ? createUser(body) : updateUser(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}

export function useDeleteUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => deleteUsers(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}

export function useDownloadUsersExcel() {
  return useMutation({
    mutationFn: (condition: UserSearchCondition) => downloadUsersExcel(condition),
  });
}
