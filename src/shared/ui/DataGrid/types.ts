import type { ReactNode } from 'react';
import type { SortState } from '@/shared/api/types';

/*
 * 그리드 공통 규격
 *
 * 화면은 그리드 제품(AG Grid)의 타입을 직접 쓰지 않고 이 타입만 사용합니다.
 * 고객사 표준 그리드로 바꿔야 할 때 DataGrid.tsx 안쪽만 고치면 되도록 하기 위한 경계입니다.
 */

export interface GridColumn<TRow> {
  /** 행 데이터의 속성 이름. 서버 정렬 파라미터에도 이 이름이 쓰입니다. */
  field: Extract<keyof TRow, string>;
  /** 헤더에 표시할 이름 */
  title: string;
  width?: number;
  minWidth?: number;
  /** 남는 너비를 나눠 갖는 비율. 지정하면 width 는 무시됩니다. */
  flex?: number;
  align?: 'left' | 'center' | 'right';
  /** 헤더를 눌러 정렬할 수 있는지 (서버 정렬) */
  sortable?: boolean;
  pinned?: 'left' | 'right';
  /** 표시할 문자열을 만듭니다. 예: 코드 → 코드명, 날짜·금액 서식 */
  format?: (row: TRow) => string;
  /** 셀을 직접 그립니다. 예: 상태 태그. 지정하면 format 보다 우선합니다. */
  render?: (row: TRow) => ReactNode;
}

/** 서버 페이징 상태 */
export interface GridPagination {
  /** 1부터 시작하는 현재 페이지 */
  page: number;
  size: number;
  /** 전체 건수 */
  total: number;
  onChange: (page: number, size: number) => void;
}

export interface DataGridProps<TRow> {
  columns: GridColumn<TRow>[];
  rows: TRow[] | undefined;
  /** 행을 구분하는 속성 이름 (PK). 데이터가 갱신돼도 선택·스크롤을 유지하는 기준입니다. */
  rowKey: Extract<keyof TRow, string>;
  loading?: boolean;
  /** 순번(No) 열 표시 */
  rowNumber?: boolean;
  /** none: 선택 없음 / single: 행 클릭으로 한 건 / multiple: 체크박스로 여러 건 */
  selection?: 'none' | 'single' | 'multiple';
  /** 선택이 바뀌거나 데이터가 갱신될 때마다 현재 선택된 행을 알려줍니다. */
  onSelectionChange?: (rows: TRow[]) => void;
  onRowDoubleClick?: (row: TRow) => void;
  /** 현재 정렬 (서버 정렬). 헤더의 정렬 표시와 동기화됩니다. */
  sort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** 지정하면 그리드 아래에 페이지 이동 영역을 표시합니다. */
  pagination?: GridPagination;
  /** 데이터가 없을 때 표시할 문구 */
  emptyText?: string;
}
