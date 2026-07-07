import type { Env } from "../env";
import { signToken } from "./jwt";
import { authenticate } from "./middleware";
import { hashPassword, verifyPassword } from "./password";
import type { AuthUser, Role } from "./types";

type JsonResponder = (body: unknown, status?: number) => Response;

interface RegisterBody {
  email?: unknown;
  password?: unknown;
}

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim().toLowerCase();
  if (!email.includes("@") || email.length > 254) {
    return null;
  }

  return email;
}

function normalizePassword(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 8) {
    return null;
  }

  return value;
}

function publicUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

async function handleRegister(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const body = await readJson<RegisterBody>(request);
  if (!body) {
    return respond({ error: "Invalid JSON body" }, 400);
  }

  const email = normalizeEmail(body.email);
  const password = normalizePassword(body.password);

  if (!email || !password) {
    return respond({ error: "Valid email and password (min 8 chars) are required" }, 400);
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
    .bind(email)
    .first();

  if (existing) {
    return respond({ error: "Email already registered" }, 409);
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const createdAt = Date.now();
  const role: Role = "applicant";

  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(id, email, passwordHash, role, createdAt)
    .run();

  const user: AuthUser = { id, email, role };
  const token = await signToken(user, env.JWT_SECRET);

  return respond({ token, user: publicUser(user) }, 201);
}

async function handleLogin(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const body = await readJson<LoginBody>(request);
  if (!body) {
    return respond({ error: "Invalid JSON body" }, 400);
  }

  const email = normalizeEmail(body.email);
  const password = normalizePassword(body.password);

  if (!email || !password) {
    return respond({ error: "Valid email and password (min 8 chars) are required" }, 400);
  }

  const row = await env.DB.prepare(
    "SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
  )
    .bind(email)
    .first<{ id: string; email: string; password_hash: string; role: Role }>();

  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return respond({ error: "Invalid email or password" }, 401);
  }

  const user: AuthUser = {
    id: row.id,
    email: row.email,
    role: row.role,
  };

  const token = await signToken(user, env.JWT_SECRET);

  return respond({ token, user: publicUser(user) });
}

async function handleMe(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }

  return respond({ user: publicUser(user) });
}

export async function handleAuthRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  if (pathname === "/api/auth/register" && method === "POST") {
    return handleRegister(request, env, respond);
  }

  if (pathname === "/api/auth/login" && method === "POST") {
    return handleLogin(request, env, respond);
  }

  if (pathname === "/api/auth/me" && method === "GET") {
    return handleMe(request, env, respond);
  }

  return respond({ error: "Not found" }, 404);
}
