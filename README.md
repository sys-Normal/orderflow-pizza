## 인증/권한 설계

매장 탐색·장바구니 담기는 게스트로 가능하지만, 체크아웃(배송지 입력) 진입부터는 구매자 로그인이 필요합니다. 관리자 주문 관리 화면은 여전히 운영자 전용 영역으로 분리하고, `User` 테이블(Prisma) 기반 다중 계정 로그인으로 접근을 제어합니다. 역할(`role`)은 `buyer` / `seller` / `platform_admin`으로 구분되며, 이제 세 역할 모두 로그인 계정을 갖습니다.

**구현 상세**

- 관리자 로그인: `/admin/login` — 이메일/비밀번호를 `User` 테이블과 대조. 비밀번호는 평문 저장 없이 `src/lib/auth/password.ts`에서 `scrypt`로 해싱/검증합니다.
- 구매자 로그인/회원가입: `/login`, `/signup` (`src/lib/auth/buyer-actions.ts`) — 이메일/비밀번호 또는 구글 소셜 로그인 중 선택 가능합니다. 구글 로그인은 별도 인증 라이브러리(next-auth 등) 없이 OAuth 2.0 Authorization Code Flow를 직접 구현했습니다 (`src/lib/auth/google-oauth.ts`, `/api/auth/google`, `/api/auth/google/callback`). id_token JWT의 서명을 직접 검증하는 대신 액세스 토큰으로 구글 userinfo 엔드포인트를 호출해 프로필을 받아오는 방식으로 단순화했습니다. `User.passwordHash`는 구글 전용 계정(비밀번호 없음)을 위해 nullable이고, `googleId` 컬럼으로 계정을 매칭/연결합니다.
- 세션: 로그인 성공 시 Server Action이 `session` 쿠키(HttpOnly)를 발급합니다. 값은 `userId.role.만료시각.서명` 형태로 서버 비밀키(`SESSION_SECRET`)로 HMAC 서명되어 위조/변조를 막습니다 (`src/lib/auth/session.ts`). 구매자 로그인을 추가하면서 기존 seller/platform_admin 전용이던 세션 체계를 그대로 확장해 `buyer` 역할을 포함시켰습니다 — 새 라이브러리나 별도 세션 저장소 없이. 실제 서비스에서는 세션 폐기(로그아웃 전 목록 무효화)까지 지원하는 세션 저장소나 JWT 라이브러리로 확장할 수 있습니다.
- 라우트 보호: `src/proxy.ts`가 `/admin/*`와 `/checkout/*`를 가로챕니다. `/admin/*`는 세션이 없거나 `buyer` 역할이면(관리자 세션이 아니면) `/admin/login`으로, `/admin/stores`는 `platform_admin`이 아니면 `/admin/orders`로 리다이렉트합니다. `/checkout`은 `buyer` 세션이 없으면 `/login?next=<원래 경로>`로 리다이렉트해 로그인/회원가입 후 원래 있던 곳으로 돌아오게 합니다 (`src/lib/auth/safe-next.ts`가 오픈 리다이렉트 방지를 위해 앱 내부 상대 경로만 허용). Server Action은 라우트 매처와 별개로 직접 호출될 수 있어, 상태 변경 액션(`createOrder`, `updateOrderStatus`, `updateStoreStatus`)도 각각 필요한 역할(buyer / seller·platform_admin)을 내부에서 한 번 더 명시적으로 검증합니다.
- 네비게이션: 헤더 로고는 구매자·관리자 화면 어디서든 `/`로 이동합니다 — 처음엔 구매자는 `/stores`, 관리자는 역할별 첫 화면으로 보냈는데, 그러면 한 번 `/`에서 갈라진 뒤 다시 루트로 돌아올 방법이 없어져서 로고 본연의 "홈으로" 관례를 따르도록 되돌렸습니다. `/admin/login`에도 같은 헤더가 뜨지만 로그인 전이라 의미 없는 매장 관리/로그아웃 항목은 숨깁니다 (`src/components/admin-nav.tsx`). 로그인 전에는 헤더에 로그인 아이콘이, 로그인 후에는 이메일 첫 글자로 된 원형 배지(hover 시 전체 이메일 표시) + 로그아웃이 표시됩니다 (`src/components/site-header.tsx`).
- 루트 페이지(`/`)의 주 CTA는 `매장찾기` 하나뿐입니다. `판매자·관리자 로그인`은 하단의 작은 보조 링크로 뒀습니다 — 실제 배포 시 구매자 대상 랜딩에 "관리자 로그인" 버튼이 매장찾기와 동급으로 노출될 이유가 없고, 판매자도 이 문을 같이 쓰는데 라벨이 "관리자"만으로는 부정확했기 때문입니다. 로그인 페이지 자체(`/admin/login`)를 나누지 않은 이유는, 로그인 폼이 이미 이메일/비밀번호로 동일해서(`src/components/login-form.tsx`) 역할은 로그인 성공 후 DB에서 읽어 자동으로 갈리고, 진짜 분기가 필요해지는 지점은 로그인이 아니라 "회원가입"(판매자 셀프 가입 vs 관리자 초대 전용)이라고 판단해서입니다.
- 주문/메뉴 데이터: Prisma + SQLite로 저장됩니다 (`prisma/schema.prisma`). 시드 스크립트(`prisma/seed.ts`)가 초기 매장·메뉴·계정(판매자/관리자/구매자 각 1개씩) 데이터를 채웁니다.

