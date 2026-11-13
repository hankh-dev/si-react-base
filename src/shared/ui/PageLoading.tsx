import { Spin } from 'antd';

interface PageLoadingProps {
  /** true 이면 브라우저 창 전체를 덮습니다 (앱 시작 시). 기본은 부모 영역 가운데. */
  fullscreen?: boolean;
}

/** 화면을 불러오는 동안 보여주는 로딩 표시 */
export function PageLoading({ fullscreen = false }: PageLoadingProps) {
  if (fullscreen) return <Spin fullscreen size="large" />;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 200,
      }}
    >
      <Spin size="large" />
    </div>
  );
}
