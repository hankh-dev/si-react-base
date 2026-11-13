import { http } from '@/shared/api/http';
import type { AuthUser, LoginRequest, LoginResponse } from './types';

/** 로그인. 아이디·비밀번호가 틀리면 401 이 정상 응답이므로 토큰 재발급을 시도하지 않습니다. */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/auth/login', request, {
    skipAuthRefresh: true,
  });
  return data;
}

export async function logout(): Promise<void> {
  await http.post('/auth/logout', undefined, { skipAuthRefresh: true });
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await http.get<AuthUser>('/auth/me');
  return data;
}
