import { useCallback, useState } from 'react';
import { toSortParam, type PageParams, type SortState } from '@/shared/api/types';
import { DEFAULT_PAGE_SIZE } from '@/shared/config/constants';

/** 목록 화면의 조회 상태: 적용된 조회조건 + 페이지 + 정렬 */
export interface ListQuery<TCondition> {
  /** 조회 버튼을 눌러 "적용된" 조건. 입력 중인 값은 폼이 따로 가지고 있습니다. */
  condition: TCondition;
  page: number;
  size: number;
  sort: SortState | null;
  /**
   * 조회 버튼을 누를 때마다 1씩 늘어나는 일련번호.
   * 조회 키에 포함되므로, 조건이 그대로여도 조회 버튼을 누르면 항상 서버를 다시 조회합니다.
   */
  seq: number;
}

interface Options {
  size?: number;
  sort?: SortState | null;
}

/**
 * 목록 화면의 조회 상태를 관리합니다. (조회조건 + 그리드 + 페이징 화면의 공통 패턴)
 *
 * - search: 조회 버튼. 조건을 적용하고 1페이지로 돌아갑니다.
 * - reset: 초기화 버튼. 조건·페이지·정렬을 처음 값으로 되돌립니다.
 * - changePage / changeSort: 그리드의 페이지·정렬 변경
 */
export function useListQuery<TCondition>(defaultCondition: TCondition, options?: Options) {
  const [initial] = useState<ListQuery<TCondition>>(() => ({
    condition: defaultCondition,
    page: 1,
    size: options?.size ?? DEFAULT_PAGE_SIZE,
    sort: options?.sort ?? null,
    seq: 0,
  }));
  const [query, setQuery] = useState(initial);

  const search = useCallback((condition: TCondition) => {
    setQuery((prev) => ({ ...prev, condition, page: 1, seq: prev.seq + 1 }));
  }, []);

  const reset = useCallback(() => {
    setQuery((prev) => ({ ...initial, seq: prev.seq + 1 }));
  }, [initial]);

  const changePage = useCallback((page: number, size: number) => {
    // 페이지 크기를 바꾸면 1페이지부터 다시 봅니다.
    setQuery((prev) => ({ ...prev, page: size === prev.size ? page : 1, size }));
  }, []);

  const changeSort = useCallback((sort: SortState | null) => {
    setQuery((prev) => ({ ...prev, sort, page: 1 }));
  }, []);

  return { query, search, reset, changePage, changeSort };
}

/** 조회 상태에서 서버로 보낼 페이징 파라미터를 꺼냅니다. */
export function toPageParams(query: ListQuery<unknown>): PageParams {
  return { page: query.page, size: query.size, sort: toSortParam(query.sort) };
}
