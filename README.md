# WOOWANGTHON_TEAM_30_FE — 여운 화면

2026 AI 우왕톤 30팀 **여운**의 웹 화면입니다. 어르신의 실제 목소리 녹음을 정리해 두고, 가족이 원본 녹음으로 추억을 다시 듣고 이야기를 나누는 서비스예요.

**서비스 주소:** https://yeoun-team30-web.onrender.com
(무료 서버라 15분 동안 아무도 안 쓰면 잠들어요. 처음 열 때 1분쯤 "서버를 깨우는 중이에요"가 보일 수 있어요.)

| 저장소 | 내용 |
|---|---|
| FE (이 저장소) | Next.js 15 (App Router) + TypeScript + Tailwind 4 |
| [BE](https://github.com/woowangthon/WOOWANGTHON_TEAM_30_BE) | FastAPI 서버, DB, 녹음 처리, 실행되는 AI 코드 |
| [AI](https://github.com/woowangthon/WOOWANGTHON_TEAM_30_AI) | AI 설계 설명, 평가 질문 세트, 검증 결과 |

## 구조

브라우저는 언제나 같은 주소의 `/api/...`만 부르고, Next.js가 BE로 넘겨 줍니다(`next.config.ts`의 rewrites). 그래서 쿠키·CSRF가 같은 출처에서 동작하고 CORS 설정이 필요 없어요.

```
src/app/          화면 (샘플 체험, 가입·로그인, 공간, 올리기, 대화, 타임라인, 미리 남기기, 설정)
src/components/   공용 UI
src/lib/          API 호출(api.ts), 업로드 큐, 녹음기, 생성된 API 타입(api-types.gen.ts)
src/instrumentation.ts  서버가 시작될 때 잠든 API를 함께 깨움
tests/            단위 테스트 (vitest)
e2e/              브라우저 시나리오 테스트 (Playwright)
```

`src/lib/api-types.gen.ts`는 BE 저장소의 `shared/schema.json`에서 자동으로 만듭니다. 직접 고치지 말고 BE에서 `make gen`을 실행하세요.

## 로컬에서 실행

Node 20.9 이상이 필요해요.

```bash
npm ci
YEOUN_API_ORIGIN=http://localhost:8000 npm run dev   # http://localhost:3000
```

API까지 함께 돌리려면 BE 저장소를 이 저장소 **옆 폴더에 나란히** clone하고 BE에서 `make dev`를 실행하세요(`../WOOWANGTHON_TEAM_30_FE`를 찾습니다).

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 (3000) |
| `npm run build` / `npm run start` | 배포용 빌드와 실행 |
| `npm run lint` | eslint + 타입 검사 |
| `npm test` | vitest |
| `npm run e2e` | Playwright (BE의 `scripts/e2e.sh`가 API·화면을 띄운 뒤 실행) |

## 배포 (Render)

| 항목 | 값 |
|---|---|
| 서비스 | `yeoun-team30-web` (Free, Singapore) |
| Build | `npm ci --no-audit --no-fund && npm run build` |
| Start | `npm run start` |
| 환경 변수 | `YEOUN_API_ORIGIN=https://yeoun-team30-api.onrender.com`, `NODE_VERSION=22`, `NEXT_TELEMETRY_DISABLED=1` |

설정은 [`render.yaml`](render.yaml)에도 적어 두었어요. 지금은 Render에 **공개 저장소 주소**로 연결돼 있어서 push해도 자동 배포되지 않아요. main에 머지한 뒤 Render에서 **Manual Deploy → Deploy latest commit**을 누르세요. `YEOUN_API_ORIGIN`을 바꾸면 반드시 다시 배포해야 합니다(rewrites가 빌드 때 정해짐).

API 쪽 배포와 전체 순서는 BE 저장소의 [docs/DEPLOY.md](https://github.com/woowangthon/WOOWANGTHON_TEAM_30_BE/blob/main/docs/DEPLOY.md)를 보세요.
