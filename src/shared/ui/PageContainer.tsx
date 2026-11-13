import type { ReactNode } from 'react';
import { useScreen } from '@/shared/screen/ScreenContext';
import styles from './PageContainer.module.css';

interface PageContainerProps {
  children: ReactNode;
}

/**
 * 화면의 바깥 틀. 화면 제목과 메뉴 경로를 표시하고, 남은 높이를 내용이 채우게 합니다.
 * 탭으로 열리는 화면(pages)은 모두 이 컴포넌트로 감쌉니다.
 */
export function PageContainer({ children }: PageContainerProps) {
  const { title, breadcrumb } = useScreen();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {breadcrumb.length > 1 && (
          <span className={styles.breadcrumb}>{breadcrumb.join(' › ')}</span>
        )}
      </header>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
