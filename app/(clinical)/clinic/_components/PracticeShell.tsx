import Link from "next/link";
import type { ReactNode } from "react";
import { MobileNav } from "@/app/(app)/_components/MobileNav";
import shellStyles from "@/app/(app)/app-shell.module.css";
import { ROUTES } from "@/app/shared/config/routes";
import type { Clinician } from "@/app/shared/server/clinical-session";
import { Avatar } from "@/app/shared/ui/Avatar";
import { Badge } from "@/app/shared/ui/Badge";
import { Breadcrumb } from "@/app/shared/ui/Breadcrumb";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import { InputGroup } from "@/app/shared/ui/InputGroup";
import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  HeartIcon,
  HomeIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  StethoscopeIcon,
} from "@/app/shared/ui/icons";
import { Logo } from "@/app/shared/ui/Logo";
import { Sidebar } from "@/app/shared/ui/Sidebar";
import { TextInput } from "@/app/shared/ui/TextInput";
import { Text } from "@/app/shared/ui/Typography";
import { cx } from "@/app/shared/utils/cx";
import type { PracticeOverview } from "../_lib/model";
import { logoutClinician } from "../actions";
import styles from "../clinic.module.css";

const VIEWS = [
  { id: "overview", label: "Clinical Overview", icon: HomeIcon },
  { id: "patients", label: "Patients & Pets", icon: HeartIcon },
  { id: "owners", label: "Pet Owners", icon: StethoscopeIcon },
  { id: "queue", label: "Queue Schedule", icon: CalendarIcon },
  { id: "diagnostics", label: "Rx & Diagnostics", icon: FileTextIcon },
  { id: "settings", label: "Clinic Settings", icon: SettingsIcon },
] as const;

export type PracticeView = (typeof VIEWS)[number]["id"];
export function readPracticeView(value: unknown): PracticeView {
  return VIEWS.find(({ id }) => id === value)?.id ?? "overview";
}

const hrefFor = (view: PracticeView) =>
  view === "overview"
    ? ROUTES.clinicalDashboard
    : `${ROUTES.clinicalDashboard}?view=${view}`;

const ROLES = {
  veterinarian: "Veterinarian",
  clinic_staff: "Clinic staff",
  clinic_admin: "Clinic administrator",
};

function PracticeSidebar({
  clinician,
  counts,
  view,
}: {
  clinician: Clinician;
  counts: PracticeOverview["counts"];
  view: PracticeView;
}) {
  const { firstName, lastName, role } = clinician;
  const name =
    [firstName, lastName].filter(Boolean).join(" ") || "Clinic team member";
  const badges = {
    patients: counts.patients,
    owners: counts.owners,
    queue: `${counts.booked} Today`,
  };
  return (
    <Sidebar
      variant="light"
      sectionLabel="Clinical Management"
      aria-label="Clinical navigation"
      activeHref={hrefFor(view)}
      items={VIEWS.map(({ id, label, icon: Icon }) => ({
        href: hrefFor(id),
        label,
        icon: <Icon />,
        match: "exact",
        badge:
          id === "patients" || id === "owners" || id === "queue" ? (
            <Badge size="sm" shape="pill" variant="soft">
              {badges[id]}
            </Badge>
          ) : undefined,
      }))}
      header={
        <Link
          href={ROUTES.clinicalDashboard}
          className={styles.brand}
          aria-label="VertiVet Clinical Portal"
        >
          <Logo size="sm" />
          <Text variant="eyebrow" tone="muted">
            Clinical Portal
          </Text>
        </Link>
      }
      footer={
        <div className={styles.sidebarFooter}>
          <div className={styles.clinician}>
            <Avatar name={name} decorative />
            <div>
              <Text variant="label" tone="heading">
                {name}
              </Text>
              <Text variant="small" tone="muted">
                {ROLES[role]}
              </Text>
            </div>
          </div>
          <form action={logoutClinician}>
            <Button
              type="submit"
              startIcon={<LogOutIcon />}
              variant="secondary"
              fullWidth
            >
              Log Out
            </Button>
          </form>
        </div>
      }
    />
  );
}

