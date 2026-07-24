import type { AuthUser, JwtPayload, Role } from "./types";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function base64UrlEncode(data: Uint8Array | string): string {
  const bytes =
    typeof data === "string" ? new TextEncoder().encode(data) : data;
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

async function hmacVerify(data: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlDecode(signature),
    encoder.encode(data),
  );
}

function isRole(value: unknown): value is Role {
  return value === "applicant" || value === "volunteer" || value === "admin";
}

export async function signToken(user: AuthUser, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSign(`${header}.${body}`, secret);

  return `${header}.${body}.${signature}`;
}

export async function verifyToken(token: string, secret: string): Promise<JwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [header, body, signature] = parts;
  const valid = await hmacVerify(`${header}.${body}`, signature, secret);
  if (!valid) {
    return null;
  }

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as JwtPayload;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      !isRole(payload.role) ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice(7).trim();
  return token || null;
}
