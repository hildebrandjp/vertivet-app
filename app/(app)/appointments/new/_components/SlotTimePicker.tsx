"use client";

import { type WheelOption, WheelPicker } from "@/app/shared/ui/WheelPicker";
import type { Period, TimeParts } from "../_lib/slot-time";
import styles from "./slot-dialog.module.css";

interface SlotTimePickerProps {
  options: {
    hours: WheelOption[];
    minutes: WheelOption[];
    periods: WheelOption[];
  };
  value: TimeParts;
  onChange: (value: TimeParts) => void;
}

/** HOUR : MINUTE | PERIOD wheels composed from the shared WheelPicker. */
export function SlotTimePicker({
  options,
  value,
  onChange,
}: SlotTimePickerProps) {
  return (
    <div className={styles.picker}>
      <WheelPicker
        label="Hour"
        options={options.hours}
        value={value.hour}
        onChange={(hour) => onChange({ ...value, hour })}
      />
      <span className={styles.colon} aria-hidden="true">
        :
      </span>
      <WheelPicker
        label="Minute"
        options={options.minutes}
        value={value.minute}
        onChange={(minute) => onChange({ ...value, minute })}
      />
      <span className={styles.divider} aria-hidden="true" />
      <WheelPicker
        label="Period"
        options={options.periods}
        value={value.period}
        onChange={(period) => onChange({ ...value, period: period as Period })}
      />
    </div>
  );
}
