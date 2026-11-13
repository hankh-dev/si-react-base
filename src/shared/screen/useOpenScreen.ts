import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { MAX_TABS } from '@/shared/config/constants';
import { messages } from '@/shared/config/messages';
import { toast } from '@/shared/ui/feedback';
import { useTabStore } from './tabStore';

/**
 * 화면을 탭으로 엽니다. 메뉴 클릭, 화면 안의 바로가기 버튼 등에서 사용합니다.
 * 이미 열린 화면이면 그 탭으로 이동하고, 탭 개수 제한을 넘으면 안내만 띄웁니다.
 */
export function useOpenScreen(): (path: string) => void {
  const navigate = useNavigate();

  return useCallback(
    (path: string) => {
      const { paths } = useTabStore.getState();
      if (!paths.includes(path) && paths.length >= MAX_TABS) {
        toast.warning(messages.maxTabs(MAX_TABS));
        return;
      }
      // 탭 목록에 추가하는 일은 라우터 구독(app/router/syncTabs.ts)이 맡습니다.
      void navigate(path);
    },
    [navigate],
  );
}
