import dayjs from 'dayjs';
import { http, HttpResponse, type PathParams } from 'msw';
import type { AuthUser, LoginRequest, LoginResponse } from '@/features/auth/types';
import type { User } from '@/features/user/types';
import { codeDb } from '../db/codes';
import { issueAccessToken, mockSession } from '../db/session';
import { MOCK_PASSWORDS, userDb } from '../db/users';
import { api, authenticate, errorResponse, networkDelay, unauthorized } from '../lib/respond';

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    loginId: user.loginId,
    userName: user.userName,
    deptName: codeDb.name('DEPT', user.deptCode),
    roleCode: user.roleCode,
    roleName: codeDb.name('ROLE', user.roleCode),
  };
}

export const authHandlers = [
  http.post<PathParams, LoginRequest>(api('/auth/login'), async ({ request }) => {
    await networkDelay();
    const { loginId, password } = await request.json();

    const user = userDb.findByLoginId(loginId);
    if (!user || MOCK_PASSWORDS[loginId] !== password) {
      return errorResponse(
        401,
        'AUTH_INVALID_CREDENTIALS',
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }
    if (user.status !== 'ACTIVE') {
      return errorResponse(
        403,
        'AUTH_ACCOUNT_DISABLED',
        '사용할 수 없는 계정입니다. 관리자에게 문의해 주세요.',
      );
    }

    // 실제 서버라면 여기서 리프레시 토큰을 httpOnly 쿠키로 내려줍니다.
    mockSession.start(user.id);
    userDb.touchLastLogin(user.id, dayjs().format('YYYY-MM-DDTHH:mm:ss'));

    const body: LoginResponse = {
      accessToken: issueAccessToken(user.id),
      user: toAuthUser(user),
    };
    return HttpResponse.json(body);
  }),

  http.post(api('/auth/refresh'), async () => {
    await networkDelay();
    const userId = mockSession.userId();
    const user = userId === null ? undefined : userDb.find(userId);
    if (!user) {
      return errorResponse(401, 'AUTH_SESSION_EXPIRED', '세션이 만료되었습니다.');
    }
    return HttpResponse.json({ accessToken: issueAccessToken(user.id) });
  }),

  http.post(api('/auth/logout'), () => {
    mockSession.end();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(api('/auth/me'), async ({ request }) => {
    await networkDelay();
    const user = authenticate(request);
    if (!user) return unauthorized();
    return HttpResponse.json(toAuthUser(user));
  }),
];
