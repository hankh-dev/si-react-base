import axios from 'axios';
import { z } from 'zod';
import { messages } from '@/shared/config/messages';

/** 입력값 검증 오류 한 건. field 는 요청 본문의 속성 이름과 같습니다. */
export interface FieldError {
  field: string;
  message: string;
}

/*
 * 서버 오류 응답 본문 규격 (docs/03-api-contract.md)
 * 백엔드의 공통 오류 응답이 다르면 이 스키마와 아래 toApiError 만 고치면 됩니다.
 */
const errorBodySchema = z.object({
  code: z.string().nullish(),
  message: z.string().nullish(),
  fieldErrors: z.array(z.object({ field: z.string(), message: z.string() })).nullish(),
  traceId: z.string().nullish(),
});

type ErrorBody = z.infer<typeof errorBodySchema>;

/**
 * API 호출 실패를 나타내는 공통 오류.
 * http 클라이언트는 실패 원인이 무엇이든 항상 이 타입으로 바꿔서 던집니다.
 */
export class ApiError extends Error {
  /** HTTP 상태 코드. 응답을 받지 못한 경우(네트워크 오류·시간 초과·취소)는 0 */
  readonly status: number;
  /** 서버가 내려준 오류 코드. 없으면 HTTP_500, NETWORK, TIMEOUT 같은 값이 들어갑니다. */
  readonly code: string;
  readonly fieldErrors: FieldError[];
  /** 서버 로그와 대조할 수 있는 추적번호 (서버가 내려준 경우) */
  readonly traceId: string | undefined;

  constructor(init: {
    status: number;
    code: string;
    message: string;
    fieldErrors?: FieldError[];
    traceId?: string;
  }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.fieldErrors = init.fieldErrors ?? [];
    this.traceId = init.traceId;
  }
}

function defaultMessage(status: number): string {
  if (status === 400 || status === 422) return messages.error.badRequest;
  if (status === 401) return messages.error.unauthorized;
  if (status === 403) return messages.error.forbidden;
  if (status === 404) return messages.error.notFound;
  if (status === 409) return messages.error.conflict;
  if (status >= 500) return messages.error.server;
  return messages.error.unknown;
}

async function readErrorBody(data: unknown): Promise<ErrorBody> {
  let body = data;
  // 파일 다운로드(responseType: 'blob') 요청이 실패하면 오류 본문도 Blob 으로 옵니다.
  if (data instanceof Blob) {
    try {
      body = JSON.parse(await data.text());
    } catch {
      return {};
    }
  }
  const parsed = errorBodySchema.safeParse(body);
  return parsed.success ? parsed.data : {};
}

/** 어떤 형태의 실패든 ApiError 로 바꿉니다. */
export async function toApiError(error: unknown): Promise<ApiError> {
  if (error instanceof ApiError) return error;

  if (!axios.isAxiosError(error)) {
    const message = error instanceof Error ? error.message : messages.error.unknown;
    return new ApiError({ status: 0, code: 'UNKNOWN', message });
  }

  const { response } = error;
  if (!response) {
    if (axios.isCancel(error)) {
      return new ApiError({ status: 0, code: 'CANCELED', message: messages.error.canceled });
    }
    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    return new ApiError({
      status: 0,
      code: timedOut ? 'TIMEOUT' : 'NETWORK',
      message: timedOut ? messages.error.timeout : messages.error.network,
    });
  }

  const body = await readErrorBody(response.data);
  return new ApiError({
    status: response.status,
    code: body.code ?? `HTTP_${response.status}`,
    message: body.message ?? defaultMessage(response.status),
    fieldErrors: body.fieldErrors ?? undefined,
    traceId: body.traceId ?? undefined,
  });
}
