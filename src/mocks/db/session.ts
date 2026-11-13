/*
 * 목 서버의 로그인 세션
 *
 * 실제 서버에서는 리프레시 토큰이 httpOnly 쿠키로 오가고 화면 코드는 그 값을 볼 수 없습니다.
 * 목에서는 쿠키 대신 "서버가 기억하는 세션" 을 브라우저 저장소에 흉내 냅니다.
 * 이 저장소는 목 전용이고, 화면 코드(src/mocks 밖)는 읽지 않습니다.
 */

const STORAGE_KEY = 'mock:session';

/** 액세스 토큰 유효 시간 */
const ACCESS_TOKEN_TTL_MS = 10 * 60 * 1000;
/** 세션(리프레시 토큰) 유효 시간 */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

interface MockSession {
  userId: number;
  expiresAt: number;
}

/**
 * 액세스 토큰 세대. 값을 올리면 그 전에 발급한 토큰이 모두 무효가 됩니다.
 * (토큰 만료 상황을 바로 재현하기 위한 장치)
 */
let tokenGeneration = 0;

function isMockSession(value: unknown): value is MockSession {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.userId === 'number' && typeof record.expiresAt === 'number';
}

export const mockSession = {
  start(userId: number): void {
    const session: MockSession = { userId, expiresAt: Date.now() + SESSION_TTL_MS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  /** 살아 있는 세션의 사용자 id. 없거나 만료됐으면 null */
  userId(): number | null {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (!isMockSession(parsed) || parsed.expiresAt <= Date.now()) return null;
      return parsed.userId;
    } catch {
      return null;
    }
  },

  end(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export function issueAccessToken(userId: number): string {
  return `mock.${userId}.${tokenGeneration}.${Date.now() + ACCESS_TOKEN_TTL_MS}`;
}

/** Authorization 헤더를 검사해서 사용자 id 를 돌려줍니다. 토큰이 없거나 무효면 null */
export function verifyAccessToken(authorization: string | null): number | null {
  const match = /^Bearer mock\.(\d+)\.(\d+)\.(\d+)$/.exec(authorization ?? '');
  if (!match) return null;
  const [, userId, generation, expiresAt] = match;
  if (Number(generation) !== tokenGeneration || Number(expiresAt) <= Date.now()) return null;
  return Number(userId);
}

/** 만료 상황 재현용. 브라우저 콘솔에서 window.__mock 으로 호출합니다. (mocks/browser.ts) */
export const mockControls = {
  /** 액세스 토큰만 만료시킵니다. 다음 요청에서 토큰이 자동으로 재발급됩니다. */
  expireAccessToken(): void {
    tokenGeneration += 1;
  },
  /** 세션까지 만료시킵니다. 다음 요청에서 세션 만료 처리(로그인 화면 이동)가 일어납니다. */
  expireSession(): void {
    tokenGeneration += 1;
    mockSession.end();
  },
};
