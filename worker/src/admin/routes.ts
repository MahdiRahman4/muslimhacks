import type { Env } from "../env";
import { handleAdminApplicationRoutes } from "./applications";
import { handleAdminChallengeRoutes } from "./challenges";
import { handleAdminEventOpsRoutes } from "./event-ops";
import { handleAdminReportRoutes } from "./reports";
import { handleAdminParticipantRoutes } from "./participants";
import { handleAdminUserRoutes } from "./users";

type JsonResponder = (body: unknown, status?: number) => Response;

export async function handleAdminRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const challengeRoute = await handleAdminChallengeRoutes(request, env, respond);
  if (challengeRoute) {
    return challengeRoute;
  }

  const eventOpsRoute = await handleAdminEventOpsRoutes(request, env, respond);
  if (eventOpsRoute) {
    return eventOpsRoute;
  }

  const reportRoute = await handleAdminReportRoutes(request, env, respond);
  if (reportRoute) {
    return reportRoute;
  }

  const participantRoute = await handleAdminParticipantRoutes(request, env, respond);
  if (participantRoute) {
    return participantRoute;
  }

  const userRoute = await handleAdminUserRoutes(request, env, respond);
  if (userRoute) {
    return userRoute;
  }

  const applicationRoute = await handleAdminApplicationRoutes(request, env, respond);
  if (applicationRoute) {
    return applicationRoute;
  }

  return respond({ error: "Not found" }, 404);
}
