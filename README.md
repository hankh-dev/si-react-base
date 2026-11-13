# SI React Base

SI 업무 시스템(백오피스)을 만들 때 출발점으로 쓰는 React 템플릿입니다.
로그인·권한·메뉴, 탭(MDI), 조회조건 + 그리드 + 등록/수정 팝업, 공통코드, 엑셀 다운로드, 공통 오류 처리, 환경별 배포까지
업무 화면에서 매번 반복되는 것들을 한 벌 갖춰 두었습니다.

백엔드 없이도 바로 실행됩니다. 개발 중에는 목 API(MSW)가 서버 역할을 합니다.

## 빠른 시작

```bash
npm ci          # 의존성 설치 (package-lock.json 기준으로 정확히 같은 버전)
npm run dev     # http://localhost:5173
```

Node.js 22.22 이상이 필요합니다 (권장: 24 LTS).

목 API 계정은 `src/mocks/db/users.ts` 의 `MOCK_PASSWORDS` 에 있습니다. 로그인 화면에도 표시됩니다.

| 계정    | 권한         | 확인할 수 있는 것                                         |
| ------- | ------------ | --------------------------------------------------------- |
| `admin` | 시스템관리자 | 모든 메뉴, 등록·수정·삭제·엑셀                            |
| `user`  | 일반사용자   | 메뉴 축소, 버튼 숨김, 읽기 전용 상세, 권한 없는 주소(403) |

## 명령어

| 명령어               | 하는 일                                                               |
| -------------------- | --------------------------------------------------------------------- |
| `npm run dev`        | 목 API 로 개발 서버 실행                                              |
| `npm run dev:api`    | 목을 끄고 실제 백엔드에 연결 (`.env` 의 `VITE_DEV_PROXY_TARGET`)      |
| `npm run build`      | 운영 빌드 → `dist/` (목 코드·소스맵 미포함)                           |
| `npm run build:mock` | 목 API 를 포함한 시연용 빌드 (백엔드 없이 화면만 보여줄 때)           |
| `npm run preview`    | `dist/` 를 로컬에서 확인                                              |
| `npm run verify`     | 타입 체크 + 린트 + 서식 검사 + 테스트 + 빌드를 한 번에 (커밋·배포 전) |
| `npm run lint`       | ESLint                                                                |
| `npm run format`     | Prettier 로 서식 정리                                                 |
| `npm test`           | 테스트 실행                                                           |
| `npm run licenses`   | 배포 산출물에 들어가는 의존성의 라이선스 목록                         |

## 기술 구성

| 영역            | 사용한 것                                        |
| --------------- | ------------------------------------------------ |
| 빌드            | Vite 8 (SPA, 정적 파일로 배포)                   |
| 언어            | TypeScript 6.0                                   |
| 화면            | React 19, Ant Design 6                           |
| 라우팅          | React Router 8                                   |
| 서버 상태       | TanStack Query 5                                 |
| 클라이언트 상태 | Zustand 5 (로그인 상태, 열린 탭)                 |
| 폼·검증         | React Hook Form 7 + Zod 4                        |
| HTTP            | axios                                            |
| 그리드          | AG Grid Community 36 (`DataGrid` 로 감싸서 사용) |
| 목 API          | MSW 3                                            |
| 테스트          | Vitest 5 + Testing Library                       |

버전은 `package.json` 에 정확한 값으로 고정돼 있습니다. 두 가지는 이유가 있어서 최신이 아니거나 덮어쓴 값입니다.

- **TypeScript 6.0.3**: 최신은 7.0 이지만 린트 도구(typescript-eslint 8.72)가 6.0 까지만 지원합니다.
  typescript-eslint 가 7.x 를 지원하면 함께 올립니다.
- **`overrides.minimatch`**: ESLint 가 쓰는 minimatch 10.x 에 보안 권고(중간 등급)가 있어 패치된 11.0.8 로 덮어썼습니다.
  개발 도구에만 해당하고 배포 산출물에는 들어가지 않습니다. ESLint 가 자체적으로 올리면 이 항목을 지웁니다.

## 폴더 구조

```
src/
  app/        앱의 뼈대: 진입 구성, 라우터, 화면 등록부, 레이아웃(상단 바·메뉴·탭)
  pages/      화면. 메뉴 구조와 같은 폴더 구조를 따릅니다
  features/   업무 영역별 API·조회 훅·타입·검증 규칙 (auth, menu, code, user ...)
  shared/     어느 화면에서나 쓰는 공통 코드
    api/        HTTP 클라이언트, 오류 규격, 파일 다운로드
    ui/         공통 컴포넌트 (DataGrid, SearchForm, FormField, Modal, 알림 ...)
    screen/     탭(MDI) 상태와 화면 정보
    lib/        서식 함수, 목록 조회 상태 훅
    config/     런타임 설정, 문구, 테마, 상수
  mocks/      목 API (핸들러와 데이터)
  test/       테스트 공통 설정
public/config.js   런타임 환경설정 (배포 후에도 바꿀 수 있는 값)
deploy/            환경별 config 예시, Nginx 설정 예시
docs/              개발 가이드
```

import 는 `app → pages → features → shared` 방향으로만 할 수 있고, 반대 방향은 ESLint 가 막습니다.

## 문서

- [docs/01-architecture.md](docs/01-architecture.md) — 구조와 동작 방식 (레이어, 탭, 인증, 오류 처리, 설정)
- [docs/02-new-screen.md](docs/02-new-screen.md) — 새 화면을 추가하는 순서와 규칙
- [docs/03-api-contract.md](docs/03-api-contract.md) — 화면이 기대하는 API 규격 (백엔드와 맞출 내용)
- [docs/04-deploy.md](docs/04-deploy.md) — 빌드, 환경별 설정, 웹서버 설정, 폐쇄망, 보안 점검 대비

## 이 템플릿에 없는 것

필요해지면 추가할 항목들입니다. 기본에는 넣지 않았습니다.

- 그리드 안에서 직접 고치고 한꺼번에 저장하는 패턴 (행 상태 C/U/D 관리)
- 파일 업로드, 인쇄·리포트 연동
- 일정 시간 미사용 시 자동 로그아웃, 중복 로그인 처리
- 다국어 (문구는 `shared/config/messages.ts` 한 곳에 모여 있습니다)
- 커밋 전 자동 검사(git hook), CI 설정, E2E 테스트
