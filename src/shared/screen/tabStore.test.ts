import { beforeEach, describe, expect, it } from 'vitest';
import { nextPathAfterClose, useTabStore } from './tabStore';

const tabs = () => useTabStore.getState();

describe('tabStore', () => {
  beforeEach(() => {
    tabs().reset();
  });

  it('처음에는 홈 탭만 열려 있다', () => {
    expect(tabs().paths).toEqual(['/']);
  });

  it('탭을 열면 끝에 추가되고, 이미 열린 탭은 다시 추가되지 않는다', () => {
    tabs().open('/system/users');
    tabs().open('/system/codes');
    tabs().open('/system/users');

    expect(tabs().paths).toEqual(['/', '/system/users', '/system/codes']);
  });

  it('홈 탭은 닫을 수 없다', () => {
    tabs().open('/system/users');
    tabs().close('/');

    expect(tabs().paths).toEqual(['/', '/system/users']);
  });

  it('다른 탭 닫기는 홈과 지정한 탭만 남긴다', () => {
    tabs().open('/a');
    tabs().open('/b');
    tabs().open('/c');
    tabs().closeOthers('/b');

    expect(tabs().paths).toEqual(['/', '/b']);
  });

  it('전체 닫기는 홈만 남긴다', () => {
    tabs().open('/a');
    tabs().open('/b');
    tabs().closeAll();

    expect(tabs().paths).toEqual(['/']);
  });

  it('새로고침하면 그 탭의 version 이 올라가고, 닫으면 version 기록도 지워진다', () => {
    tabs().open('/a');
    tabs().refresh('/a');
    tabs().refresh('/a');
    expect(tabs().versions['/a']).toBe(2);

    tabs().close('/a');
    expect(tabs().versions['/a']).toBeUndefined();
  });
});

describe('nextPathAfterClose', () => {
  const paths = ['/', '/a', '/b', '/c'];

  it('보고 있지 않은 탭을 닫으면 화면 이동이 필요 없다', () => {
    expect(nextPathAfterClose(paths, '/a', '/c')).toBeNull();
  });

  it('보고 있는 탭을 닫으면 오른쪽 탭으로 이동한다', () => {
    expect(nextPathAfterClose(paths, '/a', '/a')).toBe('/b');
  });

  it('맨 오른쪽 탭을 닫으면 왼쪽 탭으로 이동한다', () => {
    expect(nextPathAfterClose(paths, '/c', '/c')).toBe('/b');
  });
});
