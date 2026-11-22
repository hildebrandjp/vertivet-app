"use client";

import { Badge } from "@/app/shared/ui/Badge";
import { Button } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import { ClockIcon } from "@/app/shared/ui/icons";
import { StatusPanel } from "@/app/shared/ui/StatusPanel";
import { pluralize } from "@/app/shared/utils/text";
import type { ServiceOffering } from "../../../_lib/data/types";
import {
  formatDuration,
  formatFullDay,
  formatShortDay,
  formatSlotTime,
} from "../../../_lib/format";
import type { SlotsView } from "../_lib/useSlots";
import styles from "./schedule.module.css";

interface SlotsPanelProps {
  service: ServiceOffering;
  date: string | null;
  time: string | null;
  view: SlotsView;
  onRetry: () => void;
  /** Opens the "Available Slots" picker for the selected date. */
  onOpenPicker: () => void;
}

const EMPTY_HINT =
  "Click on any open date in the appointment calendar to configure and select available time slots.";

/**
 * Right-hand panel: guidance until a date is picked, a loading pill while
 * that day's slots open, then a summary of the chosen time.
 */
export function SlotsPanel({
  service,
  date,
  time,
  view,
  onRetry,
  onOpenPicker,
}: SlotsPanelProps) {
  const openCount =
    view.status === "ready" ? view.slots.filter((s) => s.available).length : 0;
  const chosen =
    view.status === "ready" && time
      ? view.slots.find((slot) => slot.time === time)
      : undefined;

  return (
    <Card
      padding="lg"
      className={styles.slotsCard}
      aria-busy={view.status === "loading" || undefined}
      aria-live="polite"
    >
      {view.status === "idle" ? (
        <StatusPanel
          tone="info"
          icon={<ClockIcon />}
          title="Select Date for Slots"
        >
          {EMPTY_HINT}
        </StatusPanel>
      ) : null}

      {view.status === "loading" && date ? (
        <StatusPanel
          tone="info"
          icon={<ClockIcon />}
          title="Select Date for Slots"
          actions={
            <span className={styles.pillRow}>
              <Badge
                variant="outline"
                shape="pill"
                dot
                className={styles.loadingPill}
              >
                {formatShortDay(date)} Selected · Opening slots…
              </Badge>
            </span>
          }
        >
          {EMPTY_HINT}
        </StatusPanel>
      ) : null}

      {view.status === "error" ? (
        <StatusPanel
          tone="danger"
          title="Times unavailable"
          actions={
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          }
        >
          {view.message}
        </StatusPanel>
      ) : null}

      {view.status === "ready" && date && openCount === 0 ? (
        <StatusPanel tone="info" icon={<ClockIcon />} title="No open slots">
          The clinic is closed or fully booked on {formatFullDay(date)}. Please
          pick another date.
        </StatusPanel>
      ) : null}

      {view.status === "ready" && date && openCount > 0 && !chosen ? (
        <StatusPanel
          tone="info"
          icon={<ClockIcon />}
          title={`${pluralize(openCount, "open slot")} on ${formatShortDay(date)}`}
          actions={<Button onClick={onOpenPicker}>Choose a time</Button>}
        >
          Pick the time that suits you for {service.name.toLowerCase()} (
          {formatDuration(service.durationMinutes)}).
        </StatusPanel>
      ) : null}

      {chosen && date ? (
        <StatusPanel
          tone="success"
          icon={<ClockIcon />}
          title={`${formatSlotTime(chosen.time)} · ${formatShortDay(date)}`}
          actions={
            <Button variant="secondary" onClick={onOpenPicker}>
              Change time
            </Button>
          }
        >
          {service.name} · {formatDuration(service.durationMinutes)}
          {chosen.provider ? (
            <>
              <br />
              {[chosen.provider, chosen.location].filter(Boolean).join(" · ")}
            </>
          ) : null}
        </StatusPanel>
      ) : null}
    </Card>
  );
}
