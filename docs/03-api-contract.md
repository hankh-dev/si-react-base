# API 규격

화면이 기대하는 서버 응답의 모양입니다. 백엔드(Spring Boot 가정)와 맞출 때 기준으로 씁니다.
프로젝트의 공통 규격이 다르면 **아래 "바꿀 곳"** 의 파일만 고치면 화면 코드는 그대로 쓸 수 있습니다.

## 공통

- 기본 경로: `config.js` 의 `apiBaseUrl` (기본 `/api`)
- 본문: JSON (`Content-Type: application/json`)
- 성공: HTTP 2xx. 본문에 데이터를 **그대로** 담습니다 (`{ code, data }` 같은 포장 없음).
- 실패: HTTP 4xx / 5xx + 아래의 오류 본문

## 인증

| 요청                 | 성공 응답               | 비고                                                        |
| -------------------- | ----------------------- | ----------------------------------------------------------- |
| `POST /auth/login`   | `{ accessToken, user }` | 리프레시 토큰을 **httpOnly 쿠키**로 함께 내려줌. 실패는 401 |
| `POST /auth/refresh` | `{ accessToken }`       | 본문 없음. 쿠키로 판단. 세션이 끝났으면 401                 |
| `POST /auth/logout`  | 204                     | 리프레시 토큰 쿠키 삭제                                     |
| `GET /auth/me`       | `user`                  |                                                             |

- 그 외 모든 API: `Authorization: Bearer <accessToken>` 헤더. 토큰이 없거나 만료면 **401**.
- 화면은 401 을 받으면 `/auth/refresh` 를 한 번 호출하고 원래 요청을 다시 보냅니다.
- 화면과 API 의 도메인이 다르면 서버에 CORS 설정(`Access-Control-Allow-Credentials: true`,
  허용 도메인 명시)과 쿠키의 `SameSite=None; Secure` 가 필요합니다. **같은 도메인의 리버스 프록시를 권장합니다.**

```jsonc
// user
{
  "id": 1,
  "loginId": "admin",
  "userName": "관리자",
  "deptName": "경영지원팀",
  "roleCode": "ADMIN",
  "roleName": "시스템관리자",
}
```

## 오류 본문

```jsonc
{
  "code": "VALIDATION_FAILED", // 오류 종류 (문자열)
  "message": "입력 내용을 확인해 주세요.", // 사용자에게 그대로 보여줄 문구
  "fieldErrors": [
    // 입력값 검증 오류일 때만
    { "field": "loginId", "message": "이미 사용 중인 아이디입니다." },
  ],
  "traceId": "9f2c…", // 서버 로그와 대조할 추적번호 (선택)
}
```

- `field` 는 요청 본문의 속성 이름과 같아야 합니다. 화면이 그 입력란 아래에 `message` 를 표시합니다.
- `message` 가 없으면 화면이 상태 코드에 맞는 기본 문구를 씁니다.

| 상태 | 쓰는 경우                               | 화면의 처리                       |
| ---- | --------------------------------------- | --------------------------------- |
| 400  | 입력값 검증 실패                        | 토스트 + 입력란 아래 표시         |
| 401  | 토큰 없음·만료                          | 토큰 재발급 후 재시도 / 세션 만료 |
| 403  | 권한 없음                               | 토스트                            |
| 404  | 대상 없음                               | 토스트                            |
| 409  | 다른 사용자가 먼저 변경, 업무 규칙 위반 | 토스트                            |
| 5xx  | 서버 오류                               | 오류창 (추적번호 표시)            |

## 목록 조회 (페이징·정렬)

요청 파라미터

| 이름   | 예              | 설명                                               |
| ------ | --------------- | -------------------------------------------------- |
| `page` | `1`             | **1부터** 시작                                     |
| `size` | `20`            | 페이지 크기                                        |
| `sort` | `userName,desc` | `필드,asc` 또는 `필드,desc`. 없으면 서버 기본 정렬 |

- 선택하지 않은 조회조건은 파라미터 자체를 보내지 않습니다 (`status=` 처럼 빈 값으로 보내지 않음).
- 배열은 같은 이름을 반복합니다: `ids=1&ids=2`.

응답

```jsonc
{ "content": [/* 행 목록 */], "page": 1, "size": 20, "totalElements": 137 }
```

> Spring Data 의 `Pageable` 은 기본이 0부터입니다. `spring.data.web.pageable.one-indexed-parameters=true` 로
> 맞추거나, 반대로 화면의 `shared/lib/useListQuery.ts` 의 `toPageParams` 에서 1을 빼서 보냅니다.

## 날짜

| 종류        | 형식                  | 예                    |
| ----------- | --------------------- | --------------------- |
| 날짜        | `YYYY-MM-DD`          | `2026-11-12`          |
| 날짜 + 시간 | `YYYY-MM-DDTHH:mm:ss` | `2026-11-12T09:30:00` |

## 파일 다운로드 (엑셀)

- 서버가 파일을 만들어 내려줍니다. 화면은 현재 조회조건을 파라미터로 보냅니다 (페이지와 무관하게 전체 건).
- 파일명은 `Content-Disposition` 헤더로 내려주고, 한글은 `filename*` 을 씁니다.

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="users.xlsx"; filename*=UTF-8''%EC%82%AC%EC%9A%A9%EC%9E%90.xlsx
```

- 실패하면 다른 API 와 같은 JSON 오류 본문을 내려줍니다.
- 도메인이 다르면 `Access-Control-Expose-Headers: Content-Disposition` 이 필요합니다.

## 이 템플릿의 API 목록

| 요청                        | 설명                                         |
| --------------------------- | -------------------------------------------- |
| `GET /menus/my`             | 로그인 사용자의 메뉴 트리 + 화면별 허용 동작 |
| `GET /codes/{groupCode}`    | 공통코드 한 그룹                             |
| `GET /code-groups?keyword=` | 공통코드 그룹 목록                           |
| `GET /users`                | 사용자 목록 (페이징·정렬)                    |
| `GET /users/{id}`           | 사용자 한 건                                 |
| `POST /users`               | 등록 → 201 + 등록된 사용자                   |
| `PUT /users/{id}`           | 수정 → 수정된 사용자                         |
| `DELETE /users?ids=1&ids=2` | 여러 건 삭제 → 204                           |
| `GET /users/excel`          | 조회조건에 해당하는 전체 건 엑셀             |
| `GET /dashboard/summary`    | 대시보드 요약                                |

각 요청·응답의 정확한 모양은 `src/features/*/types.ts` 가 기준이고, 동작하는 예시는 `src/mocks/handlers` 에 있습니다.

## 바꿀 곳

| 백엔드 규격이 이렇게 다르면                     | 고칠 파일                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| 오류 본문의 모양이 다름                         | `shared/api/ApiError.ts` (`errorBodySchema`, `toApiError`)           |
| 성공 응답을 `{ code, message, data }` 로 포장함 | `shared/api/http.ts` 의 응답 인터셉터에서 `data` 를 꺼냄             |
| 페이징 파라미터·응답 이름이 다름                | `shared/api/types.ts`, `shared/lib/useListQuery.ts` (`toPageParams`) |
| 세션 쿠키 방식 (토큰 없음)                      | `shared/api/http.ts` 에서 토큰·재발급 부분 제거, 401 → 세션 만료     |
| 배열 파라미터 형식이 다름                       | `shared/api/http.ts` 의 `paramsSerializer`                           |
