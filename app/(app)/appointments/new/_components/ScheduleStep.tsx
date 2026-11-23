"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { APP_LOCALE } from "@/app/shared/config/locale";
import { Calendar } from "@/app/shared/ui/Calendar";
import { Card, CardDescription, CardHeader } from "@/app/shared/ui/Card";
import { CalendarIcon } from "@/app/shared/ui/icons";
import { fromISODate, startOfDay, toISODate } from "@/app/shared/utils/date";
import type { ServiceOffering, TimeSlot } from "../../../_lib/data/types";
import { formatFullDay } from "../../../_lib/format";
import { useSlots } from "../../_lib/useSlots";
import { type BookingDraft, bookingWindow } from "../_lib/booking";
import { SlotsPanel } from "./SlotsPanel";
import styles from "./schedule.module.css";

// The picker (wheels, dialog) is fetched the first time a date is clicked.
const SlotPickerDialog = dynamic(() =>
  import("./SlotPickerDialog").then((mod) => mod.SlotPickerDialog),
);

interface ScheduleStepProps {
  service: ServiceOffering;
  draft: BookingDraft;
  onChange: (patch: Partial<BookingDraft>) => void;
  /** Called after a time is confirmed in the picker. */
  onContinue: () => void;
  slotCache: Map<string, TimeSlot[]>;
}

function SelectedDate({ date }: { date: string | null }) {
  return (
    <div className={styles.selectedDate} aria-live="polite">
      <span className={styles.selectedIcon} aria-hidden="true">
        <CalendarIcon />
      </span>
      <span className={styles.selectedText}>
        <span className={styles.selectedLabel}>Selected date</span>
        <span className={styles.selectedValue}>
          {date ? formatFullDay(date) : "No date selected yet"}
        </span>
      </span>
    </div>
  );
}

/**
 * Step 2: calendar on the left. Clicking a day loads its slots (the panel
 * shows "Opening slots…") and then opens the Available Slots picker.
 */
export function ScheduleStep({
  service,
  draft,
  onChange,
  onContinue,
  slotCache,
}: ScheduleStepProps) {
  // Client-only step (never server-rendered), so "today" is the user's today.
  const { min, max } = useMemo(() => bookingWindow(startOfDay(new Date())), []);
  const [slots, retry] = useSlots(service.id, draft.date, slotCache);
  // Which day the picker was requested for; it opens once that day's slots are ready.
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const selected = draft.date ? fromISODate(draft.date) : null;

  const pickerSlots =
    pickerFor && pickerFor === draft.date && slots.status === "ready"
      ? slots.slots
      : null;
  const showPicker = pickerSlots?.some((slot) => slot.available) ?? false;

  return (
    <div className={styles.layout}>
      <div className={styles.calendarColumn}>
        <Card padding="lg" className={styles.calendarCard}>
          <CardHeader>
            <h2 className={styles.panelTitle}>
              <CalendarIcon className={styles.headerIcon} />
              Appointment Calendar
            </h2>
            <CardDescription>
              Click a date to see available time slots for that day.
            </CardDescription>
          </CardHeader>
          <Calendar
            variant="plain"
            size="lg"
            weekStartsOn={0}
            locale={APP_LOCALE}
            min={min}
            max={max}
            defaultMonth={min}
            value={selected}
            showSelectedLabel={false}
            onChange={(date) => {
              const iso = toISODate(date);
              onChange({ date: iso });
              setPickerFor(iso);
            }}
          />
        </Card>
        <SelectedDate date={draft.date} />
      </div>

      <SlotsPanel
        service={service}
        date={draft.date}
        time={draft.time}
        view={slots}
        onRetry={retry}
        onOpenPicker={() => setPickerFor(draft.date)}
      />

      {showPicker && pickerSlots && draft.date ? (
        <SlotPickerDialog
          date={draft.date}
          service={service}
          slots={pickerSlots}
          currentTime={draft.time}
          onClose={() => setPickerFor(null)}
          onConfirm={(time) => {
            onChange({ time });
            setPickerFor(null);
            onContinue();
          }}
        />
      ) : null}
    </div>
  );
}
