This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 인증/권한 설계

사용자 주문 흐름은 비회원 주문을 가정하여 별도 인증 없이 접근 가능하도록 구성했습니다.

관리자 주문 관리 화면은 운영자 전용 영역으로 분리하고, 포트폴리오 환경에서는 별도 백엔드 없이 Mock Admin Session을 cookie에 저장하는 방식으로 접근 제어를 구현했습니다.

실제 서비스에서는 서버에서 발급한 HttpOnly Cookie 또는 Access Token 기반 인증으로 확장할 수 있도록 관리자 라우트를 분리했습니다.

**구현 상세**

- 로그인: `/admin/login` — mock 계정(`admin` / `admin1234`)을 `src/lib/auth/mock-admin.ts`에서 검증
- 세션: 로그인 성공 시 `src/lib/auth/actions.ts`의 Server Action이 `admin_session` 쿠키(HttpOnly)를 발급. 값 자체는 암호화되지 않은 단순 플래그이며, 실제 서비스 전환 시 서명/암호화된 세션(JWT 등)으로 교체가 필요합니다.
- 라우트 보호: `src/proxy.ts`가 `/admin/*` 요청을 가로채 쿠키를 확인하고, 없으면 `/admin/login`으로 리다이렉트합니다. (`/admin/login` 자체는 예외 처리)
- 주문 데이터: 별도 DB 없이 브라우저 `localStorage`에 저장되며, 같은 브라우저 내에서 사용자 주문 → 관리자 화면 조회가 가능합니다.
