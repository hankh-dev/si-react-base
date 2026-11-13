import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchCodeGroups, fetchCodes } from './api';
import type { CodeItem } from './types';

export const codeKeys = {
  all: ['codes'] as const,
  items: (groupCode: string) => [...codeKeys.all, 'items', groupCode] as const,
  groups: (keyword: string, seq: number) => [...codeKeys.all, 'groups', keyword, seq] as const,
};

const NO_CODES: CodeItem[] = [];

/**
 * 공통코드 한 그룹을 화면에서 쓰기 좋은 형태로 돌려줍니다. (선택 목록, 코드 → 코드명 변환)
 * 같은 그룹은 로그인 중 한 번만 조회하고 여러 화면이 함께 씁니다.
 *
 * @example
 * const status = useCodes('USER_STATUS');
 * status.labelOf('ACTIVE'); // '정상'
 */
export function useCodes(groupCode: string) {
  const { data, isLoading } = useQuery({
    queryKey: codeKeys.items(groupCode),
    queryFn: ({ signal }) => fetchCodes(groupCode, signal),
    staleTime: Infinity,
  });

  return useMemo(() => {
    const codes = data ?? NO_CODES;
    const nameByCode = new Map(codes.map((item) => [item.code, item.name]));

    return {
      codes,
      /** 선택 목록용. 사용 중(useYn = 'Y')인 코드만 담습니다. */
      options: codes
        .filter((item) => item.useYn === 'Y')
        .map((item) => ({ value: item.code, label: item.name })),
      /** 코드 → 코드명. 아직 못 받았거나 모르는 코드면 코드값을 그대로 돌려줍니다. */
      labelOf: (code: string | null | undefined): string =>
        code ? (nameByCode.get(code) ?? code) : '',
      isLoading,
    };
  }, [data, isLoading]);
}

/** 공통코드 조회 화면용: 그룹 목록. seq 는 조회 버튼을 누를 때마다 바뀌는 일련번호입니다. */
export function useCodeGroups(keyword: string, seq: number) {
  return useQuery({
    queryKey: codeKeys.groups(keyword, seq),
    queryFn: ({ signal }) => fetchCodeGroups(keyword, signal),
  });
}

/** 공통코드 조회 화면용: 선택한 그룹의 코드 목록. 그룹을 고르기 전에는 조회하지 않습니다. */
export function useCodeItems(groupCode: string | null) {
  return useQuery({
    queryKey: codeKeys.items(groupCode ?? ''),
    queryFn: ({ signal }) => fetchCodes(groupCode ?? '', signal),
    enabled: groupCode !== null,
  });
}
