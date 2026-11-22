import type { Metadata } from "next";
import { Suspense } from "react";
import { getPets, getServices } from "../../_lib/data/dal";
import { BookingSkeleton } from "./_components/BookingSkeleton";
import { BookingWizard } from "./_components/BookingWizard";

export const metadata: Metadata = {
  title: "Book an appointment · VertiVet",
  description: "Choose a pet, a service and a time for your next visit.",
};

/** Fetches pets and the service catalogue in parallel, then hands off. */
async function BookingLoader() {
  const [pets, services] = await Promise.all([getPets(), getServices()]);
  return <BookingWizard pets={pets} services={services} />;
}

/**
 * The skeleton is part of the prerendered shell; the wizard streams in once
 * the user's pets and the catalogue are loaded. All step changes after that
 * happen on the client with no further navigation.
 */
export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <BookingLoader />
    </Suspense>
  );
}
