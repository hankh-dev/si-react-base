import { App } from 'antd';
import { useEffect } from 'react';
import { bindFeedback } from './feedback';

/**
 * antd <App> 이 제공하는 message / modal 을 공통 알림 함수(feedback.ts)에 연결합니다.
 * <App> 바로 아래 첫 번째 자식으로 한 번만 둡니다.
 */
export function FeedbackHolder() {
  const { message, modal } = App.useApp();

  useEffect(() => {
    bindFeedback({ message, modal });
    return () => bindFeedback(null);
  }, [message, modal]);

  return null;
}
