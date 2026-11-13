import { z } from 'zod';

/*
 * 런타임 환경설정 (public/config.js)
 *
 * .env 값은 빌드할 때 번들에 고정되지만, 이 설정은 배포 후에도 파일만 바꿔서 조정할 수 있습니다.
 * 항목을 추가할 때는 아래 스키마와 public/config.js, deploy/ 의 예시 파일을 함께 고칩니다.
 */
const schema = z.object({
  envName: z.enum(['local', 'dev', 'stg', 'prod']),
  appTitle: z.string().min(1),
  apiBaseUrl: z.string().min(1),
  requestTimeoutMs: z.number().int().positive(),
});

export type RuntimeConfig = z.infer<typeof schema>;

const FALLBACK: RuntimeConfig = {
  envName: 'local',
  appTitle: '업무 시스템',
  apiBaseUrl: '/api',
  requestTimeoutMs: 30_000,
};

function load(): { config: RuntimeConfig; error: string | null } {
  const raw = window.__APP_CONFIG__;
  if (raw === undefined) {
    return { config: FALLBACK, error: 'config.js 를 불러오지 못했습니다.' };
  }

  const parsed = schema.safeParse(raw);
  if (parsed.success) {
    return { config: parsed.data, error: null };
  }

  const detail = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  return { config: FALLBACK, error: `config.js 값이 올바르지 않습니다.\n${detail}` };
}

const loaded = load();

export const runtimeConfig = loaded.config;

/** 설정이 잘못됐을 때의 안내 문구. 정상이면 null. main.tsx 가 앱 대신 이 문구를 화면에 표시합니다. */
export const runtimeConfigError = loaded.error;
