import type { Env } from "../env";
import { handleAdminApplicationRoutes } from "./applications";
import { handleAdminEventOpsRoutes } from "./event-ops";
import { handleAdminReportRoutes } from "./reports";
import { handleAdminParticipantRoutes } from "./participants";

type JsonResponder = (body: unknown, status?: number) => Response;

export async function handleAdminRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
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

  const applicationRoute = await handleAdminApplicationRoutes(request, env, respond);
  if (applicationRoute) {
    return applicationRoute;
  }

  return respond({ error: "Not found" }, 404);
}
