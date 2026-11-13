import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GetRowIdParams,
  type GridApi,
  type RowDataUpdatedEvent,
  type ICellRendererParams,
  type RowSelectionOptions,
  type SortChangedEvent,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { Pagination } from 'antd';
import { useCallback, useMemo, useRef } from 'react';
import type { SortState } from '@/shared/api/types';
import { PAGE_SIZE_OPTIONS } from '@/shared/config/constants';
import { messages } from '@/shared/config/messages';
import { BORDER_RADIUS, FONT_FAMILY, FONT_SIZE, palette } from '@/shared/config/theme';
import styles from './DataGrid.module.css';
import type { DataGridProps, GridColumn } from './types';

/*
 * 그리드 공통 컴포넌트 (AG Grid Community 를 감싼 것)
 *
 * 화면은 이 컴포넌트와 types.ts 의 타입만 사용합니다. AG Grid 를 직접 import 하지 않습니다.
 * 페이징과 정렬은 서버가 처리합니다. 그리드는 서버가 준 한 페이지를 순서 그대로 보여주기만 합니다.
 */

// 필요한 기능만 골라 등록하면 번들 크기를 줄일 수 있습니다. 템플릿에서는 전체를 등록합니다.
ModuleRegistry.registerModules([AllCommunityModule]);

const gridTheme = themeQuartz.withParams({
  // 화면의 다른 부분과 같은 시스템 글꼴을 씁니다. (테마 기본 글꼴은 PC 에 없으면 적용되지 않습니다)
  fontFamily: FONT_FAMILY,
  fontSize: FONT_SIZE,
  accentColor: palette.primary,
  borderColor: palette.border,
  headerBackgroundColor: palette.gridHeaderBg,
  headerFontWeight: 600,
  wrapperBorderRadius: BORDER_RADIUS,
  spacing: 6,
});

const ROW_NUMBER_COL_ID = '__rowNumber';

/** 정렬은 서버가 하므로 그리드 안에서는 순서를 바꾸지 않습니다. (헤더의 정렬 표시만 사용) */
const keepServerOrder = () => 0;

function alignStyle(align: GridColumn<unknown>['align']) {
  return align && align !== 'left' ? { textAlign: align } : undefined;
}

function toColDef<TRow>(column: GridColumn<TRow>, sort: SortState | null): ColDef<TRow> {
  const { field, format, render } = column;
  const sortable = column.sortable ?? false;

  return {
    colId: field,
    // AG Grid 의 field 타입은 중첩 경로까지 계산하는 타입이라 제네릭 TRow 에서는 직접 맞출 수 없습니다.
    field: field as unknown as ColDef<TRow>['field'],
    headerName: column.title,
    width: column.width,
    minWidth: column.minWidth,
    flex: column.flex,
    pinned: column.pinned,
    headerClass: column.align ? `dg-header-${column.align}` : undefined,
    cellStyle: alignStyle(column.align),
    sortable,
    // null 은 "정렬 표시 해제", undefined 는 "건드리지 않음" 입니다.
    sort: sortable && sort?.field === field ? sort.order : null,
    comparator: keepServerOrder,
    valueFormatter: format ? (params) => (params.data ? format(params.data) : '') : undefined,
    cellRenderer: render
      ? (params: ICellRendererParams<TRow>) => (params.data ? render(params.data) : null)
      : undefined,
  };
}

function rowNumberColDef<TRow>(offset: number): ColDef<TRow> {
  return {
    colId: ROW_NUMBER_COL_ID,
    headerName: 'No',
    width: 64,
    pinned: 'left',
    sortable: false,
    resizable: false,
    suppressMovable: true,
    headerClass: 'dg-header-center',
    cellStyle: { textAlign: 'center' },
    valueGetter: (params) => (params.node?.rowIndex ?? 0) + offset + 1,
  };
}

function toRowSelection<TRow>(
  selection: NonNullable<DataGridProps<TRow>['selection']>,
): RowSelectionOptions<TRow> | undefined {
  if (selection === 'multiple') {
    return { mode: 'multiRow', checkboxes: true, headerCheckbox: true };
  }
  if (selection === 'single') {
    return { mode: 'singleRow', checkboxes: false, enableClickSelection: true };
  }
  return undefined;
}

