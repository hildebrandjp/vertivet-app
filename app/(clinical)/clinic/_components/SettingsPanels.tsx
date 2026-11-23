"use client";

import { formatSlotTime } from "@/app/(app)/_lib/format";
import { Badge } from "@/app/shared/ui/Badge";
import { Card } from "@/app/shared/ui/Card";
import controlStyles from "@/app/shared/ui/Control.module.css";
import { Field } from "@/app/shared/ui/Field";
import { TextInput } from "@/app/shared/ui/TextInput";
import { Heading, Text } from "@/app/shared/ui/Typography";
import type { PracticeOperations, PracticeSettings } from "../_lib/settings";
import styles from "../settings.module.css";

type Change = <K extends keyof PracticeOperations>(
  field: K,
  value: PracticeOperations[K],
) => void;
type Props = {
  settings: PracticeSettings;
  value: PracticeOperations;
  change: Change;
  disabled: boolean;
};

export function RoomAllocations({
  settings,
  value,
  change,
  disabled,
  edit,
}: Props & { edit: boolean }) {
  return (
    <section className={styles.section}>
      <Heading level={4} as="h2" className={styles.eyebrow}>
        Active Examination Room Allocation
      </Heading>
      {settings.rooms.length ? (
        <div className={styles.fields}>
          {settings.rooms.map((room, index) => {
            const staffId =
              value.allocations.find(({ roomId }) => roomId === room.id)
                ?.staffId ?? "";
            const assigned = settings.staff.find(({ id }) => id === staffId);
            const fieldId = `room-assignment-${index}`;
            return (
              <Card key={room.id} variant="muted" className={styles.detail}>
                <Heading level={4} as="h3">
                  {room.name}
                </Heading>
                {edit ? (
                  <Field
                    label={`Assigned clinician for ${room.name}`}
                    id={fieldId}
                    disabled={disabled}
                  >
                    <select
                      className={controlStyles.control}
                      data-size="md"
                      id={fieldId}
                      disabled={disabled}
                      value={staffId}
                      onChange={(event) => {
                        const staffId = event.target.value;
                        change("allocations", [
                          ...value.allocations.filter(
                            ({ roomId }) => roomId !== room.id,
                          ),
                          { roomId: room.id, staffId },
                        ]);
                      }}
                    >
                      <option value="">Unassigned</option>
                      {settings.staff.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : (
                  <Text variant="supporting" tone="muted">
                    {assigned ? `Assigned: ${assigned.name}` : "Unassigned"}
                  </Text>
                )}
                {room.equipment && (
                  <Text variant="supporting" tone="primary">
                    {room.equipment}
                  </Text>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Text tone="muted">No exam rooms configured.</Text>
      )}
    </section>
  );
}

const HOURS = [
  ["opensAt", "Clinic Opens"],
  ["closesAt", "Clinic Closes"],
] as const;
const TRIAGE = [
  ["triageStartsAt", "Emergency Triage Starts"],
  ["triageEndsAt", "Emergency Triage Ends"],
] as const;
const DURATION = [
  ["consultationMinutes", "Consultation Duration (minutes)", 5, 240],
  ["cleanupMinutes", "Cleanup Buffer (minutes)", 0, 120],
] as const;

export function TimingPanel({
  value,
  change,
  disabled,
  edit,
}: Omit<Props, "settings"> & { edit: boolean }) {
  return (
    <section className={styles.section}>
      <Heading level={4} as="h2" className={styles.eyebrow}>
        Practice Timing &amp; Walk-In Buffers
      </Heading>
      {edit ? (
        <div className={styles.fields}>
          {DURATION.map(([field, label, min, max]) => (
            <Field key={field} label={label} disabled={disabled}>
              <TextInput
                type="number"
                min={min}
                max={max}
                step={1}
                value={Number.isNaN(value[field]) ? "" : value[field]}
                onChange={(event) => change(field, event.target.valueAsNumber)}
              />
            </Field>
          ))}
          {[...HOURS, ...TRIAGE].map(([field, label]) => (
            <Field key={field} label={label} disabled={disabled}>
              <TextInput
                type="time"
                value={value[field]}
                onChange={(event) => change(field, event.target.value)}
              />
            </Field>
          ))}
        </div>
      ) : (
        <div className={styles.fields}>
          <Card variant="muted">
            <Text variant="label" tone="muted">
              Consultation Duration &amp; Cleanup
            </Text>
            <Text variant="supporting">
              {value.consultationMinutes} min slot + {value.cleanupMinutes} min
              cleanup
            </Text>
          </Card>
          <Card variant="muted">
            <Text variant="label" tone="muted">
              Emergency Triage Period
            </Text>
            <Text variant="supporting">
              {formatSlotTime(value.triageStartsAt)} –{" "}
              {formatSlotTime(value.triageEndsAt)}
            </Text>
          </Card>
        </div>
      )}
    </section>
  );
}

export function RosterPanel({ settings, value, change, disabled }: Props) {
  return (
    <>
      <TimingPanel value={value} change={change} disabled={disabled} edit />
      <section className={styles.section}>
        <Heading level={4} as="h2" className={styles.eyebrow}>
          Staff Roster
        </Heading>
        {value.roster.length ? (
          value.roster.map((shift) => {
            const name =
              settings.staff.find(({ id }) => id === shift.staffId)?.name ??
              "Staff member";
            return (
              <Card
                key={shift.staffId}
                variant="muted"
                className={styles.detail}
              >
                <Text variant="label" tone="heading">
                  {name}
                </Text>
                <div className={styles.fields}>
                  {(
                    [
                      ["startsAt", "Shift Starts"],
                      ["endsAt", "Shift Ends"],
                    ] as const
                  ).map(([field, label]) => (
                    <Field key={field} label={label} disabled={disabled}>
                      <TextInput
                        type="time"
                        value={shift[field]}
                        onChange={(event) => {
                          const time = event.target.value;
                          change(
                            "roster",
                            value.roster.map((row) =>
                              row.staffId === shift.staffId
                                ? { ...row, [field]: time }
                                : row,
                            ),
                          );
                        }}
                      />
                    </Field>
                  ))}
                </div>
              </Card>
            );
          })
        ) : (
          <Text tone="muted">No roster shifts configured.</Text>
        )}
      </section>
    </>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={styles.toggle}>
      <span>
        <Text as="span" variant="label" tone="heading">
          {label}
        </Text>
        {description && (
          <Text as="span" variant="supporting" tone="muted">
            {description}
          </Text>
        )}
      </span>
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function AlertsPanel({
  value,
  change,
  disabled,
}: Omit<Props, "settings">) {
  return (
    <section className={styles.section}>
      <Heading level={4} as="h2" className={styles.eyebrow}>
        Clinical Communication Protocols
      </Heading>
      <SettingToggle
        label="Stat Lab Result Terminal Audio Alert"
        description="Allow compatible clinical terminals to play an audio alert for critical lab results."
        checked={value.audioAlert}
        disabled={disabled}
        onChange={(audioAlert) => change("audioAlert", audioAlert)}
      />
    </section>
  );
}

export function PharmacyPanel({ settings, value, change, disabled }: Props) {
  const byId = new Map(value.formulary.map(({ id, enabled }) => [id, enabled]));
  return (
    <section className={styles.section}>
      <Heading level={4} as="h2" className={styles.eyebrow}>
        Pharmacy Formularies
      </Heading>
      {settings.medications.length ? (
        settings.medications.map((item) => (
          <SettingToggle
            key={item.id}
            label={item.name}
            description={item.description}
            checked={byId.get(item.id) ?? false}
            disabled={disabled}
            onChange={(enabled) => {
              change("formulary", [
                ...value.formulary.filter(({ id }) => item.id !== id),
                { id: item.id, enabled },
              ]);
            }}
          />
        ))
      ) : (
        <Text tone="muted">No formularies configured.</Text>
      )}
      <Heading level={4} as="h2" className={styles.eyebrow}>
        Lab Integration
      </Heading>
      {settings.labIntegration ? (
        <div className={styles.inline}>
          <Text>{settings.labIntegration.name}</Text>
          <Badge
            variant="soft"
            tone={
              settings.labIntegration.status === "connected"
                ? "success"
                : "neutral"
            }
          >
            {settings.labIntegration.status === "connected"
              ? "Connected"
              : "Disconnected"}
          </Badge>
        </div>
      ) : (
        <Text tone="muted">No lab integration configured.</Text>
      )}
    </section>
  );
}
