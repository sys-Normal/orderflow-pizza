// /admin/* paths reachable without a seller/platform_admin session. Shared
// between src/proxy.ts (actual access control) and admin-nav.tsx (hiding
// the logged-in-style nav chrome) so the two can't drift out of sync — this
// happened twice already (once for /admin/signup, once for
// /admin/forgot-password + /admin/reset-password) when each file kept its
// own separate hardcoded list.
export const ADMIN_PUBLIC_PATHS: readonly string[] = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];
