import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Card, Input } from 'antd';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation } from 'react-router';
import { z } from 'zod';
import { signIn } from '@/features/auth/session';
import { useAuthStore } from '@/features/auth/store';
import { ApiError } from '@/shared/api/ApiError';
import { HOME_PATH } from '@/shared/config/constants';
import { messages } from '@/shared/config/messages';
import { runtimeConfig } from '@/shared/config/runtimeConfig';
import { EditForm } from '@/shared/ui/EditForm';
import { FormField } from '@/shared/ui/FormField';
import { PageLoading } from '@/shared/ui/PageLoading';
import styles from './LoginPage.module.css';

const loginSchema = z.object({
  loginId: z.string().min(1, '아이디를 입력해 주세요.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const status = useAuthStore((state) => state.status);
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const location = useLocation();
  const [failure, setFailure] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { loginId: '', password: '' },
  });

  if (status === 'checking') return <PageLoading fullscreen />;

  // 로그인되면(또는 이미 로그인 상태면) 보던 화면이나 홈으로 보냅니다.
  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? HOME_PATH} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      await signIn(values);
    } catch (error) {
      setFailure(error instanceof ApiError ? error.message : messages.error.unknown);
    }
  });

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <h1 className={styles.title}>{runtimeConfig.appTitle}</h1>

        {sessionExpired && !failure && (
          <Alert
            className={styles.notice}
            type="warning"
            showIcon
            title={messages.sessionExpired}
          />
        )}
        {failure && <Alert className={styles.notice} type="error" showIcon title={failure} />}

        <EditForm onSubmit={onSubmit} disabled={isSubmitting} submitOnEnter>
          <FormField control={control} name="loginId" label="아이디">
            {(field) => (
              <Input {...field} prefix={<UserOutlined />} autoComplete="username" autoFocus />
            )}
          </FormField>
          <FormField control={control} name="password" label="비밀번호">
            {(field) => (
              <Input.Password
                {...field}
                prefix={<LockOutlined />}
                autoComplete="current-password"
              />
            )}
          </FormField>
          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            로그인
          </Button>
        </EditForm>

        {import.meta.env.VITE_ENABLE_MOCK === 'true' && (
          <p className={styles.hint}>
            목 API 계정 — 관리자: admin / admin1234, 일반 사용자: user / user1234
          </p>
        )}
      </Card>
    </div>
  );
}
