import "server-only";
import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import { apiRequest } from "@/app/shared/server/api-client";
import { requireClinician } from "@/app/shared/server/clinical-session";
import { changeDemoOrder, getDemoOrders } from "./demo-diagnostics";
import {
  ORDER_PAGE_SIZE,
  type OrderCommand,
  type OrderQuery,
  type OrdersPage,
} from "./diagnostics";

export async function getOrders(query: OrderQuery): Promise<OrdersPage> {
  const session = await requireClinician();
  if (session.demo) return getDemoOrders(query);
  const params = new URLSearchParams({
    status: query.filter,
    q: query.query,
    page: String(query.page),
    pageSize: String(ORDER_PAGE_SIZE),
  });
  const result = await apiRequest<OrdersPage>(
    `/clinical/diagnostics?${params}`,
    { token: session.token },
  );
  if (!result.ok && (result.status === 401 || result.status === 403))
    redirect(ROUTES.clinicalLogin);
  if (!result.ok || !result.data)
    throw new Error("Could not load prescriptions and diagnostics.");
  return result.data;
}

export async function updateOrder(command: OrderCommand): Promise<boolean> {
  const session = await requireClinician();
  if (session.clinician.role !== "veterinarian") return false;
  if (session.demo) return changeDemoOrder(command, session.clinician);
  // The API must enforce clinic tenancy, allowed transitions, and audit writes.
  const result = await apiRequest("/clinical/commands", {
    token: session.token,
    method: "POST",
    body: command,
  });
  if (!result.ok && result.status === 401) redirect(ROUTES.clinicalLogin);
  return result.ok;
}