function readSort<TRow>(api: GridApi<TRow>): SortState | null {
  const sorted = api
    .getColumnState()
    .find((state) => state.sort === 'asc' || state.sort === 'desc');
  if (!sorted || (sorted.sort !== 'asc' && sorted.sort !== 'desc')) return null;
  return { field: sorted.colId, order: sorted.sort };
}

export function DataGrid<TRow>({
  columns,
  rows,
  rowKey,
  loading = false,
  rowNumber = false,
  selection = 'none',
  onSelectionChange,
  onRowDoubleClick,
  sort = null,
  onSortChange,
  pagination,
  emptyText = messages.noData,
}: DataGridProps<TRow>) {
  const rowOffset = pagination ? (pagination.page - 1) * pagination.size : 0;

  const columnDefs = useMemo<ColDef<TRow>[]>(() => {
    const defs = columns.map((column) => toColDef(column, sort));
    return rowNumber ? [rowNumberColDef<TRow>(rowOffset), ...defs] : defs;
  }, [columns, sort, rowNumber, rowOffset]);

  const rowSelection = useMemo(() => toRowSelection<TRow>(selection), [selection]);

  const localeText = useMemo(
    () => ({ ...AG_GRID_LOCALE_KR, noRowsToShow: emptyText }),
    [emptyText],
  );

  const getRowId = useCallback(
    (params: GetRowIdParams<TRow>) => String(params.data[rowKey]),
    [rowKey],
  );

  const reportSelection = (api: GridApi<TRow>) => {
    onSelectionChange?.(api.getSelectedRows());
  };

  // 직전에 표시하던 첫 행. 데이터가 갱신됐을 때 "다른 목록" 인지 판단하는 기준입니다.
  const firstRowIdRef = useRef<string | null>(null);

  const handleRowDataUpdated = (event: RowDataUpdatedEvent<TRow>) => {
    // 첫 행이 바뀌었으면(페이지 이동·새 조회·정렬) 맨 위부터 보여줍니다.
    // 같은 목록을 다시 받은 경우(저장 후 재조회 등)에는 보던 위치를 유지합니다.
    const firstRowId = event.api.getDisplayedRowAtIndex(0)?.id ?? null;
    if (firstRowId !== firstRowIdRef.current) {
      firstRowIdRef.current = firstRowId;
      if (firstRowId !== null) event.api.ensureIndexVisible(0, 'top');
    }
    // 사라진 행의 선택이 풀리므로 현재 선택을 다시 알립니다.
    reportSelection(event.api);
  };

  const handleSortChanged = (event: SortChangedEvent<TRow>) => {
    if (!onSortChange) return;
    const next = readSort(event.api);
    // 부모가 내려준 정렬과 같으면(= 방금 반영된 결과) 다시 알리지 않습니다.
    if (next?.field === sort?.field && next?.order === sort?.order) return;
    onSortChange(next);
  };

  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        <AgGridReact<TRow>
          theme={gridTheme}
          localeText={localeText}
          columnDefs={columnDefs}
          rowData={rows}
          getRowId={getRowId}
          loading={loading}
          rowSelection={rowSelection}
          suppressMultiSort
          // 셀의 글자를 마우스로 끌어 복사할 수 있게 합니다.
          enableCellTextSelection
          onSelectionChanged={(event) => reportSelection(event.api)}
          onRowDataUpdated={handleRowDataUpdated}
          // 행 순서가 바뀌면 순번 열을 다시 계산합니다. (그리드는 값이 바뀐 셀만 다시 그리기 때문)
          onModelUpdated={(event) => {
            if (rowNumber) event.api.refreshCells({ columns: [ROW_NUMBER_COL_ID], force: true });
          }}
          onSortChanged={handleSortChanged}
          onRowDoubleClicked={(event) => {
            if (event.data) onRowDoubleClick?.(event.data);
          }}
        />
      </div>

      {pagination && (
        <div className={styles.footer}>
          <Pagination
            size="small"
            current={pagination.page}
            pageSize={pagination.size}
            total={pagination.total}
            showSizeChanger
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onChange={pagination.onChange}
          />
        </div>
      )}
    </div>
  );
}
