import { Modal as AntModal, type ModalProps } from 'antd';
import { useScreenActive } from '@/shared/screen/ScreenContext';

/**
 * 공통 모달(팝업).
 *
 * - 바깥 영역을 눌러도 닫히지 않습니다 (입력 중 실수로 닫히는 것을 막기 위해).
 * - 닫으면 내용을 버리므로, 다시 열 때 항상 처음 상태에서 시작합니다.
 * - 모달을 연 화면의 탭이 숨겨지면 함께 숨고, 탭으로 돌아오면 입력하던 내용 그대로 다시 나타납니다.
 */
export function Modal({ open, destroyOnHidden = true, ...rest }: ModalProps) {
  const active = useScreenActive();

  return (
    <AntModal
      mask={{ closable: false }}
      {...rest}
      open={open && active}
      // 탭이 숨겨져서 닫힌 경우에는 내용을 버리지 않습니다.
      destroyOnHidden={active ? destroyOnHidden : false}
    />
  );
}
