import react from '@vitejs/plugin-react';
import { msw } from 'msw/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

/** 배포 경로를 항상 "/" 또는 "/경로/" 형태로 맞춥니다. */
function normalizeBase(value: string | undefined): string {
  const trimmed = (value ?? '').replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const enableMock = env.VITE_ENABLE_MOCK === 'true';

  return {
    base: normalizeBase(env.VITE_BASE_PATH),

    plugins: [
      react(),
      // 목을 켰을 때만 MSW 워커 스크립트를 제공합니다.
      // 목이 꺼진 빌드(운영)에는 워커 파일이 산출물에 들어가지 않습니다.
      ...(enableMock ? [msw({ mode: 'worker-only' })] : []),
    ],

    resolve: {
      // tsconfig 의 paths(@/*) 를 그대로 사용합니다.
      tsconfigPaths: true,
    },

    server: {
      port: 5173,
      // 목을 끄면(npm run dev:api) /api 요청을 실제 백엔드로 넘깁니다.
      proxy: enableMock
        ? undefined
        : {
            '/api': {
              target: env.VITE_DEV_PROXY_TARGET || 'http://localhost:8080',
              changeOrigin: true,
            },
          },
    },

    build: {
      // 운영 산출물에 소스맵을 포함하지 않습니다 (보안 점검 항목).
      sourcemap: false,
      // 큰 라이브러리 두 개(그리드, Ant Design)는 하나씩으로도 500kB 를 넘습니다.
      chunkSizeWarningLimit: 1300,
      rolldownOptions: {
        output: {
          // 라이브러리를 화면 코드와 다른 파일로 분리합니다.
          // 화면만 고쳐서 다시 배포하면 라이브러리 파일은 이름이 그대로라 브라우저 캐시를 계속 씁니다.
          codeSplitting: {
            groups: [
              {
                name: 'vendor-antd',
                test: /node_modules[\\/](antd|@ant-design|@rc-component|rc-)/,
                priority: 20,
              },
              {
                name: 'vendor',
                test: /node_modules[\\/](react|react-dom|react-router|scheduler|@tanstack|axios|zod|zustand|dayjs|react-hook-form|@hookform)[\\/]/,
                priority: 10,
              },
              // 그리드는 여기에 넣지 않습니다. 그리드를 쓰는 화면을 처음 열 때 내려받도록 자동 분리에 맡깁니다.
            ],
          },
        },
      },
    },

    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  };
});
