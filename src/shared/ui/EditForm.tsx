import { Form } from 'antd';
import type { KeyboardEvent, ReactNode } from 'react';

interface EditFormProps {
  /** 저장 버튼. react-hook-form 의 handleSubmit(...) 결과를 넘깁니다. */
  onSubmit: () => void | Promise<void>;
  /** 저장 중처럼 입력을 막아야 할 때 true */
  disabled?: boolean;
  /**
   * 입력란에서 Enter 를 눌렀을 때도 제출할지 여부. 기본은 false 입니다.
   * 등록·수정 폼은 입력 도중 Enter 로 실수로 저장되지 않도록 버튼으로만 제출하고,
   * 로그인처럼 Enter 제출이 자연스러운 폼에서만 true 로 켭니다.
   */
  submitOnEnter?: boolean;
  /** 입력 필드(FormField)와 버튼 */
  children: ReactNode;
}

function blockEnterSubmit(event: KeyboardEvent<HTMLFormElement>) {
  // 한 줄 입력란의 Enter 만 막습니다. 여러 줄 입력(textarea)의 줄바꿈과 버튼의 Enter 는 그대로 둡니다.
  if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
    event.preventDefault();
  }
}

/**
 * 등록·수정 화면의 입력 폼 틀. 라벨이 입력란 위에 놓입니다.
 * 값과 검증은 react-hook-form 이 관리하고, 이 컴포넌트는 배치와 제출 이벤트만 담당합니다.
 */
export function EditForm({
  onSubmit,
  disabled = false,
  submitOnEnter = false,
  children,
}: EditFormProps) {
  return (
    <Form
      layout="vertical"
      disabled={disabled}
      onKeyDown={submitOnEnter ? undefined : blockEnterSubmit}
      onFinish={() => void onSubmit()}
    >
      {children}
    </Form>
  );
}
