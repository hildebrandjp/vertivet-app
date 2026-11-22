import Image from "next/image";
import { Button } from "@/app/shared/ui/Button";
import { Card, CardHeader } from "@/app/shared/ui/Card";
import { ChevronLeftIcon, ChevronRightIcon } from "@/app/shared/ui/icons";
import { BOOKING_TIPS } from "../../../_lib/content";
import styles from "./review.module.css";

export function BookingReviewActions({
  pending,
  onBack,
}: {
  pending: boolean;
  onBack: () => void;
}) {
  return (
    <Card padding="lg" className={styles.actions}>
      <CardHeader divider>
        <h2 className={styles.asideTitle}>Final Actions</h2>
      </CardHeader>
      <Button
        type="submit"
        fullWidth
        loading={pending}
        endIcon={<ChevronRightIcon />}
      >
        {pending ? "Submitting booking…" : "Confirm Booking"}
      </Button>
      <Button
        variant="secondary"
        fullWidth
        disabled={pending}
        startIcon={<ChevronLeftIcon />}
        onClick={onBack}
      >
        Back to Selection
      </Button>
      <section className={styles.policy} aria-label="Cancellation policy">
        <h3>Cancellation Policy</h3>
        <p>{BOOKING_TIPS.find((tip) => tip.id === "cancellation")?.body}</p>
        <p>Changes subject to availability.</p>
        <p>Please bring your pet’s vaccination records to check-in.</p>
      </section>
    </Card>
  );
}

export function BookingCareCard() {
  return (
    <Card padding="lg" className={styles.care}>
      <Image
        src="/images/auth/hero-pets.svg"
        alt=""
        width={480}
        height={460}
        className={styles.careImage}
      />
      <p>We treat your pets like our own family.</p>
    </Card>
  );
}
