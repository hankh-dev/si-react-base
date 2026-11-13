import type { ThemeConfig } from 'antd';

/*
 * 화면 테마
 *
 * 색·글꼴·모서리 값은 여기 한 곳에서 정하고 Ant Design 과 그리드가 함께 사용합니다.
 * 글꼴은 사용자 PC 에 설치된 시스템 글꼴을 씁니다 (외부 CDN 요청 없음).
 * 고객사 지정 글꼴이 있으면 npm 패키지나 src/assets 에 넣고 FONT_FAMILY 맨 앞에 추가합니다.
 */
export const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";

export const palette = {
  primary: '#1f5fd1',
  headerBg: '#14274a',
  headerText: '#ffffff',
  pageBg: '#f2f4f8',
  panelBg: '#ffffff',
  border: '#dfe3ea',
  gridHeaderBg: '#f5f7fa',
} as const;

export const FONT_SIZE = 13;
export const BORDER_RADIUS = 4;

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: palette.primary,
    colorBorderSecondary: palette.border,
    borderRadius: BORDER_RADIUS,
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY,
  },
  components: {
    Layout: {
      headerBg: palette.headerBg,
      headerColor: palette.headerText,
      headerHeight: 48,
      headerPadding: '0 16px',
      siderBg: palette.panelBg,
      bodyBg: palette.pageBg,
    },
  },
};
