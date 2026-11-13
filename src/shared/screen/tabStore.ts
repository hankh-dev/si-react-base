import { create } from 'zustand';
import { HOME_PATH } from '@/shared/config/constants';

/*
 * 열려 있는 탭 목록
 *
 * 상태는 "어떤 경로가 어떤 순서로 열려 있는가" 만 가집니다.
 * - 활성 탭은 저장하지 않습니다. 항상 현재 URL 이 활성 탭입니다.
 * - 탭 제목도 저장하지 않습니다. 서버 메뉴 이름에서 그때그때 가져옵니다.
 */
interface TabState {
  /** 열린 탭의 경로 (표시 순서). 첫 번째는 항상 홈입니다. */
  paths: string[];
  /** 탭별 새로고침 횟수. 값이 바뀌면 그 화면을 처음 상태로 다시 만듭니다. */
  versions: Record<string, number>;

  /** 탭을 엽니다. 이미 열려 있으면 아무 일도 하지 않습니다. */
  open: (path: string) => void;
  /** 탭을 닫습니다. 홈 탭은 닫을 수 없습니다. */
  close: (path: string) => void;
  /** 지정한 탭과 홈만 남기고 모두 닫습니다. */
  closeOthers: (path: string) => void;
  /** 홈만 남기고 모두 닫습니다. */
  closeAll: () => void;
  /** 화면을 처음 상태로 되돌립니다 (조회조건·그리드 상태 초기화). */
  refresh: (path: string) => void;
  /** 로그아웃 시 초기 상태로 되돌립니다. */
  reset: () => void;
}

const initialState = {
  paths: [HOME_PATH],
  versions: {} as Record<string, number>,
};

function omitKey(record: Record<string, number>, key: string): Record<string, number> {
  return Object.fromEntries(Object.entries(record).filter(([name]) => name !== key));
}

function pickKeys(record: Record<string, number>, keys: string[]): Record<string, number> {
  return Object.fromEntries(Object.entries(record).filter(([name]) => keys.includes(name)));
}

export const useTabStore = create<TabState>()((set) => ({
  ...initialState,

  open: (path) =>
    set((state) => (state.paths.includes(path) ? state : { paths: [...state.paths, path] })),

  close: (path) =>
    set((state) => {
      if (path === HOME_PATH || !state.paths.includes(path)) return state;
      return {
        paths: state.paths.filter((item) => item !== path),
        versions: omitKey(state.versions, path),
      };
    }),

  closeOthers: (path) =>
    set((state) => {
      const paths = state.paths.filter((item) => item === HOME_PATH || item === path);
      return { paths, versions: pickKeys(state.versions, paths) };
    }),

  closeAll: () =>
    set((state) => ({ paths: [HOME_PATH], versions: pickKeys(state.versions, [HOME_PATH]) })),

  refresh: (path) =>
    set((state) => ({
      versions: { ...state.versions, [path]: (state.versions[path] ?? 0) + 1 },
    })),

  reset: () => set(initialState),
}));

/**
 * 탭을 닫은 뒤 보여줄 경로를 정합니다.
 * 닫는 탭이 활성 탭이 아니면 화면 이동이 필요 없으므로 null 을 돌려줍니다.
 * 활성 탭을 닫으면 오른쪽 탭, 없으면 왼쪽 탭으로 이동합니다.
 */
export function nextPathAfterClose(
  paths: string[],
  closingPath: string,
  activePath: string,
): string | null {
  if (closingPath !== activePath) return null;
  const index = paths.indexOf(closingPath);
  if (index === -1) return null;
  return paths[index + 1] ?? paths[index - 1] ?? HOME_PATH;
}