**역할별 권한**

| 역할 | 계정 | 접근 화면 | 할 수 있는 것 |
| --- | --- | --- | --- |
| 구매자 (buyer) | 체크아웃부터 필요 | 매장찾기 · 메뉴 · 장바구니 · 로그인/회원가입 · 주문/확인 | 매장 탐색·장바구니 담기는 게스트로 가능, 체크아웃 진입 시 로그인 필요. 로그인 후 생성한 주문은 본인 `buyerId`로 연결됨 |
| 판매자 (seller) | 필요 | 주문 목록 (본인 매장) | 본인 매장 주문만 조회·상태 변경 |
| 플랫폼 관리자 (platform_admin) | 필요 | 매장 관리 → 매장별 주문 / 주문 검색 | 매장 승인·정지, 매장 단위로 주문 조회·상태 변경, 매장 구분 없는 주문 검색 |

- 구매자 화면 경로: `/`, `/stores`(매장찾기, 지도), `/menu`, `/cart`, `/login`, `/signup`, `/checkout`(로그인 필요), `/confirmation/[orderId]`
- 구매자 로그인: `/login` (이메일 또는 구글), 회원가입: `/signup` — 둘 다 `next` 쿼리 파라미터로 로그인 후 돌아갈 경로를 받습니다
- 관리자 로그인: `/admin/login` (공용, 로그인 후 역할에 따라 `/admin/orders` 또는 `/admin/stores`로 리다이렉트)
- 판매자 전용: `/admin/orders`, `/admin/orders/[orderId]` — 본인 매장 주문만
- 플랫폼 관리자 전용: `/admin/stores`(매장 목록·승인/정지), `/admin/stores/[storeId]/orders`(매장별 주문 목록), `/admin/orders/search`(주문번호·고객명·전화번호로 매장 구분 없이 검색), `/admin/orders/[orderId]`(상세, 어느 매장 주문이든 열람 가능)
- 판매자 스코핑은 `getOrdersForSession`/`getOrderForSession`이 `Store.ownerId` 기준으로 필터링하며, `updateOrderStatus`도 소유권을 재검증합니다. 매장 상태(`pending`/`approved`/`suspended`/`rejected`) 변경은 `updateStoreStatus`가 담당합니다.

플랫폼 관리자는 원래 전체 매장 주문을 매장 구분 없이 한 목록(flat list)으로 보여줬는데, 매장이 늘어날수록 비효율적이라 판단해 "평소엔 매장 단위로 좁게, 예외적으로 특정 주문을 찾을 때만 전체 검색"하는 구조로 바꿨습니다 (`src/lib/orders/queries.ts`의 `getOrdersForStore`/`searchOrders`).

## 매장 찾기 (지도)

구매자는 메뉴를 보기 전에 먼저 `/stores`에서 매장을 지도로 찾습니다 (`src/components/store-locator.tsx`, `src/components/stores-map.tsx`).

