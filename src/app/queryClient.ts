import { createQueryClient } from '@/shared/api/queryClient';
import { notifyError } from '@/shared/ui/feedback';

/** 앱 전체가 함께 쓰는 QueryClient. 조회·저장 실패는 공통 알림(notifyError)으로 표시합니다. */
export const queryClient = createQueryClient(notifyError);
