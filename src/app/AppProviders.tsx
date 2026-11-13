import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import type { ReactNode } from 'react';
import { antdTheme } from '@/shared/config/theme';
import { FeedbackHolder } from '@/shared/ui/FeedbackHolder';
import { queryClient } from './queryClient';

// 달력의 요일·월 이름을 한국어로 표시합니다.
dayjs.locale('ko');

/**
 * 앱 전체에 필요한 공급자를 한 곳에 모읍니다.
 * - ConfigProvider: Ant Design 한국어 문구와 테마
 * - AntApp + FeedbackHolder: 공통 알림(toast, confirm)을 어디서든 쓸 수 있게 연결
 * - QueryClientProvider: 서버 상태(조회·저장) 관리
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider locale={koKR} theme={antdTheme}>
      <AntApp>
        <FeedbackHolder />
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
}
