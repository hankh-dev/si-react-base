import { http as route, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/mocks/lib/respond';
import { messages } from '@/shared/config/messages';
import { server } from '@/test/server';
import { ApiError } from './ApiError';
import { http, setSessionExpiredHandler } from './http';
import { tokenStore } from './tokenStore';

/** 실패한 요청의 오류를 값으로 받습니다. */
const failure = (request: Promise<unknown>): Promise<unknown> =>
  request.then(
    () => {
      throw new Error('요청이 실패해야 하는데 성공했습니다.');
    },
    (error: unknown) => error,
  );

describe('http 클라이언트', () => {
  beforeEach(() => {
    tokenStore.clear();
    setSessionExpiredHandler(null);
  });

  describe('요청', () => {
    it('액세스 토큰을 Authorization 헤더로 보낸다', async () => {
      tokenStore.set('token-1');
      let authorization: string | null = null;
      server.use(
        route.get(api('/echo'), ({ request }) => {
          authorization = request.headers.get('Authorization');
          return HttpResponse.json({});
        }),
      );

      await http.get('/echo');

      expect(authorization).toBe('Bearer token-1');
    });

    it('빈 조회조건은 빼고, 배열은 같은 이름을 반복해서 보낸다', async () => {
      let search = '';
      server.use(
        route.get(api('/echo'), ({ request }) => {
          search = new URL(request.url).search;
          return HttpResponse.json({});
        }),
      );

      await http.get('/echo', {
        params: { keyword: '', status: null, deptCode: undefined, page: 1, ids: [1, 2] },
      });

      expect(search).toBe('?page=1&ids=1&ids=2');
    });
  });

  describe('오류 변환', () => {
    it('서버의 오류 본문을 ApiError 로 바꾼다', async () => {
      server.use(
        route.post(api('/echo'), () =>
          HttpResponse.json(
            {
              code: 'VALIDATION_FAILED',
              message: '입력 내용을 확인해 주세요.',
              fieldErrors: [{ field: 'loginId', message: '이미 사용 중인 아이디입니다.' }],
              traceId: 'trace-1',
            },
            { status: 400 },
          ),
        ),
      );

      const error = await failure(http.post('/echo'));

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        status: 400,
        code: 'VALIDATION_FAILED',
        message: '입력 내용을 확인해 주세요.',
        fieldErrors: [{ field: 'loginId', message: '이미 사용 중인 아이디입니다.' }],
        traceId: 'trace-1',
      });
    });

    it('오류 본문이 없으면 상태 코드에 맞는 기본 문구를 쓴다', async () => {
      server.use(route.get(api('/echo'), () => new HttpResponse(null, { status: 500 })));

      const error = await failure(http.get('/echo'));

      expect(error).toMatchObject({
        status: 500,
        code: 'HTTP_500',
        message: messages.error.server,
        fieldErrors: [],
      });
    });

    it('파일 다운로드 요청(blob)이 실패해도 오류 본문을 읽는다', async () => {
      server.use(
        route.get(api('/echo'), () =>
          HttpResponse.json({ code: 'FORBIDDEN', message: '권한이 없습니다.' }, { status: 403 }),
        ),
      );

      const error = await failure(http.get('/echo', { responseType: 'blob' }));

      expect(error).toMatchObject({ status: 403, code: 'FORBIDDEN', message: '권한이 없습니다.' });
    });

    it('서버에 연결할 수 없으면 NETWORK 오류가 된다', async () => {
      server.use(route.get(api('/echo'), () => HttpResponse.error()));

      const error = await failure(http.get('/echo'));

      expect(error).toMatchObject({ status: 0, code: 'NETWORK', message: messages.error.network });
    });
  });

  describe('401 처리', () => {
    /** 새 토큰으로 온 요청만 성공시키는 API */
    const protectedApi = route.get(api('/echo'), ({ request }) =>
      request.headers.get('Authorization') === 'Bearer new-token'
        ? HttpResponse.json({ ok: true })
        : HttpResponse.json({ code: 'AUTH_TOKEN_EXPIRED' }, { status: 401 }),
    );

    it('토큰을 재발급받아 원래 요청을 다시 보낸다. 동시에 여러 요청이 실패해도 재발급은 한 번이다', async () => {
      tokenStore.set('old-token');
      let refreshCount = 0;
      server.use(
        protectedApi,
        route.post(api('/auth/refresh'), () => {
          refreshCount += 1;
          return HttpResponse.json({ accessToken: 'new-token' });
        }),
      );

      const responses = await Promise.all([
        http.get<{ ok: boolean }>('/echo'),
        http.get<{ ok: boolean }>('/echo'),
        http.get<{ ok: boolean }>('/echo'),
      ]);

      expect(responses.map((response) => response.data)).toEqual([
        { ok: true },
        { ok: true },
        { ok: true },
      ]);
      expect(refreshCount).toBe(1);
      expect(tokenStore.get()).toBe('new-token');
    });

    it('재발급도 401 이면 세션 만료를 알리고 SESSION_EXPIRED 오류를 던진다', async () => {
      tokenStore.set('old-token');
      const onSessionExpired = vi.fn();
      setSessionExpiredHandler(onSessionExpired);
      server.use(
        protectedApi,
        route.post(api('/auth/refresh'), () =>
          HttpResponse.json({ code: 'AUTH_SESSION_EXPIRED' }, { status: 401 }),
        ),
      );

      const error = await failure(http.get('/echo'));

      expect(error).toMatchObject({ status: 401, code: 'SESSION_EXPIRED' });
      expect(onSessionExpired).toHaveBeenCalledTimes(1);
      expect(tokenStore.get()).toBeNull();
    });

    it('재발급 요청이 네트워크 오류로 실패하면 세션을 끊지 않는다', async () => {
      tokenStore.set('old-token');
      const onSessionExpired = vi.fn();
      setSessionExpiredHandler(onSessionExpired);
      server.use(
        protectedApi,
        route.post(api('/auth/refresh'), () => HttpResponse.error()),
      );

      const error = await failure(http.get('/echo'));

      expect(error).toMatchObject({ status: 0, code: 'NETWORK' });
      expect(onSessionExpired).not.toHaveBeenCalled();
      expect(tokenStore.get()).toBe('old-token');
    });

    it('skipAuthRefresh 요청은 401 을 받아도 재발급하지 않는다 (로그인 실패 등)', async () => {
      let refreshCount = 0;
      server.use(
        protectedApi,
        route.post(api('/auth/refresh'), () => {
          refreshCount += 1;
          return HttpResponse.json({ accessToken: 'new-token' });
        }),
      );

      const error = await failure(http.get('/echo', { skipAuthRefresh: true }));

      expect(error).toMatchObject({ status: 401, code: 'AUTH_TOKEN_EXPIRED' });
      expect(refreshCount).toBe(0);
    });
  });
});
