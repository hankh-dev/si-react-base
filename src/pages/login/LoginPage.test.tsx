import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store';
import { MOCK_PASSWORDS } from '@/mocks/db/users';
import { tokenStore } from '@/shared/api/tokenStore';
import LoginPage from './LoginPage';

/*
 * 화면 테스트의 예시
 *
 * 실제 사용자처럼 입력하고 버튼을 누른 뒤, 화면에 보이는 결과를 확인합니다.
 * API 는 개발 때와 같은 목 핸들러(src/mocks/handlers)가 응답합니다.
 */

function renderLoginPage(from?: string) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/', element: <p>홈 화면</p> },
      { path: '/system/users', element: <p>사용자 관리 화면</p> },
    ],
    { initialEntries: [{ pathname: '/login', state: from ? { from } : null }] },
  );
  render(<RouterProvider router={router} />);
}

async function submit(loginId: string, password: string) {
  const user = userEvent.setup();
  if (loginId) await user.type(screen.getByLabelText('아이디'), loginId);
  if (password) await user.type(screen.getByLabelText('비밀번호'), password);
  await user.click(screen.getByRole('button', { name: '로그인' }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    tokenStore.clear();
    useAuthStore.getState().setAnonymous();
  });

  it('아이디와 비밀번호를 입력하지 않으면 입력란 아래에 안내 문구를 보여준다', async () => {
    renderLoginPage();

    await submit('', '');

    expect(await screen.findByText('아이디를 입력해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('비밀번호를 입력해 주세요.')).toBeInTheDocument();
  });

  it('비밀번호가 틀리면 서버가 알려준 문구를 보여준다', async () => {
    renderLoginPage();

    await submit('admin', 'wrong-password');

    expect(
      await screen.findByText('아이디 또는 비밀번호가 올바르지 않습니다.'),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  it('로그인에 성공하면 홈으로 이동한다', async () => {
    renderLoginPage();

    await submit('admin', MOCK_PASSWORDS.admin);

    expect(await screen.findByText('홈 화면')).toBeInTheDocument();
    expect(useAuthStore.getState().user?.loginId).toBe('admin');
    expect(tokenStore.get()).not.toBeNull();
  });

  it('보던 화면이 있었으면 로그인 후 그 화면으로 돌아간다', async () => {
    renderLoginPage('/system/users');

    await submit('admin', MOCK_PASSWORDS.admin);

    expect(await screen.findByText('사용자 관리 화면')).toBeInTheDocument();
  });

  it('세션 만료로 왔으면 만료 안내를 보여준다', () => {
    useAuthStore.getState().setAnonymous({ sessionExpired: true });
    renderLoginPage();

    expect(screen.getByText('세션이 만료되었습니다. 다시 로그인해 주세요.')).toBeInTheDocument();
  });
});
