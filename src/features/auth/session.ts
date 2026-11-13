import { refreshAccessToken } from '@/shared/api/http';
import { tokenStore } from '@/shared/api/tokenStore';
import { fetchMe, login, logout } from './api';
import { useAuthStore } from './store';
import type { LoginRequest } from './types';

/**
 * 앱을 열 때 한 번 호출합니다.
 * 리프레시 토큰(httpOnly 쿠키)이 살아 있으면 액세스 토큰을 다시 받아 로그인 상태를 복원합니다.
 */
export async function restoreSession(): Promise<void> {
  try {
    await refreshAccessToken();
    useAuthStore.getState().setAuthenticated(await fetchMe());
  } catch {
    useAuthStore.getState().setAnonymous();
  }
}

/** 로그인. 실패하면 ApiError 를 던집니다. */
export async function signIn(request: LoginRequest): Promise<void> {
  const { accessToken, user } = await login(request);
  tokenStore.set(accessToken);
  useAuthStore.getState().setAuthenticated(user);
}

/**
 * 로그인 상태를 끝냅니다.
 * 직접 로그아웃한 경우에는 서버에도 알리고, 세션 만료인 경우에는 화면 상태만 정리합니다.
 */
export async function signOut(options?: { sessionExpired?: boolean }): Promise<void> {
  if (!options?.sessionExpired) {
    try {
      await logout();
    } catch {
      // 서버 로그아웃이 실패해도 화면에서는 로그아웃 처리합니다.
    }
  }
  tokenStore.clear();
  useAuthStore.getState().setAnonymous({ sessionExpired: options?.sessionExpired });
}
