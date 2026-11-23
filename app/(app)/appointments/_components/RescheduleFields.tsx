"use client";

import { useState } from "react";
import { Alert } from "@/app/shared/ui/Alert";
import { Button } from "@/app/shared/ui/Button";
import { Combobox } from "@/app/shared/ui/Combobox";
import { Field } from "@/app/shared/ui/Field";
import { TextInput } from "@/app/shared/ui/TextInput";
import type { TimeSlot } from "../../_lib/data/types";
import { formatSlotTime } from "../../_lib/format";
import { useSlots } from "../_lib/useSlots";

export function RescheduleFields({
  serviceId,
  today,
  disabled,
  onReadyChange,
}: {
  serviceId: string;
  today: string;
  disabled: boolean;
  onReadyChange: (ready: boolean) => void;
}) {
  const [date, setDate] = useState("");
  const [cache] = useState(() => new Map<string, TimeSlot[]>());
  const [view, retry] = useSlots(serviceId, date >= today ? date : null, cache);
  const options =
    view.status === "ready"
      ? view.slots
          .filter((slot) => slot.available)
          .map((slot) => ({
            value: slot.time,
            label: formatSlotTime(slot.time),
          }))
      : [];

  return (
    <>
      <Field label="New date" required disabled={disabled}>
        <TextInput
          type="date"
          name="date"
          min={today}
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            onReadyChange(false);
          }}
        />
      </Field>
      {view.status === "loading" && <output>Loading available times…</output>}
      {view.status === "error" && (
        <Alert tone="warning">
          {view.message}{" "}
          <Button size="sm" variant="secondary" onClick={retry}>
            Retry
          </Button>
        </Alert>
      )}
      {view.status === "ready" &&
        (options.length > 0 ? (
          <Field label="New time" required disabled={disabled}>
            <Combobox
              key={date}
              name="time"
              options={options}
              placeholder="Select a time"
              onValueChange={(value) => onReadyChange(Boolean(value))}
            />
          </Field>
        ) : (
          <output>No available times on this date.</output>
        ))}
    </>
  );
}
