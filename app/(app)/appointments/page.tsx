import type { Metadata } from "next";
import { Suspense } from "react";
import { APP_TIME_ZONE } from "@/app/shared/config/locale";
import { ROUTES } from "@/app/shared/config/routes";
import { ButtonLink } from "@/app/shared/ui/Button";
import { PlusIcon } from "@/app/shared/ui/icons";
import { Pagination } from "@/app/shared/ui/Pagination";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { todayInTimeZone } from "@/app/shared/utils/date";
import { getAppointments, getPets } from "../_lib/data/dal";
import { AppointmentsTableSkeleton } from "../dashboard/_components/AppointmentsTable";
import { OwnerVisitsTable } from "./_components/OwnerVisitsTable";
import { VisitFilters } from "./_components/VisitFilters";
import { readVisitQuery, selectVisits, visitListHref } from "./_lib/visits";
import styles from "./appointments.module.css";

export const metadata: Metadata = { title: "Appointments & Visits · VertiVet" };

const PAGE_SIZE = 5;

type ListProps = Pick<PageProps<"/appointments">, "searchParams">;

async function AppointmentList({ searchParams }: ListProps) {
  const [pets, visits, params] = await Promise.all([
    getPets(),
    getAppointments(),
    searchParams,
  ]);
  const query = readVisitQuery(params);
  const now = new Date();
  const { rows, counts, currentPage, pageCount, total, offset } = selectVisits(
    visits,
    query,
    +now,
    PAGE_SIZE,
  );
  const petsById = new Map(pets.map((pet) => [pet.id, pet]));
  const pageRows = rows.map((visit) => ({
    ...visit,
    pet: petsById.get(visit.petId) ?? null,
  }));

  return (
    <>
      <VisitFilters pets={pets} query={query} counts={counts} />
      <div className={styles.panel}>
        <OwnerVisitsTable
          visits={pageRows}
          now={+now}
          today={todayInTimeZone(APP_TIME_ZONE, now)}
        />
        <footer className={styles.footer}>
          <p>
            {total > 0
              ? `Showing ${offset + 1} to ${offset + rows.length} of ${total} appointments`
              : "Showing 0 appointments"}
          </p>
          {pageCount > 1 && (
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              getPageHref={(page) => visitListHref({ ...query, page })}
              aria-label="Appointment pages"
              previousLabel="Previous"
            />
          )}
        </footer>
      </div>
    </>
  );
}

export default function AppointmentsPage({
  searchParams,
}: PageProps<"/appointments">) {
  return (
    <div className={styles.page}>
      <SectionHeader
        title="Appointments & Visits"
        description="Review upcoming visits, consultation history, and book new veterinary care."
        as="h1"
        actions={
          <ButtonLink href={ROUTES.newAppointment} startIcon={<PlusIcon />}>
            Book Appointment
          </ButtonLink>
        }
      />
      <Suspense fallback={<AppointmentsTableSkeleton rows={PAGE_SIZE} />}>
        <AppointmentList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
