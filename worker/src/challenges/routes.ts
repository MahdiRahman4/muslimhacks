import type { Env } from "../env";
import type { AuthUser } from "../auth/types";
import {
  CHALLENGES,
  getChallenge,
  ipGrantText,
  publicChallenge,
} from "./catalog";

type JsonResponder = (body: unknown, status?: number) => Response;

interface SignupRow {
  challenge_id: string;
  ip_acknowledged: number;
}

interface CountRow {
  challenge_id: string;
  team_count: number;
}

async function requireApproved(
  env: Env,
  user: AuthUser,
  respond: JsonResponder,
): Promise<true | Response> {
  const application = await env.DB.prepare(
    "SELECT status FROM applications WHERE user_id = ? LIMIT 1",
  )
    .bind(user.id)
    .first<{ status: string }>();

  if (!application || application.status !== "approved") {
    return respond({ error: "Only accepted participants can choose a challenge." }, 403);
  }

  return true;
}

async function teamCounts(env: Env): Promise<Map<string, number>> {
  const result = await env.DB.prepare(
    "SELECT challenge_id, COUNT(*) AS team_count FROM challenge_signups GROUP BY challenge_id",
  ).all<CountRow>();

  const counts = new Map<string, number>();
  for (const row of result.results ?? []) {
    counts.set(row.challenge_id, Number(row.team_count) || 0);
  }
  return counts;
}

async function listChallenges(env: Env, user: AuthUser, respond: JsonResponder) {
  const allowed = await requireApproved(env, user, respond);
  if (allowed !== true) {
    return allowed;
  }

  const [counts, signup] = await Promise.all([
    teamCounts(env),
    env.DB.prepare(
      "SELECT challenge_id, ip_acknowledged FROM challenge_signups WHERE user_id = ? LIMIT 1",
    )
      .bind(user.id)
      .first<SignupRow>(),
  ]);

  return respond({
    selected_challenge_id: signup?.challenge_id ?? null,
    challenges: CHALLENGES.map((challenge) => ({
      ...publicChallenge(challenge),
      team_count: counts.get(challenge.id) ?? 0,
    })),
  });
}

async function selectChallenge(
  request: Request,
  env: Env,
  user: AuthUser,
  respond: JsonResponder,
) {
  const allowed = await requireApproved(env, user, respond);
  if (allowed !== true) {
    return allowed;
  }

  let body: { challenge_id?: unknown; ip_acknowledged?: unknown };
  try {
    body = (await request.json()) as { challenge_id?: unknown; ip_acknowledged?: unknown };
  } catch {
    return respond({ error: "Invalid request." }, 400);
  }

  const challengeId = typeof body.challenge_id === "string" ? body.challenge_id : "";
  const challenge = getChallenge(challengeId);
  if (!challenge) {
    return respond({ error: "That challenge is not available." }, 400);
  }

  const acknowledged = body.ip_acknowledged === true;
  if (challenge.requiresIpGrant && !acknowledged) {
    return respond(
      {
        error: "ip_acknowledgment_required",
        message: ipGrantText(challenge.ipOwner || "the challenge sponsor"),
        ip_owner: challenge.ipOwner,
      },
      400,
    );
  }

  const now = Date.now();
  const ipAcknowledged = challenge.requiresIpGrant ? 1 : 0;
  const ipAcknowledgedAt = challenge.requiresIpGrant ? now : null;
  const ipOwner = challenge.requiresIpGrant ? challenge.ipOwner : null;

  await env.DB.prepare(
    `INSERT INTO challenge_signups (
        id, user_id, challenge_id, signed_up_at, ip_acknowledged, ip_acknowledged_at, ip_owner
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        challenge_id = excluded.challenge_id,
        signed_up_at = excluded.signed_up_at,
        ip_acknowledged = excluded.ip_acknowledged,
        ip_acknowledged_at = excluded.ip_acknowledged_at,
        ip_owner = excluded.ip_owner`,
  )
    .bind(
      crypto.randomUUID(),
      user.id,
      challenge.id,
      now,
      ipAcknowledged,
      ipAcknowledgedAt,
      ipOwner,
    )
    .run();

  const counts = await teamCounts(env);

  return respond({
    selected_challenge_id: challenge.id,
    challenges: CHALLENGES.map((item) => ({
      ...publicChallenge(item),
      team_count: counts.get(item.id) ?? 0,
    })),
  });
}

export async function handleChallengeRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
  user: AuthUser | null,
): Promise<Response> {
  const { pathname } = new URL(request.url);
  const { method } = request;

  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }

  if (pathname === "/api/challenges" && method === "GET") {
    return listChallenges(env, user, respond);
  }

  if (pathname === "/api/challenges" && method === "POST") {
    return selectChallenge(request, env, user, respond);
  }

  return respond({ error: "Not found" }, 404);
}
