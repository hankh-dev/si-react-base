import { message as staticMessage, Modal as StaticModal, type ModalFuncProps } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import { ApiError } from '@/shared/api/ApiError';
import { messages } from '@/shared/config/messages';

/*
 * 공통 알림 (토스트, 확인창, 오류창)
 *
 * 화면에서는 antd 의 message / Modal 을 직접 부르지 않고 이 함수들을 사용합니다.
 * 컴포넌트 밖(조회·저장 실패 공통 처리 등)에서도 호출할 수 있습니다.
 */

interface ModalApi {
  confirm: (config: ModalFuncProps) => unknown;
  error: (config: ModalFuncProps) => unknown;
}

interface FeedbackApi {
  message: MessageInstance;
  modal: ModalApi;
}

let bound: FeedbackApi | null = null;

/** antd <App> 의 message / modal 을 연결합니다. FeedbackHolder 가 호출합니다. */
export function bindFeedback(api: FeedbackApi | null): void {
  bound = api;
}

// 아직 연결 전이면 antd 의 정적 함수로 대신합니다 (테마가 적용되지 않을 뿐 동작은 같습니다).
const messageApi = (): MessageInstance => bound?.message ?? staticMessage;
const modalApi = (): ModalApi => bound?.modal ?? StaticModal;

/** 잠깐 나타났다 사라지는 안내 */
export const toast = {
  success: (content: string): void => void messageApi().success(content),
  info: (content: string): void => void messageApi().info(content),
  warning: (content: string): void => void messageApi().warning(content),
  error: (content: string): void => void messageApi().error(content),
};

/**
 * 확인창을 띄우고 사용자의 선택을 기다립니다.
 *
 * @example
 * if (!(await confirm(messages.confirmDelete(rows.length), { danger: true }))) return;
 */
export function confirm(
  content: string,
  options?: { title?: string; okText?: string; danger?: boolean },
): Promise<boolean> {
  return new Promise((resolve) => {
    modalApi().confirm({
      title: options?.title ?? '확인',
      content,
      centered: true,
      okText: options?.okText ?? '확인',
      cancelText: '취소',
      okButtonProps: { danger: options?.danger },
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

/** 사용자가 확인을 눌러야 닫히는 오류창 */
export function alertError(content: string, title = '오류'): Promise<void> {
  return new Promise((resolve) => {
    modalApi().error({ title, content, centered: true, okText: '확인', onOk: () => resolve() });
  });
}

let errorModalOpen = false;

/**
 * 조회·저장 실패를 사용자에게 알립니다. (app/queryClient.ts 에서 공통으로 호출)
 *
 * - 4xx: 사용자가 바로 고칠 수 있는 오류 → 토스트
 * - 5xx·네트워크: 확인이 필요한 오류창. 여러 요청이 한꺼번에 실패해도 한 번만 띄웁니다.
 * - 401·취소: 세션 만료 처리나 화면 이동으로 이미 다뤄지므로 알리지 않습니다.
 */
export function notifyError(error: unknown): void {
  const apiError = error instanceof ApiError ? error : null;
  if (apiError && (apiError.status === 401 || apiError.code === 'CANCELED')) return;

  const text = apiError?.message ?? (error instanceof Error ? error.message : '');
  const content = text || messages.error.unknown;

  if (apiError && apiError.status >= 400 && apiError.status < 500) {
    toast.error(content);
    return;
  }

  if (errorModalOpen) return;
  errorModalOpen = true;
  const detail = apiError?.traceId ? `${content} (오류 추적번호: ${apiError.traceId})` : content;
  void alertError(detail).finally(() => {
    errorModalOpen = false;
  });
}
