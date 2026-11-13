import { signOut } from '@/features/auth/session';
import { useAuthStore } from '@/features/auth/store';
import { setSessionExpiredHandler } from '@/shared/api/http';
import { useTabStore } from '@/shared/screen/tabStore';
import { queryClient } from './queryClient';

/*
 * 로그인 상태가 끝날 때의 뒷정리
 *
 * 로그인 화면으로 보내는 일은 RequireAuth 가 합니다 (로그인 상태가 anonymous 로 바뀌면 이동).
 * 여기서는 이전 사용자의 흔적(열린 탭, 조회 결과)이 다음 로그인에 남지 않도록 비웁니다.
 */
async function endSession(options?: { sessionExpired?: boolean }): Promise<void> {
  await signOut(options);
  useTabStore.getState().reset();
  queryClient.clear();
}

/** 사용자가 직접 로그아웃 */
export function logout(): Promise<void> {
  return endSession();
}

/** 세션 만료 처리 연결. 앱을 시작할 때 한 번 호출합니다. */
export function installSessionExpiredHandler(): void {
  setSessionExpiredHandler(() => {
    // 여러 요청이 동시에 만료를 알려도 한 번만 처리합니다.
    if (useAuthStore.getState().status !== 'authenticated') return;
    void endSession({ sessionExpired: true });
  });
}
