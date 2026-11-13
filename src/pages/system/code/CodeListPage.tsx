import { Input, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCodeGroups, useCodeItems } from '@/features/code/queries';
import type { CodeGroup, CodeItem } from '@/features/code/types';
import { useListQuery } from '@/shared/lib/useListQuery';
import { DataGrid } from '@/shared/ui/DataGrid/DataGrid';
import type { GridColumn } from '@/shared/ui/DataGrid/types';
import { FormField } from '@/shared/ui/FormField';
import { PageContainer } from '@/shared/ui/PageContainer';
import { SearchForm } from '@/shared/ui/SearchForm';
import styles from './CodeListPage.module.css';

interface CodeSearchCondition {
  keyword: string;
}

const DEFAULT_SEARCH: CodeSearchCondition = { keyword: '' };

const GROUP_COLUMNS: GridColumn<CodeGroup>[] = [
  { field: 'groupCode', title: '그룹 코드', width: 160 },
  { field: 'groupName', title: '그룹명', width: 110 },
  { field: 'description', title: '설명', minWidth: 100, flex: 1 },
  { field: 'codeCount', title: '코드 수', width: 80, align: 'right' },
];

const ITEM_COLUMNS: GridColumn<CodeItem>[] = [
  { field: 'sortOrder', title: '순서', width: 80, align: 'center' },
  { field: 'code', title: '코드', width: 160 },
  { field: 'name', title: '코드명', minWidth: 160, flex: 1 },
  {
    field: 'useYn',
    title: '사용',
    width: 90,
    align: 'center',
    render: (row) =>
      row.useYn === 'Y' ? <Tag color="green">사용</Tag> : <Tag color="default">미사용</Tag>,
  },
];

/*
 * 공통코드 조회 — 마스터/디테일 화면의 표준 예시
 *
 * 왼쪽 그리드(코드 그룹)에서 한 행을 고르면 오른쪽 그리드(그 그룹의 코드)를 조회합니다.
 */
export default function CodeListPage() {
  const { query, search, reset } = useListQuery(DEFAULT_SEARCH);
  const searchForm = useForm<CodeSearchCondition>({ defaultValues: DEFAULT_SEARCH });

  const [selectedGroup, setSelectedGroup] = useState<CodeGroup | null>(null);
  const groups = useCodeGroups(query.condition.keyword.trim(), query.seq);
  const items = useCodeItems(selectedGroup?.groupCode ?? null);

  // 그룹을 고르기 전에는 오른쪽 그리드를 비워 둡니다.
  const itemRows = useMemo(() => (selectedGroup ? items.data : []), [selectedGroup, items.data]);

  return (
    <PageContainer>
      <SearchForm
        onSearch={searchForm.handleSubmit(search)}
        onReset={() => {
          searchForm.reset();
          reset();
        }}
        loading={groups.isFetching}
      >
        <FormField control={searchForm.control} name="keyword" label="검색어">
          {(field) => <Input {...field} placeholder="그룹 코드 또는 그룹명" allowClear />}
        </FormField>
      </SearchForm>

      <div className={styles.split}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>코드 그룹</h2>
          <DataGrid
            columns={GROUP_COLUMNS}
            rows={groups.data}
            rowKey="groupCode"
            loading={groups.isFetching}
            selection="single"
            // 다시 조회해서 선택한 그룹이 목록에서 사라지면 선택도 함께 풀립니다.
            onSelectionChange={(rows) => setSelectedGroup(rows[0] ?? null)}
          />
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            코드{selectedGroup && ` · ${selectedGroup.groupName}`}
          </h2>
          <DataGrid
            columns={ITEM_COLUMNS}
            rows={itemRows}
            rowKey="code"
            loading={selectedGroup !== null && items.isFetching}
            emptyText={selectedGroup ? undefined : '왼쪽에서 코드 그룹을 선택해 주세요.'}
          />
        </section>
      </div>
    </PageContainer>
  );
}
