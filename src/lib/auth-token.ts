type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

export function setAuthTokenGetter(getter: TokenGetter) {
  tokenGetter = getter;
}

/** Dev-only: decode the token Clerk handed us and log freshness vs browser clock. */
function logTokenFreshness(token: string) {
  if (!import.meta.env.DEV) {
    return;
  }
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as {
      iat?: number;
      exp?: number;
      iss?: string;
    };
    const now = Date.now();
    const ageSeconds = Math.round((now - (payload.iat ?? 0) * 1000) / 1000);
    const remainingSeconds = Math.round(((payload.exp ?? 0) * 1000 - now) / 1000);
    console.log(
      `[auth-token] Clerk gave us a token: age=${ageSeconds}s remaining=${remainingSeconds}s ` +
        `issuer=${payload.iss ?? "?"} browser_now=${new Date(now).toISOString()}`,
    );
    if (remainingSeconds <= 0) {
      console.warn(
        "[auth-token] Clerk returned an ALREADY-EXPIRED token by this browser's clock. " +
          "Either the browser clock is wrong or Clerk returned a stale cached token.",
      );
    }
  } catch {
    console.log("[auth-token] could not decode token for freshness logging");
  }
}

export async function getAuthTokenAsync(): Promise<string | null> {
  if (!tokenGetter) {
    if (import.meta.env.DEV) {
      console.warn("[auth-token] no token getter registered yet (Clerk not loaded?)");
    }
    return null;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = await tokenGetter();
    if (token) {
      logTokenFreshness(token);
      return token;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  if (import.meta.env.DEV) {
    console.warn(
      "[auth-token] token getter returned null after retries (signed out or Clerk session missing)",
    );
  }
  return null;
}
