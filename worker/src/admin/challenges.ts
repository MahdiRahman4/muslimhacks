import type { Env } from "../env";
import { requireAdmin, type JsonResponder } from "./auth";
import {
  CHALLENGES,
  PPLUS_SECTION_TITLE,
  SPONSOR_SECTION_TITLE,
  getChallenge,
} from "../challenges/catalog";
import {
  buildCsv,
  csvDownloadResponse,
  exportFilename,
  formatCsvBoolean,
  formatCsvTimestamp,
} from "./csv";

interface PickRow {
  user_id: string;
  email: string;
  full_name: string | null;
  challenge_id: string;
  signed_up_at: number;
  ip_acknowledged: number;
  ip_owner: string | null;
}

function toPick(row: PickRow) {
  const challenge = getChallenge(row.challenge_id);
  return {
    user_id: row.user_id,
    email: row.email,
    full_name: row.full_name,
    challenge_id: row.challenge_id,
    challenge_title: challenge?.title ?? row.challenge_id,
    challenge_group: challenge?.group ?? "pplus",
    signed_up_at: row.signed_up_at,
    ip_acknowledged: row.ip_acknowledged === 1,
    ip_owner: row.ip_owner,
  };
}

async function fetchPicks(env: Env): Promise<PickRow[]> {
  const result = await env.DB.prepare(
    `SELECT
        cs.user_id,
        u.email,
        COALESCE(a.full_name, p.full_name) AS full_name,
        cs.challenge_id,
        cs.signed_up_at,
        cs.ip_acknowledged,
        cs.ip_owner
      FROM challenge_signups cs
      JOIN users u ON u.id = cs.user_id
      LEFT JOIN applications a ON a.user_id = cs.user_id
      LEFT JOIN participants p ON p.user_id = cs.user_id
      ORDER BY cs.signed_up_at DESC`,
  ).all<PickRow>();

  return result.results ?? [];
}

async function listAdminChallenges(env: Env, respond: JsonResponder) {
  const picks = await fetchPicks(env);
  const mapped = picks.map(toPick);
  const countById = new Map<string, number>();
  for (const pick of mapped) {
    countById.set(pick.challenge_id, (countById.get(pick.challenge_id) ?? 0) + 1);
  }

  return respond({
    sections: {
      pplus: PPLUS_SECTION_TITLE,
      sponsor: SPONSOR_SECTION_TITLE,
    },
    challenges: CHALLENGES.map((challenge) => ({
      id: challenge.id,
      group: challenge.group,
      number: challenge.number,
      title: challenge.title,
      requires_ip_grant: challenge.requiresIpGrant,
      team_count: countById.get(challenge.id) ?? 0,
    })),
    picks: mapped,
    total_picks: mapped.length,
  });
}

async function exportAdminChallenges(
  request: Request,
  env: Env,
  corsOrigin: string,
) {
  const picks = (await fetchPicks(env)).map(toPick);
  const csv = buildCsv(
    [
      "full_name",
      "email",
      "challenge_id",
      "challenge_title",
      "challenge_group",
      "signed_up_at",
      "ip_acknowledged",
      "ip_owner",
    ],
    picks.map((pick) => [
      pick.full_name,
      pick.email,
      pick.challenge_id,
      pick.challenge_title,
      pick.challenge_group,
      formatCsvTimestamp(pick.signed_up_at),
      formatCsvBoolean(pick.ip_acknowledged),
      pick.ip_owner,
    ]),
  );

  return csvDownloadResponse(
    exportFilename("challenge-picks"),
    csv,
    corsOrigin,
    request.headers.get("Origin"),
  );
}

export async function handleAdminChallengeRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  const { method } = request;

  if (!pathname.startsWith("/api/admin/challenges")) {
    return null;
  }

  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }

  if (pathname === "/api/admin/challenges" && method === "GET") {
    return listAdminChallenges(env, respond);
  }

  if (pathname === "/api/admin/challenges/export" && method === "GET") {
    return exportAdminChallenges(request, env, env.CORS_ORIGIN || "*");
  }

  return respond({ error: "Not found" }, 404);
}
