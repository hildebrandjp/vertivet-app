"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import { Dialog } from "@/app/shared/ui/Dialog";
import { Field } from "@/app/shared/ui/Field";
import { CalendarIcon, FileTextIcon } from "@/app/shared/ui/icons";
import { TextArea } from "@/app/shared/ui/TextArea";
import { CLINIC_CONTACT } from "../../../_lib/content";
import type { BookingConfirmationData } from "../_lib/confirmation";
import { useBookingExports } from "../_lib/useBookingExports";
import { BookingConfirmationDetails } from "./BookingConfirmationDetails";
import { BookingNextActions } from "./BookingNextActions";
import { BookingPreVisitForm } from "./BookingPreVisitForm";
import styles from "./confirmation.module.css";

export function BookingConfirmation({
  data,
  onBookAnother,
}: {
  data: BookingConfirmationData;
  onBookAnother: () => void;
}) {
  const [preVisitOpen, setPreVisitOpen] = useState(false);
  const exports = useBookingExports(data);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, []);
  const confirmed = data.status === "confirmed";
  return (
    <section
      className={styles.confirmation}
      aria-labelledby="confirmation-title"
    >
      <header className={styles.hero}>
        <div className={styles.successIllustration} aria-hidden="true">
          👍🏽
        </div>
        <h1 id="confirmation-title" ref={heading} tabIndex={-1}>
          {confirmed ? "Appointment Confirmed!" : "Appointment Requested!"}
        </h1>
        <p>
          {confirmed ? (
            <>
              Your appointment{data.provider ? ` with ${data.provider}` : ""}{" "}
              has been successfully scheduled.
            </>
          ) : (
            <>
              Your appointment request has been received. The clinic will
              confirm your visit shortly.
            </>
          )}
          {data.emailSent
            ? " A confirmation email has been sent to your registered address."
            : " Your visit details are ready below."}
        </p>
        <div className={styles.heroActions}>
          <Button onClick={exports.addToCalendar} startIcon={<CalendarIcon />}>
            Add to Calendar
          </Button>
          <ButtonLink href={ROUTES.appointments} variant="secondary">
            View My Appointments
          </ButtonLink>
        </div>
      </header>
      <BookingConfirmationDetails
        data={data}
        footer={
          <div className={styles.exportActions}>
            <Button
              variant="ghost"
              size="sm"
              startIcon={<FileTextIcon />}
              onClick={exports.printReceipt}
              aria-label="Download PDF using the print dialog"
            >
              Download PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={exports.share}>
              Share
            </Button>
          </div>
        }
      />
      <output className={styles.exportFeedback}>{exports.feedback}</output>
      <BookingNextActions
        onBookAnother={onBookAnother}
        onPreVisit={() => setPreVisitOpen(true)}
      />
      <p className={styles.help}>
        Need to reschedule or cancel? You can manage your appointments in the{" "}
        <Link href={ROUTES.appointments}>Appointments section</Link> or call us
        at{" "}
        <a href={`tel:${CLINIC_CONTACT.phoneHref}`}>{CLINIC_CONTACT.phone}</a>.
      </p>
      <BookingPreVisitForm
        data={data}
        open={preVisitOpen}
        onOpenChange={setPreVisitOpen}
      />
      <Dialog
        open={exports.shareText !== null}
        onOpenChange={(open) => {
          if (!open) exports.closeShare();
        }}
        title="Share Appointment Details"
        description="Copy these details to share with someone you trust."
        showCloseButton
        footer={
          <Button variant="secondary" onClick={exports.closeShare}>
            Close
          </Button>
        }
      >
        <Field label="Appointment details">
          <TextArea
            value={exports.shareText ?? ""}
            rows={8}
            readOnly
            onFocus={(event) => event.target.select()}
          />
        </Field>
      </Dialog>
    </section>
  );
}
