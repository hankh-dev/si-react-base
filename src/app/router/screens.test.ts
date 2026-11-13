import { lazy } from 'react';
import { describe, expect, it } from 'vitest';
import { matchScreen, normalizePath, screens, type ScreenDef } from './screens';

const Empty = lazy(() => Promise.resolve({ default: () => null }));

const registry: ScreenDef[] = [
  { path: '/', title: '홈', component: Empty },
  { path: '/orders', title: '주문 목록', component: Empty },
  { path: '/orders/:orderId', title: '주문 상세', component: Empty },
];

describe('matchScreen', () => {
  it('등록된 경로의 화면을 찾는다', () => {
    expect(matchScreen('/orders', registry)?.screen.title).toBe('주문 목록');
    expect(matchScreen('/', registry)?.screen.title).toBe('홈');
  });

  it('경로 변수의 값을 params 로 돌려준다', () => {
    const match = matchScreen('/orders/1024', registry);

    expect(match?.screen.title).toBe('주문 상세');
    expect(match?.params).toEqual({ orderId: '1024' });
  });

  it('등록되지 않은 경로는 null 이다', () => {
    expect(matchScreen('/orders/1024/items', registry)).toBeNull();
    expect(matchScreen('/unknown', registry)).toBeNull();
  });

  it('실제 등록부의 경로는 서로 겹치지 않는다', () => {
    const paths = screens.map((screen) => screen.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('normalizePath', () => {
  it('끝의 / 를 뗀다', () => {
    expect(normalizePath('/system/users/')).toBe('/system/users');
    expect(normalizePath('/system/users')).toBe('/system/users');
  });

  it('루트는 그대로 / 이다', () => {
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('')).toBe('/');
  });
});
