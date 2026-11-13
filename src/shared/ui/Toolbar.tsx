import type { ReactNode } from 'react';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  /** 왼쪽 영역. 보통 "총 N건" 같은 요약 */
  summary?: ReactNode;
  /** 오른쪽 영역. 등록·삭제·엑셀 같은 버튼 */
  children?: ReactNode;
}

/** 그리드 위에 놓는 버튼 줄 */
export function Toolbar({ summary, children }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.summary}>{summary}</div>
      <div className={styles.actions}>{children}</div>
    </div>
  );
}
