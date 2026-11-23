import "server-only";
import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import { apiRequest } from "@/app/shared/server/api-client";
import { requireClinician } from "@/app/shared/server/clinical-session";
import { selectDemoClients } from "./client-directory";
import { getDemoPractice } from "./demo";
import {
  groupRegistryOwners,
  REGISTRY_PAGE_SIZE,
  type RegistryOwner,
  type RegistryPage,
  type RegistryQuery,
  selectDemoRegistry,
} from "./registry";

export async function getRegistry(query: RegistryQuery): Promise<RegistryPage> {
  const session = await requireClinician();
  if (session.demo) {
    const { overview, clients } = await getDemoPractice();
    return query.tab === "owners"
      ? selectDemoClients(overview, clients, query)
      : selectDemoRegistry(overview, query);
  }
  const params = new URLSearchParams({
    tab: query.tab,
    page: String(query.page),
    pageSize: String(REGISTRY_PAGE_SIZE),
    q: query.query,
  });
  if (query.species && query.tab !== "owners")
    params.set("species", query.species);
  if (query.tab === "owners" && query.recent) params.set("recent", "1");
  const result = await apiRequest<RegistryPage>(
    `/clinical/registry?${params}`,
    { token: session.token },
  );
  if (!result.ok && result.status === 401) redirect(ROUTES.clinicalLogin);
  if (!result.ok || !result.data)
    throw new Error("Could not load the patient registry.");
  return result.data;
}

export async function getClientDirectory(): Promise<RegistryOwner[] | null> {
  const session = await requireClinician();
  if (session.demo) {
    const { overview, clients } = await getDemoPractice();
    return groupRegistryOwners(overview.patients, clients);
  }
  const result = await apiRequest<RegistryOwner[]>(
    "/clinical/registry/clients",
    { token: session.token },
  );
  if (!result.ok && result.status === 401) redirect(ROUTES.clinicalLogin);
  return result.ok ? result.data : null;
}
