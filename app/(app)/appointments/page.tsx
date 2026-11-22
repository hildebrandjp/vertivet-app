import type { Metadata } from "next";
import { Suspense } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { ButtonLink } from "@/app/shared/ui/Button";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { AppointmentsTableSkeleton } from "../dashboard/_components/AppointmentsTable";
import { UpcomingAppointments } from "../dashboard/_components/UpcomingAppointments";
import styles from "./appointments.module.css";

export const metadata: Metadata = { title: "Upcoming Appointments · VertiVet" };

/** Reuse the existing appointment data view for the receipt's destination. */
export default function AppointmentsPage() {
  return (
    <div className={styles.page}>
      <SectionHeader
        title="Upcoming Appointments"
        level={2}
        as="h1"
        actions={
          <ButtonLink href={ROUTES.newAppointment}>Book Appointment</ButtonLink>
        }
      />
      <Suspense fallback={<AppointmentsTableSkeleton rows={5} />}>
        <UpcomingAppointments limit={50} />
      </Suspense>
    </div>
  );
}
