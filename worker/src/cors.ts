/** Parse comma-separated CORS_ORIGIN config into individual origins. */
export function parseAllowedOrigins(originConfig: string): string[] {
  return originConfig
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function isOriginAllowed(
  allowed: string[],
  requestOrigin: string,
): boolean {
  if (allowed.includes("*") || allowed.includes(requestOrigin)) {
    return true;
  }
  // Preview / production Vercel URLs for this project
  try {
    const host = new URL(requestOrigin).hostname;
    return (
      host === "muslimhacks.vercel.app" ||
      host.endsWith("-muslim-hacks.vercel.app")
    );
  } catch {
    return false;
  }
}

/** Resolve the Access-Control-Allow-Origin value for a request, or null if denied. */
export function resolveAllowOrigin(
  originConfig: string,
  requestOrigin: string | null,
): string | null {
  const allowed = parseAllowedOrigins(originConfig);
  if (requestOrigin && isOriginAllowed(allowed, requestOrigin)) {
    return requestOrigin;
  }
  return null;
}

export function corsHeaders(
  originConfig: string,
  requestOrigin: string | null,
): HeadersInit {
  const matched = resolveAllowOrigin(originConfig, requestOrigin);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (matched) {
    headers["Access-Control-Allow-Origin"] = matched;
  }

  return headers;
}
