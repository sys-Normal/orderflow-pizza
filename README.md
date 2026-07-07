## 인증/권한 설계

사용자 주문 흐름은 비회원 주문을 가정하여 별도 인증 없이 접근 가능하도록 구성했습니다.

관리자 주문 관리 화면은 운영자 전용 영역으로 분리하고, `User` 테이블(Prisma) 기반 다중 계정 로그인으로 접근을 제어합니다. 역할(`role`)은 `buyer` / `seller` / `platform_admin`으로 구분되며, 관리자 화면은 `seller`·`platform_admin` 계정만 로그인할 수 있습니다.

**구현 상세**

- 로그인: `/admin/login` — 이메일/비밀번호를 `User` 테이블과 대조. 비밀번호는 평문 저장 없이 `src/lib/auth/password.ts`에서 `scrypt`로 해싱/검증합니다.
- 세션: 로그인 성공 시 `src/lib/auth/actions.ts`의 Server Action이 `session` 쿠키(HttpOnly)를 발급합니다. 값은 `userId.role.만료시각.서명` 형태로 서버 비밀키(`SESSION_SECRET`)로 HMAC 서명되어 위조/변조를 막습니다 (`src/lib/auth/session.ts`). 실제 서비스에서는 세션 폐기(로그아웃 전 목록 무효화)까지 지원하는 세션 저장소나 JWT 라이브러리로 확장할 수 있습니다.
- 라우트 보호: `src/proxy.ts`가 `/admin/*` 요청을 가로채 세션 서명을 검증하고, 없거나 위조되었으면 `/admin/login`으로 리다이렉트합니다. `/admin/stores`는 `platform_admin`이 아니면 `/admin/orders`로 다시 리다이렉트합니다. Server Action은 라우트 매처와 별개로 직접 호출될 수 있어, 상태 변경 액션(`updateOrderStatus`, `updateStoreStatus`) 내부에서도 세션을 한 번 더 검사합니다.
- 주문/메뉴 데이터: Prisma + SQLite로 저장됩니다 (`prisma/schema.prisma`). 시드 스크립트(`prisma/seed.ts`)가 초기 매장·메뉴·계정 데이터를 채웁니다.

**역할별 권한**

| 역할 | 계정 | 접근 화면 | 할 수 있는 것 |
| --- | --- | --- | --- |
| 구매자 | 불필요 | 메뉴 · 장바구니 · 주문/확인 | 메뉴 조회, 주문 생성, 본인 주문 확인 |
| 판매자 (seller) | 필요 | 주문 목록 (본인 매장) | 본인 매장 주문만 조회·상태 변경 |
| 플랫폼 관리자 (platform_admin) | 필요 | 매장 관리 → 매장별 주문 / 주문 검색 | 매장 승인·정지, 매장 단위로 주문 조회·상태 변경, 매장 구분 없는 주문 검색 |

- 구매자 화면 경로: `/`, `/menu`, `/cart`, `/checkout`, `/confirmation/[orderId]`
- 로그인: `/admin/login` (공용, 로그인 후 역할에 따라 `/admin/orders` 또는 `/admin/stores`로 리다이렉트)
- 판매자 전용: `/admin/orders`, `/admin/orders/[orderId]` — 본인 매장 주문만
- 플랫폼 관리자 전용: `/admin/stores`(매장 목록·승인/정지), `/admin/stores/[storeId]/orders`(매장별 주문 목록), `/admin/orders/search`(주문번호·고객명·전화번호로 매장 구분 없이 검색), `/admin/orders/[orderId]`(상세, 어느 매장 주문이든 열람 가능)
- 판매자 스코핑은 `getOrdersForSession`/`getOrderForSession`이 `Store.ownerId` 기준으로 필터링하며, `updateOrderStatus`도 소유권을 재검증합니다. 매장 상태(`pending`/`approved`/`suspended`/`rejected`) 변경은 `updateStoreStatus`가 담당합니다.

플랫폼 관리자는 원래 전체 매장 주문을 매장 구분 없이 한 목록(flat list)으로 보여줬는데, 매장이 늘어날수록 비효율적이라 판단해 "평소엔 매장 단위로 좁게, 예외적으로 특정 주문을 찾을 때만 전체 검색"하는 구조로 바꿨습니다 (`src/lib/orders/queries.ts`의 `getOrdersForStore`/`searchOrders`).

## 메뉴 구성

`MenuItem`에 `category`(`pizza`/`chicken`/`side`/`drink`) enum을 두고, 메뉴 화면에서 카테고리별로 섹션을 나눠 보여줍니다. 각 섹션은 기본 펼침 상태이며 제목을 클릭하면 접고 펼 수 있습니다 (`src/components/menu-category-section.tsx`). 카테고리별 최소 4개씩 시드되어 있습니다 (`prisma/seed.ts`).

## UI 공통 요소

- **다크/라이트 테마**: 기본값은 시스템 설정(`prefers-color-scheme`)을 따르고, 우측 상단 스위치로 수동 전환하면 그 이후로는 선택값이 `localStorage`에 저장되어 고정됩니다 (`src/lib/theme/theme.ts`). 다크모드 배경/서페이스 색상은 Material Design 다크 테마 규격(`#121212`, elevation에 따른 표면 색)을, 브랜드 컬러는 Google Blue 계열(라이트 `#1a73e8` / 다크 `#8ab4f8`)을 사용합니다. Tailwind의 `dark:` variant는 미디어 쿼리 대신 `.dark` 클래스 기준으로 동작하도록 커스터마이즈했습니다 (`@custom-variant dark`, `src/app/globals.css`). 테마 전환 시 깜빡임(FOUC)을 막기 위해 `<head>`에서 실행되는 블로킹 스크립트가 있습니다 (`src/app/layout.tsx`).
- **토스트 알림**: 장바구니 담기/삭제 등에서 화면 하단에 잠깐 뜨는 알림입니다. 새 라이브러리 없이 순수 React context + CSS transition으로 구현했습니다 (`src/lib/toast/toast-context.tsx`).
- **전체 화면 로딩**: 상태 변경처럼 서버에 반영되기까지 시간이 걸리는 작업에 반투명 배경 + 스피너를 띄웁니다 (`src/components/full-screen-loading.tsx`, `src/components/spinner.tsx`). 지금은 주문/매장 상태 변경 버튼에 연결되어 있습니다.

## 사용 라이브러리

- **[lucide-react](https://lucide.dev/)** (ISC License) — 내비게이션 로고(피자), 메뉴(포크·나이프), 장바구니 아이콘과 다크/라이트 모드 스위치의 해/달 아이콘에 사용. 그 외 화면에 남아있는 손으로 그린 아이콘(`src/components/icons.tsx`)은 별도 라이브러리 없이 직접 그린 SVG path입니다.
