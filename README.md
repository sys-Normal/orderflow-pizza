## 인증/권한 설계

사용자 주문 흐름은 비회원 주문을 가정하여 별도 인증 없이 접근 가능하도록 구성했습니다.

관리자 주문 관리 화면은 운영자 전용 영역으로 분리하고, 포트폴리오 환경에서는 별도 백엔드 없이 Mock Admin Session을 cookie에 저장하는 방식으로 접근 제어를 구현했습니다.

실제 서비스에서는 서버에서 발급한 HttpOnly Cookie 또는 Access Token 기반 인증으로 확장할 수 있도록 관리자 라우트를 분리했습니다.

**구현 상세**

- 로그인: `/admin/login` — mock 계정(`admin` / `admin1234`)을 `src/lib/auth/mock-admin.ts`에서 검증
- 세션: 로그인 성공 시 `src/lib/auth/actions.ts`의 Server Action이 `admin_session` 쿠키(HttpOnly)를 발급. 값 자체는 암호화되지 않은 단순 플래그이며, 실제 서비스 전환 시 서명/암호화된 세션(JWT 등)으로 교체가 필요합니다.
- 라우트 보호: `src/proxy.ts`가 `/admin/*` 요청을 가로채 쿠키를 확인하고, 없으면 `/admin/login`으로 리다이렉트합니다. (`/admin/login` 자체는 예외 처리)
- 주문 데이터: 별도 DB 없이 브라우저 `localStorage`에 저장되며, 같은 브라우저 내에서 사용자 주문 → 관리자 화면 조회가 가능합니다.
