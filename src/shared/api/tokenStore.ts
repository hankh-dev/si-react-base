/*
 * 액세스 토큰 보관소
 *
 * 토큰은 메모리(모듈 변수)에만 둡니다. localStorage / sessionStorage 에 저장하지 않으므로
 * 스크립트 삽입 공격으로 저장소를 읽어도 토큰이 나오지 않습니다.
 * 새로고침으로 메모리가 비면 httpOnly 쿠키의 리프레시 토큰으로 다시 발급받습니다. (http.ts 참고)
 */
let accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => accessToken,
  set: (token: string): void => {
    accessToken = token;
  },
  clear: (): void => {
    accessToken = null;
  },
};
