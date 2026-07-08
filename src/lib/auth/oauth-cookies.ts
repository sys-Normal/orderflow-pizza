// Short-lived cookies used only during the Google OAuth round-trip
// (set by /api/auth/google, read and cleared by its callback route).
export const OAUTH_STATE_COOKIE = "oauth_state";
export const OAUTH_NEXT_COOKIE = "oauth_next";
export const OAUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10;
