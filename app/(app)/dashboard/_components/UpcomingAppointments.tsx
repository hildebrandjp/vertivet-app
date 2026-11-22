import { ROUTES } from "@/app/shared/config/routes";
import { ButtonLink } from "@/app/shared/ui/Button";
import { StatusPanel } from "@/app/shared/ui/StatusPanel";
import { getUpcomingVisits } from "../../_lib/data/dal";
import { AppointmentsTable } from "./AppointmentsTable";
import styles from "./DashboardPanels.module.css";

/** Streams the next appointments; renders an empty state when there are none. */
export async function UpcomingAppointments({ limit }: { limit: number }) {
  const visits = await getUpcomingVisits(limit);
  const today = new Date();

  if (visits.length === 0) {
    return (
      <div className={styles.emptyCard}>
        <StatusPanel
          tone="info"
          title="No upcoming appointments"
          headingLevel={3}
          actions={
            <ButtonLink href={ROUTES.newAppointment}>
              Book appointment
            </ButtonLink>
          }
        >
          Book a visit and it will show up here.
        </StatusPanel>
      </div>
    );
  }

  return (
    <AppointmentsTable
      visits={visits}
      today={today}
      caption="Upcoming appointments"
    />
  );
}
