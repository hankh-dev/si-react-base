import dayjs from 'dayjs';
import { http, HttpResponse, type PathParams } from 'msw';
import writeExcelFile from 'write-excel-file/universal';
import type { User, UserSaveRequest } from '@/features/user/types';
import type { FieldError } from '@/shared/api/ApiError';
import type { PageResponse } from '@/shared/api/types';
import { codeDb } from '../db/codes';
import { userDb, type UserFilter } from '../db/users';
import {
  api,
  authenticate,
  errorResponse,
  forbidden,
  networkDelay,
  notFound,
  unauthorized,
} from '../lib/respond';

function readFilter(url: URL): UserFilter {
  const get = (name: string) => url.searchParams.get(name) ?? undefined;
  return {
    keyword: get('keyword'),
    deptCode: get('deptCode'),
    status: get('status'),
    joinedFrom: get('joinedFrom'),
    joinedTo: get('joinedTo'),
  };
}

/** 서버 쪽 검증. 화면이 미리 걸러주더라도 서버는 항상 다시 검증합니다. */
function validate(body: UserSaveRequest, currentId: number | null): FieldError[] {
  const errors: FieldError[] = [];

  if (!body.userName.trim()) {
    errors.push({ field: 'userName', message: '이름을 입력해 주세요.' });
  }
  if (!codeDb.items('DEPT')?.some((item) => item.code === body.deptCode)) {
    errors.push({ field: 'deptCode', message: '부서를 선택해 주세요.' });
  }
  // 아래 두 가지는 서버만 판단할 수 있는 검증입니다.
  if (currentId === null && userDb.findByLoginId(body.loginId)) {
    errors.push({ field: 'loginId', message: '이미 사용 중인 아이디입니다.' });
  }
  if (userDb.all().some((user) => user.email === body.email && user.id !== currentId)) {
    errors.push({ field: 'email', message: '이미 등록된 이메일입니다.' });
  }

  return errors;
}

const validationFailed = (fieldErrors: FieldError[]) =>
  errorResponse(400, 'VALIDATION_FAILED', '입력 내용을 확인해 주세요.', fieldErrors);

const EXCEL_COLUMNS: { title: string; width: number; value: (user: User) => string }[] = [
  { title: '아이디', width: 14, value: (user) => user.loginId },
  { title: '이름', width: 12, value: (user) => user.userName },
  { title: '부서', width: 14, value: (user) => codeDb.name('DEPT', user.deptCode) },
  { title: '권한', width: 14, value: (user) => codeDb.name('ROLE', user.roleCode) },
  { title: '상태', width: 10, value: (user) => codeDb.name('USER_STATUS', user.status) },
  { title: '이메일', width: 28, value: (user) => user.email },
  { title: '휴대전화', width: 16, value: (user) => user.phone },
  { title: '입사일', width: 12, value: (user) => user.joinedDate },
  { title: '최근 로그인', width: 20, value: (user) => user.lastLoginAt?.replace('T', ' ') ?? '' },
];

export const userHandlers = [
  // '/users/:id' 보다 먼저 등록해야 'excel' 이 id 로 해석되지 않습니다.
  http.get(api('/users/excel'), async ({ request }) => {
    await networkDelay();
    const me = authenticate(request);
    if (!me) return unauthorized();
    if (me.roleCode !== 'ADMIN') return forbidden();

    const users = userDb.search(readFilter(new URL(request.url)));
    const header = EXCEL_COLUMNS.map((column) => ({
      value: column.title,
      fontWeight: 'bold' as const,
    }));
    const rows = users.map((user) => EXCEL_COLUMNS.map((column) => column.value(user)));
    const blob = await writeExcelFile([header, ...rows], {
      sheet: '사용자',
      columns: EXCEL_COLUMNS.map((column) => ({ width: column.width })),
    }).toBlob();

    // 한글 파일명은 filename* (RFC 5987) 로 내려줍니다.
    const filename = `사용자목록_${dayjs().format('YYYYMMDD')}.xlsx`;
    return new HttpResponse(blob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="users.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  }),

  http.get(api('/users'), async ({ request }) => {
    await networkDelay();
    if (!authenticate(request)) return unauthorized();

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const size = Math.max(1, Number(url.searchParams.get('size') ?? 20));
    const found = userDb.search(readFilter(url), url.searchParams.get('sort'));

    const body: PageResponse<User> = {
      content: found.slice((page - 1) * size, page * size),
      page,
      size,
      totalElements: found.length,
    };
    return HttpResponse.json(body);
  }),

  http.get<{ id: string }>(api('/users/:id'), async ({ request, params }) => {
    await networkDelay();
    if (!authenticate(request)) return unauthorized();

    const user = userDb.find(Number(params.id));
    return user ? HttpResponse.json(user) : notFound();
  }),

  http.post<PathParams, UserSaveRequest>(api('/users'), async ({ request }) => {
    await networkDelay();
    const me = authenticate(request);
    if (!me) return unauthorized();
    if (me.roleCode !== 'ADMIN') return forbidden();

    const body = await request.json();
    const fieldErrors = validate(body, null);
    if (fieldErrors.length > 0) return validationFailed(fieldErrors);

    return HttpResponse.json(userDb.create(body), { status: 201 });
  }),

  http.put<{ id: string }, UserSaveRequest>(api('/users/:id'), async ({ request, params }) => {
    await networkDelay();
    const me = authenticate(request);
    if (!me) return unauthorized();
    if (me.roleCode !== 'ADMIN') return forbidden();

    const id = Number(params.id);
    const body = await request.json();
    const fieldErrors = validate(body, id);
    if (fieldErrors.length > 0) return validationFailed(fieldErrors);

    const updated = userDb.update(id, body);
    return updated ? HttpResponse.json(updated) : notFound();
  }),

  http.delete(api('/users'), async ({ request }) => {
    await networkDelay();
    const me = authenticate(request);
    if (!me) return unauthorized();
    if (me.roleCode !== 'ADMIN') return forbidden();

    const ids = new URL(request.url).searchParams.getAll('ids').map(Number);
    if (ids.includes(me.id)) {
      return errorResponse(409, 'CANNOT_DELETE_SELF', '로그인한 본인 계정은 삭제할 수 없습니다.');
    }

    userDb.remove(ids);
    return new HttpResponse(null, { status: 204 });
  }),
];
