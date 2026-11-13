# 새 화면 추가하기

예시로 "공지사항 관리" 목록 화면(`/board/notices`)을 추가한다고 가정합니다.
가장 빠른 방법은 **사용자 관리 화면을 복사해서 고치는 것**입니다.

| 만들 화면                               | 복사할 파일                                               |
| --------------------------------------- | --------------------------------------------------------- |
| 조회조건 + 그리드 + 등록/수정 팝업      | `pages/system/user/UserListPage.tsx`, `UserFormModal.tsx` |
| 왼쪽 목록을 고르면 오른쪽이 바뀌는 화면 | `pages/system/code/CodeListPage.tsx`                      |

## 순서

### 1. 업무 영역 폴더 만들기 — `src/features/notice/`

| 파일         | 내용                                         | 참고                       |
| ------------ | -------------------------------------------- | -------------------------- |
| `types.ts`   | 서버와 주고받는 데이터의 타입, 조회조건 타입 | `features/user/types.ts`   |
| `api.ts`     | API 호출 함수. `http` 만 사용                | `features/user/api.ts`     |
| `queries.ts` | 조회 키와 조회·저장 훅                       | `features/user/queries.ts` |
| `schema.ts`  | 폼 검증 규칙(Zod), 폼의 처음 값              | `features/user/schema.ts`  |

```ts
// features/notice/queries.ts
export const noticeKeys = {
  all: ['notices'] as const,
  lists: () => [...noticeKeys.all, 'list'] as const,
  list: (query: ListQuery<NoticeSearchCondition>) => [...noticeKeys.lists(), query] as const,
};

export function useNoticeList(query: ListQuery<NoticeSearchCondition>) {
  return useQuery({
    queryKey: noticeKeys.list(query),
    queryFn: ({ signal }) => fetchNotices(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useSaveNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveNotice,
    // 저장 후 떠 있는 목록을 다시 조회합니다.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noticeKeys.lists() }),
  });
}
```

### 2. 화면 만들기 — `src/pages/board/notice/NoticeListPage.tsx`

폴더는 메뉴 구조를 따릅니다. 화면 컴포넌트는 `export default` 로 내보냅니다.

```tsx
export default function NoticeListPage() {
  const { can } = useScreen();
  const { query, search, reset, changePage, changeSort } = useListQuery(DEFAULT_NOTICE_SEARCH);
  const searchForm = useForm<NoticeSearchCondition>({ defaultValues: DEFAULT_NOTICE_SEARCH });
  const list = useNoticeList(query);

  return (
    <PageContainer>
      <SearchForm onSearch={searchForm.handleSubmit(search)} onReset={...} loading={list.isFetching}>
        <FormField control={searchForm.control} name="keyword" label="제목">
          {(field) => <Input {...field} allowClear />}
        </FormField>
      </SearchForm>

      <Toolbar summary={`총 ${formatNumber(list.data?.totalElements ?? 0)}건`}>
        {can('CREATE') && <Button type="primary">등록</Button>}
      </Toolbar>

      <DataGrid
        columns={columns}
        rows={list.data?.content}
        rowKey="id"
        loading={list.isFetching}
        sort={query.sort}
        onSortChange={changeSort}
        pagination={{ page: query.page, size: query.size, total: list.data?.totalElements ?? 0, onChange: changePage }}
      />
    </PageContainer>
  );
}
```

### 3. 화면 등록 — `src/app/router/screens.ts`

```ts
{
  path: '/board/notices',
  title: '공지사항 관리',
  component: lazy(() => import('@/pages/board/notice/NoticeListPage')),
},
```

### 4. 메뉴 등록

서버의 메뉴 데이터에 같은 경로를 등록합니다. 목에서는 `src/mocks/db/menus.ts` 입니다.
메뉴에 없는 화면은 주소로 들어와도 "권한 없음" 으로 나옵니다.

```ts
{ id: 'M210', name: '공지사항 관리', path: '/board/notices', icon: 'file', actions: ALL_ACTIONS },
```

새 아이콘 이름을 쓰려면 `src/app/layout/menuIcons.tsx` 에 추가합니다.

### 5. 목 API 추가 — `src/mocks/handlers/notice.ts`

백엔드가 준비되기 전에는 목 핸들러로 개발합니다. 만든 핸들러는 `handlers/index.ts` 에 추가합니다.
참고: `mocks/handlers/user.ts` (목록·상세·등록·수정·삭제·엑셀이 모두 있습니다).

### 6. 확인

```bash
npm run verify
```

## 규칙

### 조회

- **입력 중에는 조회하지 않습니다.** 조회 버튼이나 Enter 를 눌렀을 때만 조회합니다 (`SearchForm` 이 처리).
- 조회 상태는 `useListQuery` 가 관리합니다. 조회 버튼을 누르면 조건이 같아도 항상 서버를 다시 조회합니다.
- 페이징과 정렬은 **서버가** 합니다. 그리드는 받은 한 페이지를 순서 그대로 보여줍니다.
- 선택하지 않은 조회조건은 빈 문자열(`''`)로 두면 됩니다. 서버로 보낼 때 자동으로 빠집니다.

### 폼

- 화면에서 판단할 수 있는 검증(필수, 길이, 형식)은 Zod 스키마에, 문구는 스키마 안에 직접 씁니다.
- 서버만 알 수 있는 검증(중복 등)은 서버가 `fieldErrors` 로 돌려주고 `applyFieldErrors` 로 같은 입력란에 표시합니다.
- 등록·수정 폼(`EditForm`)은 Enter 로 저장되지 않습니다. 저장 버튼으로만 저장합니다.
- 날짜는 `'YYYY-MM-DD'` 문자열로 다룹니다 (`DateInput`, `DateRangeInput` 이 변환).

### 공통코드

```tsx
const status = useCodes('USER_STATUS');
status.labelOf('ACTIVE'); // '정상' — 그리드, 상세 표시
<CodeSelect groupCode="USER_STATUS" {...field} />; // 선택 상자
```

### 알림과 문구

- 알림은 `shared/ui/feedback` 을 씁니다: `toast.success(...)`, `await confirm(...)`.
- 여러 화면에서 쓰는 문구는 `shared/config/messages.ts` 에 둡니다.
- 조회·저장 **실패** 알림은 공통 처리가 띄웁니다. 화면에서 따로 띄우지 않습니다.

### 권한

- 버튼은 `can('CREATE')` 처럼 감쌉니다. 값은 서버 메뉴의 `actions` 에서 옵니다.
- 화면에서 숨겨도 서버에서 반드시 다시 검사합니다.

### 이름 짓기

| 대상          | 규칙                                   | 예                           |
| ------------- | -------------------------------------- | ---------------------------- |
| 화면 파일     | `<대상><종류>Page.tsx`                 | `NoticeListPage.tsx`         |
| 팝업 파일     | `<대상><종류>Modal.tsx`                | `NoticeFormModal.tsx`        |
| 조회 훅       | `use<대상><List\|...>`                 | `useNoticeList`, `useNotice` |
| 저장·삭제 훅  | `useSave<대상>`, `useDelete<대상>s`    | `useSaveNotice`              |
| API 함수      | `fetch… / create… / update… / delete…` | `fetchNotices`               |
| 화면별 스타일 | 컴포넌트와 같은 이름의 `.module.css`   | `NoticeListPage.module.css`  |
