/**
 * Navigation map of the signed-in app: sidebar links, breadcrumbs and
 * quick-search destinations all read from here. Pure data (client-safe).
 */
import { ROUTES } from "@/app/shared/config/routes";
import type { BreadcrumbItem } from "@/app/shared/ui/Breadcrumb";

export type NavId =
  | "dashboard"
  | "pets"
  | "appointments"
  | "medicalRecords"
  | "settings";

export interface NavEntry {
  id: NavId;
  href: string;
  label: string;
}

export const APP_NAV: NavEntry[] = [
  { id: "dashboard", href: ROUTES.dashboard, label: "Dashboard" },
  { id: "pets", href: ROUTES.pets, label: "Pets" },
  { id: "appointments", href: ROUTES.appointments, label: "Appointments" },
  {
    id: "medicalRecords",
    href: ROUTES.medicalRecords,
    label: "Medical Records",
  },
  { id: "settings", href: ROUTES.settings, label: "Settings" },
];

/** Shortcuts offered by quick search in addition to the nav pages. */
export const QUICK_ACTIONS = [
  { href: ROUTES.newAppointment, label: "Book appointment" },
  { href: ROUTES.newPet, label: "Add new pet profile" },
] as const;

/** Explicit trails; other paths fall back to their top-level nav entry. */
const BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  [ROUTES.dashboard]: [
    { label: "Dashboard", href: ROUTES.dashboard },
    { label: "Upcoming Appointments" },
  ],
  [ROUTES.newAppointment]: [
    { label: "Appointments", href: ROUTES.appointments },
    { label: "Book an Appointment" },
  ],
};

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const explicit = BREADCRUMBS[pathname];
  if (explicit) return explicit;
  const section = APP_NAV.find(
    (entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`),
  );
  return section ? [{ label: section.label }] : [{ label: "Dashboard" }];
}