export function PracticeShell({
  clinician,
  overview,
  view,
  query,
  children,
}: {
  clinician: Clinician;
  overview: PracticeOverview;
  view: PracticeView;
  query: string;
  children: ReactNode;
}) {
  const active = overview.queue.find(({ status }) => status === "in_exam");
  const isSchedule = view === "queue";
  const isSettings = view === "settings";
  const isDiagnostics = view === "diagnostics";
  const activeName =
    active && overview.patients.find(({ id }) => id === active.patientId)?.name;
  const registryView = view === "patients" || view === "owners";
  const name =
    [clinician.firstName, clinician.lastName].filter(Boolean).join(" ") ||
    "Clinic team member";
  const title =
    view === "overview"
      ? "Doctor’s Practice Overview"
      : view === "owners"
        ? "Pet Owners & Client Directory"
        : isSchedule
          ? "Queue Schedule & Daily Operations"
          : isDiagnostics
            ? "Prescriptions & Lab Diagnostics"
            : isSettings
              ? "Clinical Practice & Operations Settings"
              : registryView
                ? "Patients & Pet Owners Management"
                : (VIEWS.find(({ id }) => id === view)?.label ??
                  "Clinical Portal");
  const sidebar = (
    <PracticeSidebar
      clinician={clinician}
      counts={overview.counts}
      view={view}
    />
  );
  return (
    <div className={cx(shellStyles.shell, styles.shell)}>
      <a href="#clinical-main" className={shellStyles.skipLink}>
        Skip to content
      </a>
      <div className={shellStyles.sidebarSlot}>{sidebar}</div>
      <div className={shellStyles.body}>
        <header className={cx(shellStyles.topbar, styles.topbar)}>
          <MobileNav key={view}>{sidebar}</MobileNav>
          <Breadcrumb
            items={[
              { label: "Clinical Portal", href: ROUTES.clinicalDashboard },
              { label: title },
            ]}
          />
          {isSettings ? null : isSchedule ? (
            <Badge
              variant="soft"
              shape="pill"
              dot
              className={styles.scheduleStatus}
            >
              {overview.room}
              {activeName
                ? ` · ${activeName} in session`
                : active
                  ? " · In Session"
                  : ""}
            </Badge>
          ) : registryView || isDiagnostics ? (
            <ButtonLink
              href={isDiagnostics ? "#diagnostic-search" : "#registry-search"}
              size="sm"
              variant="secondary"
              className={styles.search}
              startIcon={<SearchIcon />}
              aria-label={
                isDiagnostics
                  ? "Go to diagnostic order search"
                  : "Go to registry search"
              }
            />
          ) : (
            <search
              aria-label="Clinical patient lookup"
              className={styles.search}
            >
              <form action={ROUTES.clinicalDashboard} className={styles.inline}>
                <input type="hidden" name="view" value="patients" />
                <InputGroup size="sm" startAddon={<SearchIcon />}>
                  <TextInput
                    name="q"
                    type="search"
                    maxLength={100}
                    defaultValue={query}
                    placeholder="Search patient, chip #, or owner…"
                    aria-label="Search patient, chip number, or owner"
                  />
                </InputGroup>
                <Button type="submit" size="sm" variant="secondary">
                  Search
                </Button>
              </form>
            </search>
          )}
          {!isSchedule && !isDiagnostics && !isSettings && (
            <ButtonLink
              href={`${ROUTES.clinicalDashboard}#clinical-alerts`}
              size="sm"
              variant="secondary"
              startIcon={<BellIcon />}
              aria-label="Clinical alerts"
            />
          )}
          {registryView || isSchedule || isDiagnostics || isSettings ? (
            <div
              className={cx(
                styles.account,
                isSettings && styles.scheduleStatus,
              )}
            >
              <Avatar name={name} decorative />
              <Text variant="label" tone="heading">
                {name}
              </Text>
            </div>
          ) : (
            <Badge variant="soft" shape="pill" dot>
              {overview.room}
              {active ? " (In Session)" : ""}
            </Badge>
          )}
        </header>
        <main
          id="clinical-main"
          tabIndex={-1}
          className={cx(shellStyles.main, styles.main)}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
