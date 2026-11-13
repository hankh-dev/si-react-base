import { Button, Result } from 'antd';
import { HOME_PATH } from '@/shared/config/constants';
import { useOpenScreen } from '@/shared/screen/useOpenScreen';

/** 등록되지 않은 주소로 들어왔을 때 */
export default function NotFoundPage() {
  const openScreen = useOpenScreen();

  return (
    <Result
      status="404"
      title="화면을 찾을 수 없습니다."
      subTitle="주소가 바뀌었거나 삭제된 화면입니다."
      extra={
        <Button type="primary" onClick={() => openScreen(HOME_PATH)}>
          홈으로
        </Button>
      }
    />
  );
}
