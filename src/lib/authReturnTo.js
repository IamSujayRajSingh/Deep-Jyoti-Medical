// Restored for local development: this file was missing from the export.
// Where to send the user after sign-in. Only same-origin paths are accepted so a
// crafted ?returnTo= link can never redirect to another site.
export function safeReturnTo(fallback = "/") {
  if (typeof window === "undefined") return fallback;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("returnTo") || params.get("from_url");
  if (!raw) return fallback;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    const path = url.pathname + url.search + url.hash;
    // Never bounce back into the auth pages themselves.
    if (/^\/(login|register|forgot-password|reset-password|mfa)(\/|\?|#|$)/.test(path)) return fallback;
    return path || fallback;
  } catch {
    return fallback;
  }
}
