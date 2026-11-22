"use client";

import { useMemo, useRef, useState } from "react";
import { Badge } from "@/app/shared/ui/Badge";
import { Button } from "@/app/shared/ui/Button";
import { ChoiceCard, ChoiceGroup } from "@/app/shared/ui/ChoiceCard";
import { Dialog } from "@/app/shared/ui/Dialog";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from "@/app/shared/ui/icons";
import type { ServiceOffering, TimeSlot } from "../../../_lib/data/types";
import {
  formatDuration,
  formatShortDay,
  formatSlotTime,
} from "../../../_lib/format";
import {
  fromParts,
  initialTime,
  SLOT_STATUS,
  slotStatus,
  toParts,
  wheelOptions,
} from "../_lib/slot-time";
import { SlotTimePicker } from "./SlotTimePicker";
import styles from "./slot-dialog.module.css";

/** Quick chips shown before "N Available" expands the list. */
const QUICK_SLOT_COUNT = 4;

interface SlotPickerDialogProps {
  date: string;
  service: ServiceOffering;
  slots: TimeSlot[];
  /** Time already chosen for this date, if any. */
  currentTime: string | null;
  onClose: () => void;
  /** Commits the time and moves on to the review step. */
  onConfirm: (time: string) => void;
}

/**
 * "Available Slots" modal opened by clicking a calendar day. Mount it only
 * while open: each opening starts from the current choice for that day.
 */
export function SlotPickerDialog({
  date,
  service,
  slots,
  currentTime,
  onClose,
  onConfirm,
}: SlotPickerDialogProps) {
  const [parts, setParts] = useState(() =>
    toParts(initialTime(slots, currentTime)),
  );
  const [showAll, setShowAll] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const confirmedTime = useRef<string | null>(null);

  const options = useMemo(() => wheelOptions(slots), [slots]);
  const open = useMemo(() => slots.filter((slot) => slot.available), [slots]);
  const time = fromParts(parts);
  const status = slotStatus(slots, time);
  const statusView = SLOT_STATUS[status];
  const slot = slots.find((s) => s.time === time);
  const quick = showAll ? open : open.slice(0, QUICK_SLOT_COUNT);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) return;
        if (confirmedTime.current !== null) onConfirm(confirmedTime.current);
        else onClose();
      }}
      size="md"
      placement="right"
      showCloseButton
      title={
        <span className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden="true">
            <ClockIcon />
          </span>
          Available Slots
        </span>
      }
      headerAside={
        <Badge variant="outline" className={styles.openBadge}>
          {open.length} Open
        </Badge>
      }
      description={`Times for ${formatShortDay(date)} · Scroll the sliders or pick a quick slot`}
      footer={
        <div className={styles.footer}>
          <Button
            variant="secondary"
            startIcon={<ChevronLeftIcon />}
            onClick={() => setIsOpen(false)}
          >
            Back
          </Button>
          <Button
            endIcon={<ChevronRightIcon />}
            disabled={status !== "available"}
            onClick={() => {
              confirmedTime.current = time;
              setIsOpen(false);
            }}
          >
            Continue to Review
          </Button>
        </div>
      }
    >
      <div className={styles.body}>
        <section className={styles.selected} aria-live="polite">
          <div>
            <p className={styles.eyebrow}>Selected slot</p>
            <p className={styles.selectedTime}>
              {formatSlotTime(time)}{" "}
              <span className={styles.duration}>
                ({formatDuration(service.durationMinutes)} duration)
              </span>
            </p>
          </div>
          <Badge variant="soft" shape="pill" tone={statusView.tone} dot>
            {statusView.label}
          </Badge>
        </section>

        <SlotTimePicker options={options} value={parts} onChange={setParts} />

        <section className={styles.quick} aria-labelledby="quick-slots-title">
          <div className={styles.quickHeader}>
            <h3 id="quick-slots-title" className={styles.eyebrow}>
              Quick open slots
            </h3>
            {open.length > QUICK_SLOT_COUNT ? (
              <button
                type="button"
                className={styles.linkButton}
                aria-expanded={showAll}
                onClick={() => setShowAll((value) => !value)}
              >
                {showAll ? "Show fewer" : `${open.length} Available`}
              </button>
            ) : null}
          </div>
          {open.length === 0 ? (
            <p className={styles.muted}>Every slot on this day is booked.</p>
          ) : (
            <ChoiceGroup labelledBy="quick-slots-title" minItemWidth="92px">
              {quick.map((option) => (
                <ChoiceCard
                  key={option.time}
                  name="quick-slot"
                  value={option.time}
                  size="sm"
                  indicator="none"
                  checked={option.time === time}
                  onSelect={(value) => setParts(toParts(value))}
                >
                  {formatSlotTime(option.time)}
                </ChoiceCard>
              ))}
            </ChoiceGroup>
          )}
        </section>

        <section className={styles.service} aria-label="Visit details">
          <span className={styles.serviceIcon} aria-hidden="true">
            <ClockIcon />
          </span>
          <span>
            <span className={styles.serviceName}>
              {service.name} · {formatDuration(service.durationMinutes)}
            </span>
            {slot?.provider || slot?.location ? (
              <span className={styles.serviceMeta}>
                {[slot.provider, slot.location].filter(Boolean).join(" · ")}
              </span>
            ) : null}
          </span>
        </section>
      </div>
    </Dialog>
  );
}
