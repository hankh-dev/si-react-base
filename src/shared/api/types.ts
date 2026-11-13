/*
 * 목록 조회 공통 규격 (docs/03-api-contract.md)
 *
 * 요청: page(1부터), size, sort("필드,asc" 또는 "필드,desc")
 * 응답: { content, page, size, totalElements }
 */

export interface PageParams {
  /** 1부터 시작하는 페이지 번호 */
  page: number;
  size: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
}

export interface SortState {
  field: string;
  order: 'asc' | 'desc';
}

/** { field: 'userName', order: 'asc' } → "userName,asc" */
export function toSortParam(sort: SortState | null | undefined): string | undefined {
  return sort ? `${sort.field},${sort.order}` : undefined;
}
