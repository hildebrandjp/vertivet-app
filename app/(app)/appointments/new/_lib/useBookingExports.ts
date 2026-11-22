"use client";

import { useState } from "react";
import { formatFullDay, formatSlotTime } from "../../../_lib/format";
import { createBookingCalendar, downloadBookingFile } from "./booking-export";
import type { BookingConfirmationData } from "./confirmation";

/** Browser capabilities and feedback stay outside receipt presentation. */
export function useBookingExports(data: BookingConfirmationData) {
  const [feedback, setFeedback] = useState("");
  const [shareText, setShareText] = useState<string | null>(null);
  const text = [
    `VertiVet appointment ${data.status === "confirmed" ? "confirmed" : "requested"}`,
    `${data.pet.name} — ${data.service.name}`,
    `${formatFullDay(data.date)} at ${formatSlotTime(data.time)} (${data.timeZone})`,
    data.location,
    data.provider,
    data.id ? `Booking ID: ${data.id}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const addToCalendar = () => {
    downloadBookingFile(
      createBookingCalendar(data),
      "text/calendar;charset=utf-8",
      "vertivet-appointment.ics",
    );
    setFeedback(
      "Calendar file downloaded. Open it to add this visit to your calendar.",
    );
  };
  const printReceipt = () => {
    setFeedback(
      "Choose Save as PDF in the print dialog to download your receipt.",
    );
    window.print();
  };
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "VertiVet appointment", text });
        setFeedback("Appointment details shared.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setFeedback("Appointment details copied to clipboard.");
      } else setShareText(text);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareText(text);
    }
  };
  return {
    addToCalendar,
    printReceipt,
    share,
    feedback,
    shareText,
    closeShare: () => setShareText(null),
  };
}