- **위치 확인**: 화면에 진입할 때마다 브라우저 GPS 권한을 요청합니다. Node 21+가 자체 `navigator` 전역 객체(`.geolocation` 없음)를 갖고 있어서, 지원 여부를 초기 렌더에서 바로 계산하면 서버/클라이언트 첫 렌더 결과가 달라져 하이드레이션이 깨지는 문제가 있었습니다 — 그래서 초기 상태는 항상 `"requesting"`으로 고정하고, 실제 지원 여부 판단은 클라이언트 전용 `useEffect` 안에서만 하도록 했습니다. 권한을 거부하거나 위치를 가져오지 못해도 화면을 막지 않고, 기본 위치(서울시청 좌표, `src/lib/constants.ts`의 `FALLBACK_LOCATION`)로 조용히 대체합니다.
- **반경 검색**: 얻은 좌표 기준 반경 3km 이내 매장을 haversine 공식으로 계산해 보여줍니다 (`src/lib/stores/geo.ts`, `getNearbyStores`). 로컬 개발 환경(`NODE_ENV === "development"`)에서 반경 내 매장이 하나도 없으면, 기존 매장의 메뉴를 그대로 복제한 지점을 반경 내 임의 위치에 자동으로 만들어서 지도 테스트가 항상 가능하도록 했습니다 (`src/lib/stores/seed-nearby.ts`). 지점명은 `PROJECT_NAME` 상수(`orderflow`)를 기반으로 만들어 브랜드명을 한 곳에서 바꿀 수 있습니다.
- **지도**: Leaflet 기반, 사용자 위치(파란 점) + 반경 원 + 매장 마커를 함께 표시합니다. 마커를 클릭하면 팝업에 매장명·전화번호·"주문하기" 버튼이 뜨고, 팝업이 열릴 때 지도가 자동으로 팬(pan)되어 **말풍선 자체**가 화면 중앙에 오도록 맞춥니다 — 마커만 중앙에 두면 마커 위로 뜨는 팝업이 화면 위쪽에 걸려 아래가 비어 보이는 문제가 있어서, 팝업이 열린 직후 실제 렌더링된 팝업과 뷰포트 중앙의 화면 좌표 차이를 실측해 그만큼만 보정합니다. 전화번호를 클릭하면 클립보드로 복사됩니다.
- **매장 목록**: 지도 하단에 반경 내 매장을 거리순으로 스크롤 가능한 목록으로도 보여줍니다. 각 항목의 이동 아이콘을 누르면 해당 매장의 마커를 클릭한 것과 동일하게 동작합니다(같은 popupopen 핸들러를 그대로 재사용).
- 매장을 선택해 "주문하기"를 누르면 `/menu?storeId=<선택한 매장>`으로 이동해 해당 매장의 메뉴만 보여줍니다 (`getMenu(storeId)`).

## 장바구니

장바구니는 한 번에 한 매장의 메뉴만 담을 수 있습니다 (`src/lib/cart/cart-context.tsx`) — 주문은 `storeId` 하나로만 생성되기 때문입니다. 이미 담긴 것과 다른 매장의 메뉴를 담으려 하면 기존 장바구니를 비우고 교체할지 확인하는 다이얼로그가 뜹니다 (`src/components/confirm-dialog.tsx`).

저장 방식은 로그인 여부에 따라 다릅니다:

- **게스트**: 기존대로 `localStorage`만 사용하는 클라이언트 전용 상태입니다 (`src/lib/create-local-store.ts`).
- **로그인한 구매자**: 같은 `localStorage` 캐시를 쓰되, 변경될 때마다 debounce로 DB `Cart` 테이블(`userId` 당 한 행, `itemsJson`)에도 저장합니다 (`src/lib/cart/persistence.ts`의 `getCartForUser`, `src/lib/cart/actions.ts`의 `saveCart`) — 다른 기기·세션에서 로그인해도 장바구니가 이어집니다. 규칙: 로그인 시 **서버에 저장된 장바구니가 우선**(서버가 비어 있을 때만 로컬에 있던 걸 서버로 승격), 로그아웃 시 **이 기기의 로컬만 비움**(서버 쪽은 보존 → 재로그인하면 복원). 로그아웃 후 같은 기기를 다른 사람이 게스트로 써도 이전 계정 장바구니를 이어받지 않도록 `orderflow_cart_owned` 플래그로 소유 여부를 구분합니다.
- 로그인 리다이렉트(`/login` → `next` 경로)가 `(customer)` 레이아웃 밖으로 나가지 않아 `CartProvider`가 리마운트되지 않는다는 점 때문에, 병합 로직은 마운트 시점이 아니라 로그인 상태의 **전환**(guest→buyer, buyer→guest)에 반응하도록 만들었습니다 — 마운트 1회로만 처리하면 로그인 직후 아직 비어 있는 로컬 장바구니가 서버 장바구니를 덮어써 버리는 문제가 있었습니다.

## 메뉴 구성

`MenuItem`에 `category`(`pizza`/`chicken`/`side`/`drink`) enum을 두고, 메뉴 화면에서 카테고리별로 섹션을 나눠 보여줍니다. 각 섹션은 기본 펼침 상태이며 제목을 클릭하면 접고 펼 수 있습니다 (`src/components/menu-category-section.tsx`). 카테고리별 최소 4개씩 시드되어 있습니다 (`prisma/seed.ts`).

## UI 공통 요소

