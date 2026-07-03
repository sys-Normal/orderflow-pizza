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
| 판매자 (seller) | 필요 | 관리자 주문 화면 | 본인 매장 주문만 조회·상태 변경 |
| 플랫폼 관리자 (platform_admin) | 필요 | 관리자 주문 화면 + 매장 관리 | 전체 매장 주문 조회·상태 변경, 매장 승인/정지 |

- 구매자 화면 경로: `/`, `/menu`, `/cart`, `/checkout`, `/confirmation/[orderId]`
- 관리자 주문 화면 경로: `/admin/login`, `/admin/orders`, `/admin/orders/[orderId]`
- 매장 관리 경로(`platform_admin` 전용): `/admin/stores`
- 판매자 스코핑은 `getOrdersForSession`/`getOrderForSession`이 `Store.ownerId` 기준으로 필터링하며, `updateOrderStatus`도 소유권을 재검증합니다. 매장 상태(`pending`/`approved`/`suspended`/`rejected`) 변경은 `updateStoreStatus`가 담당합니다.

현재는 매장이 하나뿐이라 seller/platform_admin의 주문 목록이 실제로는 같아 보이지만, 매장이 여러 개로 늘어나면 seller는 자기 매장 주문만, platform_admin은 전체를 보게 되는 차이가 그때부터 드러납니다.
