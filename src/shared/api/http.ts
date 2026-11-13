import axios, { type AxiosRequestConfig } from 'axios';
import { messages } from '@/shared/config/messages';
import { runtimeConfig } from '@/shared/config/runtimeConfig';
import { omitEmpty } from '@/shared/lib/object';
import { ApiError, toApiError } from './ApiError';
import { tokenStore } from './tokenStore';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** true 이면 401 을 받아도 토큰 재발급을 시도하지 않습니다 (로그인 요청처럼 401 이 정상 흐름인 경우). */
    skipAuthRefresh?: boolean;
    /** 내부용: 토큰 재발급 후 다시 보낸 요청 표시 */
    _retried?: boolean;
  }
}

const baseConfig: AxiosRequestConfig = {
  baseURL: runtimeConfig.apiBaseUrl,
  timeout: runtimeConfig.requestTimeoutMs,
  // 리프레시 토큰(httpOnly 쿠키)을 함께 보냅니다.
  withCredentials: true,
  // 배열 파라미터를 ids=1&ids=2 형태로 보냅니다 (Spring MVC 기본 바인딩 형식).
  paramsSerializer: { indexes: null },
};

/**
 * 공통 HTTP 클라이언트. 모든 API 호출은 이 인스턴스를 사용합니다.
 *
 * - 요청: 액세스 토큰을 붙이고, 빈 조회조건을 제거합니다.
 * - 응답: 실패는 항상 ApiError 로 바꿔 던집니다.
 * - 401: 토큰을 한 번 재발급받아 원래 요청을 다시 보냅니다. 재발급도 실패하면 세션 만료로 처리합니다.
 */
export const http = axios.create(baseConfig);

/** 토큰 재발급 전용. 인터셉터가 없어서 재발급 요청이 다시 재발급을 부르지 않습니다. */
const authHttp = axios.create(baseConfig);

let sessionExpiredHandler: (() => void) | null = null;

/** 세션이 만료됐을 때 할 일(로그인 화면 이동 등)을 등록합니다. 앱 시작 시 한 번 호출합니다. */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

let refreshInFlight: Promise<void> | null = null;

/**
 * 리프레시 토큰으로 액세스 토큰을 다시 발급받습니다.
 * 동시에 여러 요청이 401 을 받아도 재발급 요청은 한 번만 나갑니다.
 */
export function refreshAccessToken(): Promise<void> {
  refreshInFlight ??= authHttp
    .post<{ accessToken: string }>('/auth/refresh')
    .then((response) => {
      tokenStore.set(response.data.accessToken);
    })
    .catch(async (error: unknown) => {
      const apiError = await toApiError(error);
      if (apiError.status === 401) tokenStore.clear();
      throw apiError;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  config.params = omitEmpty<unknown>(config.params);
  return config;
});

http.interceptors.response.use(undefined, async (error: unknown) => {
  const apiError = await toApiError(error);
  const config = axios.isAxiosError(error) ? error.config : undefined;

  const shouldRefresh =
    apiError.status === 401 && config && !config.skipAuthRefresh && !config._retried;
  if (!shouldRefresh) throw apiError;

  try {
    // 응답을 기다리는 사이 다른 요청이 이미 토큰을 재발급받았다면, 다시 받지 않고 바로 재시도합니다.
    const sentWith: unknown = config.headers.get('Authorization');
    const current = tokenStore.get();
    const alreadyRefreshed = current !== null && sentWith !== `Bearer ${current}`;
    if (!alreadyRefreshed) await refreshAccessToken();
  } catch (refreshError) {
    // 네트워크 오류처럼 "만료"가 아닌 실패는 세션을 끊지 않고 그대로 알립니다.
    if (refreshError instanceof ApiError && refreshError.status !== 401) throw refreshError;
    sessionExpiredHandler?.();
    throw new ApiError({ status: 401, code: 'SESSION_EXPIRED', message: messages.sessionExpired });
  }

  return http.request({ ...config, _retried: true });
});