- **다크/라이트 테마**: 기본값은 시스템 설정(`prefers-color-scheme`)을 따르고, 우측 상단 스위치로 수동 전환하면 그 이후로는 선택값이 `localStorage`에 저장되어 고정됩니다 (`src/lib/theme/theme.ts`). 다크모드 배경/서페이스 색상은 Material Design 다크 테마 규격(`#121212`, elevation에 따른 표면 색)을, 브랜드 컬러는 Google Blue 계열(라이트 `#1a73e8` / 다크 `#8ab4f8`)을 사용합니다. Tailwind의 `dark:` variant는 미디어 쿼리 대신 `.dark` 클래스 기준으로 동작하도록 커스터마이즈했습니다 (`@custom-variant dark`, `src/app/globals.css`). 테마 전환 시 깜빡임(FOUC)을 막기 위해 `<head>`에 직접 렌더링되는 블로킹 스크립트가 있습니다 (`src/app/layout.tsx`) — 처음엔 `next/script`(`beforeInteractive`)로 만들었는데, React가 SSR 시 넣어준 위치와 실제 호이스팅되는 `<head>` 위치가 달라 불필요한 하이드레이션 위험이 있어 순수 `<script dangerouslySetInnerHTML>`로 바꿨습니다.
- **토스트 알림**: 장바구니 담기/삭제, 전화번호 복사 등에서 화면 하단에 잠깐 뜨는 알림입니다. 새 라이브러리 없이 순수 React context + CSS transition으로 구현했습니다 (`src/lib/toast/toast-context.tsx`).
- **전체 화면 로딩**: 상태 변경처럼 서버에 반영되기까지 시간이 걸리는 작업에 반투명 배경 + 스피너를 띄웁니다 (`src/components/full-screen-loading.tsx`, `src/components/spinner.tsx`). 지금은 주문/매장 상태 변경 버튼에 연결되어 있습니다.
- **클릭 가능 요소 커서**: Tailwind v4가 `<button>`의 `cursor: pointer` 기본값을 없애서, `button`(비활성 제외)/`[role="button"]`/`label[for]`/`summary`에 포인터 커서를 되살리는 전역 규칙을 뒀습니다 (`src/app/globals.css`). `<div>` 등 버튼이 아닌 요소에 `onClick`을 달 때는 `cursor-pointer`를 직접 붙여야 합니다.

## 사용 라이브러리

- **[lucide-react](https://lucide.dev/)** (ISC License) — 내비게이션 로고(피자), 장바구니, 매장 지도 마커(전화 아이콘)와 다크/라이트 모드 스위치의 해/달 아이콘, 로그인 아이콘 등에 사용. 그 외 화면에 남아있는 손으로 그린 아이콘(`src/components/icons.tsx`)은 별도 라이브러리 없이 직접 그린 SVG path입니다.
- **[Leaflet](https://leafletjs.com/)** (BSD-2-Clause License) / **[react-leaflet](https://react-leaflet.js.org/)** (Hippocratic License 2.1) — 매장 위치 지도 표시에 사용합니다. 매장 상세 화면(관리자)에는 단일 마커 지도(`src/components/store-map.tsx`)를, 구매자용 매장찾기(`/stores`)에는 사용자 위치·반경 원·복수 매장 마커를 함께 그리는 지도(`src/components/stores-map.tsx`)를 씁니다. Hippocratic 2.1은 오픈소스이되 UN 인권선언 위반 목적 사용을 금지하는 조항이 있는 라이선스입니다. 지도 타일은 [OpenStreetMap](https://www.openstreetmap.org/copyright)에서 API 키 없이 무료로 제공받습니다. Leaflet은 브라우저 `window`가 필요해 `next/dynamic`으로 SSR을 비활성화해서 불러옵니다 (`*-map-lazy.tsx`). 마커 아이콘은 Leaflet 기본 이미지 대신 인라인 SVG(원+삼각형)로 직접 그렸고, 팝업도 앱의 카드/버튼 디자인 및 다크모드에 맞춰 CSS로 다시 스타일링했습니다 (`src/app/globals.css`).
- **구글 로그인**: 별도 SDK/라이브러리 없이 OAuth 2.0 Authorization Code Flow를 `fetch`만으로 직접 구현했습니다 (`src/lib/auth/google-oauth.ts`). Google Cloud Console에서 OAuth 2.0 클라이언트 ID(웹 애플리케이션)를 발급받아 `.env`의 `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REDIRECT_URI`를 채우면 동작합니다 — 로그인 전용 스코프(`openid email`)만 쓰는 한 별도 결제 계정 등록 없이 무료입니다.
