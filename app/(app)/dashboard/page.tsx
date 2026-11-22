import type { Metadata } from "next";
import { Suspense } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { ButtonLink } from "@/app/shared/ui/Button";
import { PlusIcon } from "@/app/shared/ui/icons";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { AppointmentsTableSkeleton } from "./_components/AppointmentsTable";
import { ClinicCard } from "./_components/ClinicCard";
import { MyPetsList, MyPetsListSkeleton } from "./_components/MyPets";
import { PetsMenu } from "./_components/PetsMenu";
import { UpcomingAppointments } from "./_components/UpcomingAppointments";
import { WelcomeBanner } from "./_components/WelcomeBanner";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Dashboard · VertiVet",
  description: "Your pets' upcoming visits and profiles at a glance.",
};

const UPCOMING_LIMIT = 5;

/**
 * Partial prerendering: headings, buttons, images and skeletons are the
 * static shell (instant); user data streams into each Suspense boundary
 * independently, so a slow list never blocks the rest of the page.
 */
export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <WelcomeBanner />

      <div className={styles.columns}>
        <section className={styles.primary} aria-labelledby="upcoming-title">
          <SectionHeader
            id="upcoming-title"
            title="Upcoming Appointments"
            actions={
              <ButtonLink
                href={ROUTES.appointments}
                variant="secondary"
                size="sm"
              >
                View All
              </ButtonLink>
            }
          />
          <Suspense
            fallback={<AppointmentsTableSkeleton rows={UPCOMING_LIMIT} />}
          >
            <UpcomingAppointments limit={UPCOMING_LIMIT} />
          </Suspense>
        </section>

        <aside className={styles.secondary} aria-label="Clinic and pets">
          <ClinicCard />
          <section className={styles.pets} aria-labelledby="pets-title">
            <SectionHeader
              id="pets-title"
              title="My Pets"
              level={4}
              as="h2"
              actions={<PetsMenu />}
            />
            <Suspense fallback={<MyPetsListSkeleton />}>
              <MyPetsList />
            </Suspense>
            <ButtonLink
              href={ROUTES.newPet}
              variant="secondary"
              size="lg"
              fullWidth
              startIcon={<PlusIcon />}
            >
              Add New Profile
            </ButtonLink>
          </section>
        </aside>
      </div>
    </div>
  );
}
