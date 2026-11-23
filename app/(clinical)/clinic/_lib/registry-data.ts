import "server-only";
import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import { apiRequest } from "@/app/shared/server/api-client";
import { requireClinician } from "@/app/shared/server/clinical-session";
import { getDemoOverview } from "./demo";
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
  if (session.demo) return selectDemoRegistry(await getDemoOverview(), query);
  const params = new URLSearchParams({
    tab: query.tab,
    page: String(query.page),
    pageSize: String(REGISTRY_PAGE_SIZE),
    q: query.query,
  });
  if (query.species) params.set("species", query.species);
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
  if (session.demo)
    return groupRegistryOwners((await getDemoOverview()).patients);
  const result = await apiRequest<RegistryOwner[]>(
    "/clinical/registry/clients",
    { token: session.token },
  );
  if (!result.ok && result.status === 401) redirect(ROUTES.clinicalLogin);
  return result.ok ? result.data : null;
}
