import { Button, Result } from 'antd';
import { HOME_PATH } from '@/shared/config/constants';
import { useOpenScreen } from '@/shared/screen/useOpenScreen';

/** 메뉴 권한이 없는 화면의 주소로 직접 들어왔을 때 */
export default function ForbiddenPage() {
  const openScreen = useOpenScreen();

  return (
    <Result
      status="403"
      title="이 화면을 볼 권한이 없습니다."
      subTitle="필요한 화면이라면 관리자에게 권한을 요청해 주세요."
      extra={
        <Button type="primary" onClick={() => openScreen(HOME_PATH)}>
          홈으로
        </Button>
      }
    />
  );
}
