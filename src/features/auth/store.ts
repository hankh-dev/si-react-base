import { create } from 'zustand';
import type { AuthUser } from './types';

/**
 * checking: 앱을 막 열어서 로그인 여부를 확인하는 중
 * authenticated: 로그인됨
 * anonymous: 로그인 안 됨
 */
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  /** 세션 만료로 로그아웃된 경우 true. 로그인 화면이 안내 문구를 보여줄 때 씁니다. */
  sessionExpired: boolean;

  setAuthenticated: (user: AuthUser) => void;
  setAnonymous: (options?: { sessionExpired?: boolean }) => void;
}

/** 로그인 상태. 액세스 토큰은 여기 두지 않고 shared/api/tokenStore 가 메모리에 보관합니다. */
export const useAuthStore = create<AuthState>()((set) => ({
  status: 'checking',
  user: null,
  sessionExpired: false,

  setAuthenticated: (user) => set({ status: 'authenticated', user, sessionExpired: false }),
  setAnonymous: (options) =>
    set({ status: 'anonymous', user: null, sessionExpired: options?.sessionExpired ?? false }),
}));
