/// <reference types="vite/client" />

/** 빌드 시점 환경 변수 (.env, .env.[mode]) */
interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string;
  readonly VITE_ENABLE_MOCK?: string;
  readonly VITE_DEV_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** public/config.js 가 채우는 런타임 환경설정. 형식 검증은 shared/config/runtimeConfig.ts 에서 합니다. */
  __APP_CONFIG__?: unknown;
}
