import type { Env } from "../env";
import type { AuthUser } from "../auth/types";
import { getParticipantByUserId } from "./service";

type JsonResponder = (body: unknown, status?: number) => Response;

export async function handleParticipantRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
  user: AuthUser | null,
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }

  if (pathname === "/api/participants/me" && method === "GET") {
    const application = await env.DB.prepare(
      "SELECT status FROM applications WHERE user_id = ? LIMIT 1",
    )
      .bind(user.id)
      .first<{ status: string }>();

    if (!application || application.status !== "approved") {
      return respond({ participant: null });
    }

    const participant = await getParticipantByUserId(env, user.id);
    if (!participant) {
      return respond({ participant: null });
    }

    return respond({
      participant: {
        checkin_code: participant.public_checkin_code,
        checkin_status: participant.checkin_status,
        checked_in_at: participant.checked_in_at,
      },
    });
  }

  return respond({ error: "Not found" }, 404);
}
