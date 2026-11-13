import { Button, Result } from 'antd';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** 배포 직후, 이전 버전 화면에서 새 화면 파일을 불러오지 못한 경우인지 판별합니다. */
function isChunkLoadError(error: Error): boolean {
  return /dynamically imported module|Importing a module script failed/i.test(error.message);
}

/**
 * 화면을 그리다 발생한 오류를 잡아 안내 화면으로 바꿉니다.
 * 탭마다 하나씩 감싸므로, 한 화면의 오류가 다른 탭이나 전체 레이아웃을 멈추지 않습니다.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('화면 렌더링 오류', error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (isChunkLoadError(error)) {
      return (
        <Result
          status="info"
          title="새 버전이 배포되었습니다."
          subTitle="화면을 새로고침한 뒤 다시 시도해 주세요."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              새로고침
            </Button>
          }
        />
      );
    }

    return (
      <Result
        status="error"
        title="화면을 표시하는 중 오류가 발생했습니다."
        subTitle={error.message}
        extra={<Button onClick={this.handleRetry}>다시 시도</Button>}
      />
    );
  }
}
