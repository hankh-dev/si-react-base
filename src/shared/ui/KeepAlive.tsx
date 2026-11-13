import type { ReactNode } from 'react';

interface KeepAliveProps {
  /** false 이면 화면에서 숨기되 상태는 그대로 유지합니다. */
  active: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * 보이지 않는 동안에도 자식을 그대로 살려 둡니다. (탭 전환 시 조회조건·그리드 상태 보존)
 *
 * 자식을 언마운트하지 않고 CSS 로만 숨깁니다. 그래서 숨겨진 화면의 그리드 스크롤·선택,
 * 입력 중인 값, 조회 결과가 모두 그대로 남고, 돌아왔을 때 다시 조회하지도 않습니다.
 *
 * React 의 <Activity> 를 쓰지 않는 이유: <Activity> 는 숨길 때 effect 와 ref 를 정리하는데,
 * AG Grid(36.3) 는 이때 그리드를 파괴합니다. 돌아오면 스크롤·선택이 사라지고 그리드가 빈 채로
 * 다시 만들어지는 것을 브라우저에서 확인했습니다. 그리드 제품을 바꾸거나 버전을 올린 뒤
 * 다시 검토할 수 있도록, 숨기는 방식은 이 컴포넌트 한 곳에만 둡니다.
 *
 * 숨겨진 화면도 계속 살아 있으므로 탭 수에는 상한을 둡니다. (shared/config/constants.ts 의 MAX_TABS)
 */
export function KeepAlive({ active, className, children }: KeepAliveProps) {
  return (
    <div className={className} style={active ? undefined : { display: 'none' }}>
      {children}
    </div>
  );
}
