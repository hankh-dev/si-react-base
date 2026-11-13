import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import type { ReactNode } from 'react';
import styles from './SearchForm.module.css';

interface SearchFormProps {
  /** 조회 버튼 또는 Enter. react-hook-form 의 handleSubmit(...) 결과를 넘깁니다. */
  onSearch: () => void | Promise<void>;
  /** 초기화 버튼 */
  onReset: () => void;
  /** 조회 중 표시 */
  loading?: boolean;
  /** 조회조건 필드 (FormField) */
  children: ReactNode;
}

/**
 * 목록 화면의 조회조건 영역.
 * 필드는 화면 너비에 맞춰 자동으로 줄바꿈되고, 오른쪽에 초기화·조회 버튼이 놓입니다.
 * 입력 중에는 조회하지 않고, 조회 버튼이나 Enter 를 눌렀을 때만 조회합니다.
 */
export function SearchForm({ onSearch, onReset, loading = false, children }: SearchFormProps) {
  return (
    <Form
      className={styles.root}
      layout="horizontal"
      labelCol={{ flex: '76px' }}
      colon={false}
      onFinish={() => void onSearch()}
    >
      <div className={styles.fields}>{children}</div>
      <div className={styles.actions}>
        <Button icon={<ReloadOutlined />} onClick={onReset}>
          초기화
        </Button>
        <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
          조회
        </Button>
      </div>
    </Form>
  );
}
