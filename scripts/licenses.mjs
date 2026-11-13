/*
 * 배포 산출물에 들어가는 의존성(dependencies 와 그 하위)의 라이선스 목록을 출력합니다.
 *
 *   npm run licenses          라이선스별 개수 요약
 *   npm run licenses -- --csv 패키지별 목록 (이름,버전,라이선스) — 오픈소스 목록 산출물용
 *
 * 추가 패키지 없이 설치된 node_modules 만 읽으므로 폐쇄망에서도 동작합니다.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const listed = execFileSync(npm, ['ls', '--omit=dev', '--all', '--parseable', '--long'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  shell: process.platform === 'win32',
});

/** "경로:이름@버전" 형태의 줄에서 설치 경로를 꺼냅니다. (Windows 의 드라이브 문자 C: 를 고려) */
const packagePath = (line) => line.slice(0, line.lastIndexOf(':', line.lastIndexOf('@')));

const packages = new Map();
for (const line of listed.split('\n').filter(Boolean).slice(1)) {
  const manifest = JSON.parse(readFileSync(join(packagePath(line), 'package.json'), 'utf8'));
  const license =
    typeof manifest.license === 'string'
      ? manifest.license
      : (manifest.license?.type ?? '확인 필요');
  packages.set(`${manifest.name}@${manifest.version}`, { ...manifest, license });
}

const rows = [...packages.values()].sort((a, b) => a.name.localeCompare(b.name));

if (process.argv.includes('--csv')) {
  console.log('name,version,license');
  for (const { name, version, license } of rows) console.log(`${name},${version},${license}`);
} else {
  const counts = new Map();
  for (const { license } of rows) counts.set(license, (counts.get(license) ?? 0) + 1);
  for (const [license, count] of [...counts].sort((a, b) => b[1] - a[1])) {
    console.log(`${String(count).padStart(4)}  ${license}`);
  }
  console.log(`\n총 ${rows.length}개 패키지`);
}
