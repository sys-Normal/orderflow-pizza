# OrderFlow Pizza

매장 탐색과 장바구니 담기는 게스트로 자유롭게, 실제 주문(체크아웃)할 때만 로그인하면 되는 피자 주문 플랫폼입니다. 구매자(buyer) · 판매자(seller) · 플랫폼 관리자(platform_admin) 세 역할이 하나의 서비스 안에서 각자의 화면을 사용합니다.

**기술 스택**: Next.js 16 (Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Prisma + SQLite · Leaflet

## 주요 기능

- **위치 기반 매장 찾기**: 반경 3km 이내 매장을 지도(Leaflet)와 거리순 목록으로 함께 보여줍니다.
- **게스트 우선 흐름**: 매장 탐색 → 메뉴 담기까지 로그인 없이 가능하고, 체크아웃 진입 시점에만 로그인을 요구합니다.
- **계정 동기화 장바구니**: 로그인한 구매자의 장바구니는 DB에도 저장되어 다른 기기·세션에서도 이어집니다.
- **자체 구현 구글 로그인**: 별도 인증 라이브러리 없이 OAuth 2.0 Authorization Code Flow를 직접 구현했습니다.
- **역할 기반 권한 분리**: 구매자·판매자·플랫폼 관리자가 각자 필요한 화면과 데이터에만 접근합니다.
- **매장 단위 주문 관리**: 판매자는 본인 매장 주문만, 플랫폼 관리자는 매장별 조회와 매장 구분 없는 전체 검색을 함께 지원합니다.
- **다크/라이트 테마**: 시스템 설정을 기본값으로 따르되 수동 전환 시 선택값을 기억합니다.

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
- 빈 장바구니 화면(`/cart`, `/checkout`)의 CTA는 `/stores`(매장 목록)로 연결됩니다 — 장바구니가 매장 구분 없는 계정 공용 자원이라 "이전에 보던 매장 메뉴"라는 개념이 없고, 매장이 여러 곳일 수 있으니 특정 매장으로 조용히 보내기보다 매장을 다시 고르게 하는 편이 맞다고 판단했습니다.
- `CartItem`에 `category`를 저장해서, 장바구니/체크아웃 목록(`src/components/cart-summary.tsx`)은 피자만 "(사이즈)"를 표시하고 치킨/사이드/음료는 표시하지 않습니다 — 이 카테고리들은 사이즈 선택 UI 자체가 없어져서(항상 M 고정) 사이즈를 같이 보여줄 이유가 없어졌기 때문입니다. 장바구니에서 사이즈를 바꾸는 기능은 추가하지 않았습니다(애초에 사이즈 선택을 없앤 결정과 방향이 맞지 않아서). `CartSummary`는 주문 확인(`/confirmation/[orderId]`)·관리자 주문 상세 화면과도 공유되는데, 그쪽은 `OrderItem` 기반이라 `category` 정보가 없어 `category`가 없으면 기존처럼 사이즈를 계속 보여줍니다 — 이 수정 이전에 담긴 장바구니 항목도 같은 이유로 사이즈가 그대로 보입니다.
- 메뉴에서 담자마자 장바구니로 이동할 방법이 헤더 카트 아이콘을 직접 찾아 누르는 것뿐이라 발견성이 떨어진다는 문제가 있었습니다. 두 가지 해법을 논의했고: ① `/menu`·`/stores` 등에서 담긴 게 있으면 화면 하단에 "N개 담김 · 합계 · 장바구니 보기"를 띄우는 고정 바(`src/components/cart-floating-bar.tsx`), ② 담기 직후 뜨는 토스트(`src/lib/toast/toast-context.tsx`)에 "보기" 바로가기 버튼을 추가하는 안. ①을 먼저 구현했고, ②는 몇 개 더 담고 나중에 이동하려는 사용자에겐 토스트가 몇 초 뒤 사라져 도움이 안 된다는 한계가 있어 **보류**했습니다 — 필요해지면 ①과 함께 추가로 붙일 수 있습니다.

## 메뉴 구성

`MenuItem`에 `category`(`pizza`/`chicken`/`side`/`drink`) enum을 두고, 메뉴 화면에서 카테고리별로 섹션을 나눠 보여줍니다. 각 섹션은 기본 펼침 상태이며 제목을 클릭하면 접고 펼 수 있습니다 (`src/components/menu-category-section.tsx`). 카테고리별 최소 4개씩 시드되어 있습니다 (`prisma/seed.ts`). `chicken` 카테고리는 현재 `DISABLED_MENU_CATEGORIES`(`src/lib/menu/types.ts`)로 화면 노출만 임시로 꺼둔 상태입니다 — 데이터는 그대로 시드되어 있고, 배열에서 빼면 바로 다시 노출됩니다.

메뉴 화면(`/menu`) 상단에는 매장 목록(`/stores`)으로 돌아가는 링크와, 원형 아이콘 배지(매장 아이콘) + 매장명 + "메뉴" 부제 2줄로 구성된 헤더가 있습니다 (`src/app/(customer)/menu/page.tsx`). 매장이 여러 곳일 수 있는 구조라 지금 보고 있는 게 어느 매장 메뉴인지 명확히 드러나야 했고, 텍스트 크기만으로 강조하거나 구분선·브레드크럼(`/`)으로 구분하는 방식은 화면이 좁아지거나 시각적으로 어수선해지는 문제가 있어 최종적으로 장바구니 뱃지·로그인 아바타 등 앱 전반에서 쓰는 원형 배지 톤에 맞춘 형태로 정리했습니다.

**피자 카드 + 상세보기 모달**: 피자 카테고리는 다른 카테고리와 달리 왼쪽에 작은 정사각형 썸네일, 오른쪽에 이름·짧은 설명·"자세히 보기" 버튼을 두는 가로형 카드이고 (`src/components/pizza-menu-card.tsx`), 재료 목록·사이즈 선택·실시간 가격·장바구니 담기는 모달로 분리했습니다 (`src/components/pizza-detail-modal.tsx`). 사진이 작아진 상태에선 기존 세로 스택(사진 위, 텍스트 아래)보다 리스트형 배달앱에 익숙한 가로 배치가 공간 활용이 낫고, 카드 전체 높이도 사이드/음료 카드와 더 비슷해집니다. 재료 목록은 `description` 필드(예: "토마토 소스, 모차렐라, 바질")를 콤마로 파싱해 만들어서 별도 스키마 필드 없이 성분표처럼 보여줍니다. 치킨/사이드/음료는 사이즈를 구분할 실익이 적어 기존처럼 카드에서 바로 담는 방식(`src/components/pizza-card.tsx`)을 유지하고, 항상 M 사이즈 가격으로 고정했습니다.

메뉴 사진은 `MenuItem.imageUrl`(nullable) 컬럼에 저장되고, 없으면 손으로 그린 `PizzaIcon`(`src/components/icons.tsx`)으로 대체됩니다. 로컬 개발용 매장 복제(`generateNearbyStores`, 위 "매장 찾기" 참고)도 이름이 같은 메뉴를 그대로 베끼는 구조라 `imageUrl`을 함께 복사하도록 했고, 기존에 이미 생성돼 있던 복제 매장들은 `prisma/seed.ts`의 `updateMany` 백필 루프로 한 번에 채웠습니다.

사진 원본마다 노출·채도가 제각각이라 얇은 반투명 검정 오버레이(`bg-black/15`)를 깔아 톤을 통일했습니다. 카드 썸네일과 모달 히어로 이미지는 `PizzaPhoto` 컴포넌트(`src/components/pizza-photo.tsx`)로 공통화했고, `lightbox` prop으로 클릭 시 원본을 오버레이 없이 크게 보는 라이트박스 사용 여부를 제어합니다 — 목록의 작은 썸네일은 그냥 훑어보기용이라 꺼두고(클릭 무반응), "자세히 보기" 상세 모달의 큰 사진에서만 켜뒀습니다. 라이트박스가 켜진 사진 영역은 hover 시 커서가 돋보기(`cursor: zoom-in`) 모양으로 바뀌어 클릭하면 확대된다는 걸 미리 알려줍니다 — 우측 상단 닫기 버튼은 별도 요소라 이 영역에서 제외됩니다. Tailwind v4의 전역 `button { cursor: pointer }` 규칙(아래 "클릭 가능 요소 커서" 참고)보다 구체적인 커서를 보여줘야 해서 `!cursor-zoom-in`으로 우선순위를 높였습니다.

카테고리 섹션 제목(`src/components/menu-category-section.tsx`)은 hover 시 배경색이 짧게(150ms) 전환되며 옅게 강조되어, 접고 펼 수 있는 영역이라는 걸 시각적으로 보여줍니다. hover 배경은 `width: 100%` 요소에 음수 마진만 주면 폭이 늘지 않고 한쪽으로만 밀리는 문제가 있어, `calc(100% + 1.5rem)`로 폭 자체를 넓혀 좌우 대칭으로 확장되도록 했습니다.

각 메뉴 카드(`src/components/pizza-card.tsx`, `pizza-menu-card.tsx`)도 hover 시 테두리가 브랜드 색으로 짧게 전환되어, 카드 전체가 클릭 가능한 영역임을 보여줍니다. 카드 안의 "자세히 보기"·"장바구니 담기" 버튼은 각자 별도의 hover 스타일(테두리·배경색)을 갖고 있어 서로 다른 요소·다른 CSS 속성이라 충돌 없이 함께 동작합니다.

## UI 공통 요소

- **다크/라이트 테마**: 기본값은 시스템 설정(`prefers-color-scheme`)을 따르고, 우측 상단 스위치로 수동 전환하면 그 이후로는 선택값이 `localStorage`에 저장되어 고정됩니다 (`src/lib/theme/theme.ts`). 다크모드 배경/서페이스 색상은 Material Design 다크 테마 규격(`#121212`, elevation에 따른 표면 색)을, 브랜드 컬러는 Google Blue 계열(라이트 `#1a73e8` / 다크 `#8ab4f8`)을 사용합니다. Tailwind의 `dark:` variant는 미디어 쿼리 대신 `.dark` 클래스 기준으로 동작하도록 커스터마이즈했습니다 (`@custom-variant dark`, `src/app/globals.css`). 테마 전환 시 깜빡임(FOUC)을 막기 위해 `<head>`에 직접 렌더링되는 블로킹 스크립트가 있습니다 (`src/app/layout.tsx`) — 처음엔 `next/script`(`beforeInteractive`)로 만들었는데, React가 SSR 시 넣어준 위치와 실제 호이스팅되는 `<head>` 위치가 달라 불필요한 하이드레이션 위험이 있어 순수 `<script dangerouslySetInnerHTML>`로 바꿨습니다.
- **토스트 알림**: 장바구니 담기/삭제, 전화번호 복사 등에서 화면 하단에 잠깐 뜨는 알림입니다. 새 라이브러리 없이 순수 React context + CSS transition으로 구현했습니다 (`src/lib/toast/toast-context.tsx`). 장바구니 담기 토스트는 "담기 버튼 클릭" 시점이 아니라 `CartContext`의 `addItem`이 실제로 항목을 반영한 시점에만 뜨도록 구현했습니다(`src/lib/cart/cart-context.tsx`) — 다른 매장 메뉴를 담아 교체 확인 다이얼로그가 뜨는 경우, 사용자가 "교체하기"를 눌러 확정하기 전까지는 아직 아무것도 담기지 않았으므로 토스트도 뜨지 않습니다. 같은 이유로 로그인 시 로컬/서버 장바구니 중 하나를 고르는 병합 확인창은 "새 메뉴를 담은" 액션이 아니라서 토스트 대상이 아닙니다.
- **전체 화면 로딩**: 상태 변경처럼 서버에 반영되기까지 시간이 걸리는 작업에 반투명 배경 + 스피너를 띄웁니다 (`src/components/full-screen-loading.tsx`, `src/components/spinner.tsx`). 지금은 주문/매장 상태 변경 버튼에 연결되어 있습니다.
- **클릭 가능 요소 커서**: Tailwind v4가 `<button>`의 `cursor: pointer` 기본값을 없애서, `button`(비활성 제외)/`[role="button"]`/`label[for]`/`summary`에 포인터 커서를 되살리는 전역 규칙을 뒀습니다 (`src/app/globals.css`). `<div>` 등 버튼이 아닌 요소에 `onClick`을 달 때는 `cursor-pointer`를 직접 붙여야 합니다.
- **스크롤바 스타일**: OS 기본 스크롤바가 카드/보더 톤(`border-black/[.08]`, dark:`border-white/[.145]`)과 어울리지 않아, 얇고 둥근 형태로 라이트/다크 모두 재스킨했습니다 (`scrollbar-width`/`scrollbar-color` + `::-webkit-scrollbar` 계열, `src/app/globals.css`). 다크 모드 클래스(`.dark`)가 `<html>` 자신에 붙는 구조라 `.dark *`(자손 선택자)만으로는 페이지 자체 스크롤바에 다크 색상이 적용되지 않는 문제가 있어, `.dark, .dark *` 형태로 자기 자신도 함께 선택하도록 처리했습니다.
- **가격 변경 펄스**: 피자 상세 모달에서 사이즈를 바꾸면 가격 텍스트가 순간적으로 바뀌어 놓치기 쉬워서, primary 색으로 살짝 반짝였다가 원래 색으로 돌아오는 220ms 애니메이션(`.price-pulse`, `src/app/globals.css`)을 넣었습니다. CSS 애니메이션은 같은 값이 다시 할당돼도 재생되지 않아서, 가격 `<span>`에 `key={size}`를 걸어 사이즈가 바뀔 때마다 리마운트되도록 했습니다 (`src/components/pizza-detail-modal.tsx`). `prefers-reduced-motion`에서는 다른 애니메이션과 동일하게 꺼집니다.

## 사용 라이브러리

- **[lucide-react](https://lucide.dev/)** (ISC License) — 내비게이션 로고(피자), 장바구니, 매장 지도 마커(전화 아이콘)와 다크/라이트 모드 스위치의 해/달 아이콘, 로그인 아이콘 등에 사용. 그 외 화면에 남아있는 손으로 그린 아이콘(`src/components/icons.tsx`)은 별도 라이브러리 없이 직접 그린 SVG path입니다.
- **[sharp](https://sharp.pixelplumbing.com/)** (Apache 2.0 License) — Next.js가 자체 호스팅 환경에서 이미지 최적화(`next/image`)에 공식 권장하는 라이브러리로, 메뉴 사진을 웹에 맞는 크기로 리사이즈/압축하는 데도 사용했습니다.
- **[Leaflet](https://leafletjs.com/)** (BSD-2-Clause License) / **[react-leaflet](https://react-leaflet.js.org/)** (Hippocratic License 2.1) — 매장 위치 지도 표시에 사용합니다. 매장 상세 화면(관리자)에는 단일 마커 지도(`src/components/store-map.tsx`)를, 구매자용 매장찾기(`/stores`)에는 사용자 위치·반경 원·복수 매장 마커를 함께 그리는 지도(`src/components/stores-map.tsx`)를 씁니다. Hippocratic 2.1은 오픈소스이되 UN 인권선언 위반 목적 사용을 금지하는 조항이 있는 라이선스입니다. 지도 타일은 [OpenStreetMap](https://www.openstreetmap.org/copyright)에서 API 키 없이 무료로 제공받습니다. Leaflet은 브라우저 `window`가 필요해 `next/dynamic`으로 SSR을 비활성화해서 불러옵니다 (`*-map-lazy.tsx`). 마커 아이콘은 Leaflet 기본 이미지 대신 인라인 SVG(원+삼각형)로 직접 그렸고, 팝업도 앱의 카드/버튼 디자인 및 다크모드에 맞춰 CSS로 다시 스타일링했습니다 (`src/app/globals.css`).
- **구글 로그인**: 별도 SDK/라이브러리 없이 OAuth 2.0 Authorization Code Flow를 `fetch`만으로 직접 구현했습니다 (`src/lib/auth/google-oauth.ts`). Google Cloud Console에서 OAuth 2.0 클라이언트 ID(웹 애플리케이션)를 발급받아 `.env`의 `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REDIRECT_URI`를 채우면 동작합니다 — 로그인 전용 스코프(`openid email`)만 쓰는 한 별도 결제 계정 등록 없이 무료입니다.

## 메뉴 사진 출처

`public/menu/`의 피자 사진은 [Wikimedia Commons](https://commons.wikimedia.org/)에서 상업적 이용이 허용된 라이선스의 사진만 골라 가져왔고, 원본을 웹에 맞게 리사이즈/압축했습니다 (수정 사실 명시).

| 파일 | 원본 | 라이선스 | 저작자 |
| --- | --- | --- | --- |
| `margherita.jpg` | [Eq it-na pizza-margherita sep2005 sml.jpg](https://commons.wikimedia.org/wiki/File:Eq_it-na_pizza-margherita_sep2005_sml.jpg) | CC BY-SA 3.0 | Valerio Capello |
| `pepperoni.jpg` | [Pepperoni pizza.jpg](https://commons.wikimedia.org/wiki/File:Pepperoni_pizza.jpg) | Public Domain | Jon Sullivan |
| `supreme.jpg` | [Supreme pizza.jpg](https://commons.wikimedia.org/wiki/File:Supreme_pizza.jpg) | Public Domain | Scott Bauer, USDA ARS |
| `hawaiian.jpg` | [Hawaiian pizza 1.jpg](https://commons.wikimedia.org/wiki/File:Hawaiian_pizza_1.jpg) | CC BY 2.0 | @joefoodie (Flickr) |
| `quattro-formaggi.jpg` | [Pizza quattro formaggi at restaurant, Chalk Farm Road, London.jpg](https://commons.wikimedia.org/wiki/File:Pizza_quattro_formaggi_at_restaurant,_Chalk_Farm_Road,_London.jpg) | CC BY-SA 2.0 | Ewan Munro |
| `bbq-chicken.jpg` | [B.B.Q. Chicken Pizza (26679384893).jpg](https://commons.wikimedia.org/wiki/File:B.B.Q._Chicken_Pizza_(26679384893).jpg) | CC BY 2.0 | Prayitno (Flickr) |

프랜차이즈(피자헛 등) 브랜드가 찍힌 사진은 상표 오인 소지가 있어 후보에서 제외했습니다.
