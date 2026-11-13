import { DeleteOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CodeSelect } from '@/features/code/CodeSelect';
import { useCodes } from '@/features/code/queries';
import { useDeleteUsers, useDownloadUsersExcel, useUserList } from '@/features/user/queries';
import { DEFAULT_USER_SEARCH } from '@/features/user/schema';
import type { User, UserSearchCondition } from '@/features/user/types';
import { messages } from '@/shared/config/messages';
import { formatDateTime, formatNumber, formatPhone } from '@/shared/lib/format';
import { useListQuery } from '@/shared/lib/useListQuery';
import { useScreen } from '@/shared/screen/ScreenContext';
import { DataGrid } from '@/shared/ui/DataGrid/DataGrid';
import type { GridColumn } from '@/shared/ui/DataGrid/types';
import { DateRangeInput } from '@/shared/ui/DateInput';
import { confirm, toast } from '@/shared/ui/feedback';
import { FormField } from '@/shared/ui/FormField';
import { PageContainer } from '@/shared/ui/PageContainer';
import { SearchForm } from '@/shared/ui/SearchForm';
import { Toolbar } from '@/shared/ui/Toolbar';
import { UserFormModal } from './UserFormModal';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'green',
  LOCKED: 'orange',
  INACTIVE: 'default',
};

/** 등록/수정 팝업의 상태. userId 가 null 이면 등록입니다. */
interface EditorState {
  open: boolean;
  userId: number | null;
}

/*
 * 사용자 관리 — 목록 화면의 표준 예시
 *
 * 구성: 조회조건 → 버튼 줄 → 그리드(서버 페이징·정렬) → 등록/수정 팝업
 * 새 목록 화면을 만들 때 이 파일을 복사해서 시작합니다. (docs/02-new-screen.md)
 */
export default function UserListPage() {
  const { can } = useScreen();

  // 1) 조회 상태: 입력 중인 조건은 폼이, 조회 버튼으로 적용된 조건·페이지·정렬은 query 가 가집니다.
  const { query, search, reset, changePage, changeSort } = useListQuery(DEFAULT_USER_SEARCH);
  const searchForm = useForm<UserSearchCondition>({ defaultValues: DEFAULT_USER_SEARCH });

  // 2) 서버 데이터
  const list = useUserList(query);
  const deleteUsers = useDeleteUsers();
  const downloadExcel = useDownloadUsersExcel();
  const dept = useCodes('DEPT');
  const role = useCodes('ROLE');
  const status = useCodes('USER_STATUS');

  // 3) 화면 상태
  const [selected, setSelected] = useState<User[]>([]);
  const [editor, setEditor] = useState<EditorState>({ open: false, userId: null });

  const columns = useMemo<GridColumn<User>[]>(
    () => [
      { field: 'loginId', title: '아이디', width: 130, sortable: true },
      { field: 'userName', title: '이름', width: 110, sortable: true },
      { field: 'deptCode', title: '부서', width: 130, format: (row) => dept.labelOf(row.deptCode) },
      { field: 'roleCode', title: '권한', width: 120, format: (row) => role.labelOf(row.roleCode) },
      {
        field: 'status',
        title: '상태',
        width: 90,
        align: 'center',
        render: (row) => <Tag color={STATUS_COLORS[row.status]}>{status.labelOf(row.status)}</Tag>,
      },
      { field: 'email', title: '이메일', minWidth: 200, flex: 1 },
      { field: 'phone', title: '휴대전화', width: 140, format: (row) => formatPhone(row.phone) },
      { field: 'joinedDate', title: '입사일', width: 110, align: 'center', sortable: true },
      {
        field: 'lastLoginAt',
        title: '최근 로그인',
        width: 150,
        align: 'center',
        sortable: true,
        format: (row) => formatDateTime(row.lastLoginAt),
      },
    ],
    [dept, role, status],
  );

  const handleReset = () => {
    searchForm.reset();
    reset();
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      toast.warning(messages.selectRows);
      return;
    }
    const count = selected.length;
    if (!(await confirm(messages.confirmDelete(count), { okText: '삭제', danger: true }))) return;

    deleteUsers.mutate(
      selected.map((user) => user.id),
      {
        onSuccess: () => {
          toast.success(messages.deleted(count));
          // 마지막 페이지의 행을 모두 지웠으면 앞 페이지로 옮깁니다.
          const emptiedPage = count === list.data?.content.length && query.page > 1;
          if (emptiedPage) changePage(query.page - 1, query.size);
        },
      },
    );
  };

  return (
    <PageContainer>
      <SearchForm
        onSearch={searchForm.handleSubmit(search)}
        onReset={handleReset}
        loading={list.isFetching}
      >
        <FormField control={searchForm.control} name="keyword" label="검색어">
          {(field) => <Input {...field} placeholder="이름 또는 아이디" allowClear />}
        </FormField>
        <FormField control={searchForm.control} name="deptCode" label="부서">
          {(field) => <CodeSelect {...field} groupCode="DEPT" placeholder="전체" allowClear />}
        </FormField>
        <FormField control={searchForm.control} name="status" label="상태">
          {(field) => (
            <CodeSelect {...field} groupCode="USER_STATUS" placeholder="전체" allowClear />
          )}
        </FormField>
        <FormField control={searchForm.control} name="joinedRange" label="입사일">
          {(field) => <DateRangeInput {...field} />}
        </FormField>
      </SearchForm>

      <Toolbar summary={`총 ${formatNumber(list.data?.totalElements ?? 0)}건`}>
        {can('EXCEL') && (
          <Button
            icon={<DownloadOutlined />}
            loading={downloadExcel.isPending}
            onClick={() => downloadExcel.mutate(query.condition)}
          >
            엑셀
          </Button>
        )}
        {can('DELETE') && (
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={selected.length === 0}
            loading={deleteUsers.isPending}
            onClick={handleDelete}
          >
            삭제
          </Button>
        )}
        {can('CREATE') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setEditor({ open: true, userId: null })}
          >
            등록
          </Button>
        )}
      </Toolbar>

      <DataGrid
        columns={columns}
        rows={list.data?.content}
        rowKey="id"
        loading={list.isFetching}
        rowNumber
        selection={can('DELETE') ? 'multiple' : 'none'}
        onSelectionChange={setSelected}
        onRowDoubleClick={(user) => setEditor({ open: true, userId: user.id })}
        sort={query.sort}
        onSortChange={changeSort}
        pagination={{
          page: query.page,
          size: query.size,
          total: list.data?.totalElements ?? 0,
          onChange: changePage,
        }}
      />

      <UserFormModal
        open={editor.open}
        userId={editor.userId}
        readOnly={editor.userId !== null && !can('UPDATE')}
        onClose={() => setEditor((prev) => ({ ...prev, open: false }))}
      />
    </PageContainer>
  );
}
