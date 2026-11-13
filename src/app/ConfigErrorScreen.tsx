/**
 * 런타임 환경설정(config.js)이 없거나 잘못됐을 때 앱 대신 보여주는 화면.
 * 배포 담당자가 원인을 바로 알 수 있도록 어떤 값이 문제인지 그대로 표시합니다.
 */
export function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <div style={{ padding: 40, lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 20 }}>환경설정 오류</h1>
      <p>앱을 시작할 수 없습니다. 배포된 config.js 파일을 확인해 주세요.</p>
      <pre
        style={{
          padding: 16,
          background: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: 4,
          whiteSpace: 'pre-wrap',
        }}
      >
        {message}
      </pre>
    </div>
  );
}
