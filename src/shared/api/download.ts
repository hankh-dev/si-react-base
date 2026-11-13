import { http } from './http';

/**
 * Content-Disposition 헤더에서 파일명을 꺼냅니다.
 * 한글 파일명은 `filename*=UTF-8''%EC%82%AC...` (RFC 5987) 형식으로 오므로 이쪽을 먼저 봅니다.
 */
export function parseFilename(contentDisposition: string | null | undefined): string | null {
  if (!contentDisposition) return null;

  const extended = /(?:^|;)\s*filename\*\s*=\s*[^']*'[^']*'([^;]+)/i.exec(contentDisposition);
  if (extended) {
    try {
      return decodeURIComponent(extended[1].trim());
    } catch {
      // 인코딩이 잘못된 경우 아래의 일반 filename 으로 넘어갑니다.
    }
  }

  const plain = /(?:^|;)\s*filename\s*=\s*(?:"([^"]*)"|([^;]*))/i.exec(contentDisposition);
  const value = (plain?.[1] ?? plain?.[2])?.trim();
  return value ? value : null;
}

/** Blob 을 사용자의 PC 에 파일로 저장합니다. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // 다운로드가 시작된 뒤에 해제합니다.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 서버가 만든 파일(엑셀 등)을 내려받습니다.
 * 파일명은 서버의 Content-Disposition 헤더를 따르고, 헤더가 없으면 fallbackFilename 을 씁니다.
 *
 * API 서버가 다른 도메인이면 서버에서 `Access-Control-Expose-Headers: Content-Disposition` 을
 * 내려줘야 브라우저가 이 헤더를 읽을 수 있습니다.
 */
export async function downloadFile(
  url: string,
  options: { params?: object; fallbackFilename: string },
): Promise<void> {
  const response = await http.get<Blob>(url, { params: options.params, responseType: 'blob' });
  const header: unknown = response.headers['content-disposition'];
  const filename =
    parseFilename(typeof header === 'string' ? header : null) ?? options.fallbackFilename;
  saveBlob(response.data, filename);
}
