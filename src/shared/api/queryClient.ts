import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      /** true 이면 실패해도 공통 오류 알림을 띄우지 않습니다 (화면에서 직접 처리하는 경우). */
      silentError?: boolean;
    };
    mutationMeta: {
      silentError?: boolean;
    };
  }
}

/**
 * 서버 상태(조회·저장) 관리용 QueryClient 를 만듭니다.
 *
 * - 조회·저장이 실패하면 onError 로 한 곳에서 알립니다. 화면마다 try/catch 로 알림을 띄우지 않습니다.
 * - 업무 화면 특성에 맞춰 자동 재시도와 창 포커스 시 재조회를 끕니다.
 */
export function createQueryClient(onError: (error: unknown) => void): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!query.meta?.silentError) onError(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!mutation.meta?.silentError) onError(error);
      },
    }),
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}
