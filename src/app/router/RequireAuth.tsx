import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/features/auth/store';
import { LOGIN_PATH } from '@/shared/config/constants';
import { PageLoading } from '@/shared/ui/PageLoading';

/**
 * 로그인한 사용자만 통과시킵니다.
 * 로그인하지 않았거나 세션이 끝나면 로그인 화면으로 보내고, 보던 주소를 함께 넘겨
 * 로그인 후 그 화면으로 돌아올 수 있게 합니다.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === 'checking') return <PageLoading fullscreen />;

  if (status === 'anonymous') {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location.pathname }} />;
  }

  return children;
}
