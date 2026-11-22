"use client";

import { useState } from "react";
import { Button } from "@/app/shared/ui/Button";
import { Dialog } from "@/app/shared/ui/Dialog";
import { Field } from "@/app/shared/ui/Field";
import { TextArea } from "@/app/shared/ui/TextArea";
import { formatFullDay, formatSlotTime } from "../../../_lib/format";
import { downloadBookingFile } from "../_lib/booking-export";
import type { BookingConfirmationData } from "../_lib/confirmation";
import styles from "./confirmation.module.css";

/** Preparation notes are downloaded for the clinic; no false server save. */
export function BookingPreVisitForm({
  data,
  open,
  onOpenChange,
}: {
  data: BookingConfirmationData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [concerns, setConcerns] = useState(data.notes);
  const [medications, setMedications] = useState("");
  const [feedback, setFeedback] = useState("");
  const download = () => {
    const contents = [
      "VertiVet Pre-Visit Form",
      `Patient: ${data.pet.name} (${data.pet.breed})`,
      `Service: ${data.service.name}`,
      `Visit: ${formatFullDay(data.date)} at ${formatSlotTime(data.time)} (${data.timeZone})`,
      data.id ? `Booking ID: ${data.id}` : "",
      "",
      "Reason for visit / concerns",
      concerns || "None provided",
      "",
      "Current medications / allergies",
      medications || "None provided",
      "",
      "Please bring this form and vaccination records to your appointment.",
    ].join("\n");
    downloadBookingFile(
      contents,
      "text/plain;charset=utf-8",
      "vertivet-pre-visit-form.txt",
    );
    setFeedback(
      "Form downloaded. Bring it to your visit; these notes have not been sent to the clinic.",
    );
  };
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Prepare for Your Visit"
      description="Complete and download this form to bring to your appointment."
      size="md"
      showCloseButton
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={download}>Download Form</Button>
        </>
      }
    >
      <div className={styles.preVisitFields}>
        <Field label="Reason for visit / concerns">
          <TextArea
            rows={3}
            maxLength={2000}
            value={concerns}
            onChange={(event) => setConcerns(event.target.value)}
          />
        </Field>
        <Field label="Current medications / allergies">
          <TextArea
            rows={3}
            maxLength={2000}
            value={medications}
            onChange={(event) => setMedications(event.target.value)}
          />
        </Field>
        <output className={styles.formFeedback}>{feedback}</output>
      </div>
    </Dialog>
  );
}
