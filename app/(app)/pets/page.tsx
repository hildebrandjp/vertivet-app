import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { ButtonLink } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import {
  CheckIcon,
  ClockIcon,
  HeartIcon,
  PlusIcon,
} from "@/app/shared/ui/icons";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { Skeleton } from "@/app/shared/ui/Skeleton";
import { StatusPanel } from "@/app/shared/ui/StatusPanel";
import { Heading, Text } from "@/app/shared/ui/Typography";
import { pluralize } from "@/app/shared/utils/text";
import { getPets, getUpcomingVisits } from "../_lib/data/dal";
import { formatAppointmentDate, formatAppointmentTime } from "../_lib/format";
import { ClinicalRecords } from "./_components/ClinicalRecords";
import { PetProfileCard } from "./_components/PetProfileCard";
import styles from "./pets.module.css";

export const metadata: Metadata = { title: "My Pets · VertiVet" };

function SummaryCard({
  icon,
  label,
  children,
  success = false,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  success?: boolean;
}) {
  return (
    <Card className={styles.stat}>
      <span className={styles.icon} data-success={success || undefined}>
        {icon}
      </span>
      <div>
        <Text variant="supporting" tone="muted">
          {label}
        </Text>
        {children}
      </div>
    </Card>
  );
}

async function PetsOverview() {
  const [pets, visits] = await Promise.all([getPets(), getUpcomingVisits(50)]);
  const today = new Date();
  const nextVisit = visits
    .filter(
      (visit) =>
        visit.pet &&
        (visit.status === "confirmed" || visit.status === "pending") &&
        Date.parse(visit.startsAt) >= today.getTime(),
    )
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0];
  const vaccinations = pets.flatMap((pet) =>
    (pet.preventiveCare ?? []).filter(({ kind }) => kind === "vaccination"),
  );
  const attentionCount = vaccinations.filter(
    ({ status }) => status === "due" || status === "overdue",
  ).length;
  const allPetsHaveVaccinations = pets.every((pet) =>
    pet.preventiveCare?.some(({ kind }) => kind === "vaccination"),
  );
  const allCurrent =
    allPetsHaveVaccinations &&
    vaccinations.length > 0 &&
    vaccinations.every(({ status }) => status === "current");
  const vaccinationStatus = attentionCount
    ? `${pluralize(attentionCount, "dose")} due`
    : allCurrent
      ? "Up to date"
      : vaccinations.length
        ? "Review records"
        : "No records";

  if (!pets.length) {
    return (
      <Card padding="lg">
        <StatusPanel tone="info" title="No pets yet" icon={<HeartIcon />}>
          Add a pet to book visits and see their care history here.
        </StatusPanel>
      </Card>
    );
  }

  return (
    <>
      <div className={styles.summary}>
        <SummaryCard icon={<HeartIcon />} label="Registered Pets">
          <Heading as="p" level={3}>
            {pluralize(pets.length, "Pet")}
          </Heading>
        </SummaryCard>
        <SummaryCard icon={<ClockIcon />} label="Next Upcoming Visit">
          <Heading as="p" level={3}>
            {nextVisit ? (
              <time dateTime={nextVisit.startsAt}>
                {formatAppointmentDate(nextVisit.startsAt)} ·{" "}
                {formatAppointmentTime(nextVisit.startsAt)}
              </time>
            ) : (
              "No visit scheduled"
            )}
          </Heading>
          {nextVisit?.pet && (
            <Text tone="primary" variant="small">
              {nextVisit.pet.name}
              {nextVisit.status === "pending" ? " · Pending" : ""}
            </Text>
          )}
        </SummaryCard>
        <SummaryCard
          icon={<CheckIcon />}
          label="Vaccination Status"
          success={allCurrent}
        >
          <Heading as="p" level={3}>
            {vaccinationStatus}
          </Heading>
        </SummaryCard>
      </div>
      <div className={styles.profiles}>
        {pets.map((pet) => (
          <PetProfileCard key={pet.id} pet={pet} today={today} />
        ))}
      </div>
      <ClinicalRecords pets={pets} />
    </>
  );
}

function PetsSkeleton() {
  return (
    <div className={styles.profiles} aria-busy="true">
      <span className="sr-only">Loading pets…</span>
      <Skeleton shape="rect" height="12rem" />
      <Skeleton shape="rect" height="12rem" />
    </div>
  );
}

export default function PetsPage() {
  return (
    <div className={styles.page}>
      <SectionHeader
        as="h1"
        title="My Pets & Patients"
        description="Manage profiles, health records, vaccination schedules, and care history."
        actions={
          <ButtonLink href={ROUTES.newPet} startIcon={<PlusIcon />}>
            Add New Pet
          </ButtonLink>
        }
      />
      <Suspense fallback={<PetsSkeleton />}>
        <PetsOverview />
      </Suspense>
    </div>
  );
}
