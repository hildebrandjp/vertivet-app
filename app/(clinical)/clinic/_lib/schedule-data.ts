import "server-only";
import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import { apiRequest } from "@/app/shared/server/api-client";
import { requireClinician } from "@/app/shared/server/clinical-session";
import { getDemoSchedule } from "./demo";
import {
  type ClinicSchedule,
  type ScheduleQuery,
  scheduleDates,
} from "./schedule";

export async function getSchedule(
  query: ScheduleQuery,
): Promise<ClinicSchedule> {
  const session = await requireClinician();
  const dates = scheduleDates(query);
  if (session.demo) return getDemoSchedule(dates);
  const params = new URLSearchParams({
    from: dates[0],
    to: dates[dates.length - 1],
  });
  const result = await apiRequest<ClinicSchedule>(
    `/clinical/schedule?${params}`,
    { token: session.token },
  );
  if (!result.ok && (result.status === 401 || result.status === 403))
    redirect(ROUTES.clinicalLogin);
  if (!result.ok || !result.data)
    throw new Error("Could not load the clinic schedule.");
  return result.data;
}
