"use client";

import { useActionState, useId, useState } from "react";
import { Alert } from "@/app/shared/ui/Alert";
import { Button, type ButtonVariant } from "@/app/shared/ui/Button";
import controlStyles from "@/app/shared/ui/Control.module.css";
import { Dialog } from "@/app/shared/ui/Dialog";
import { Field } from "@/app/shared/ui/Field";
import { TextArea } from "@/app/shared/ui/TextArea";
import { TextInput } from "@/app/shared/ui/TextInput";
import { type ClinicalChange, ENTRY_LABELS, SPECIES } from "../_lib/model";
import { SPECIES_LABELS } from "../_lib/registry";
import { type ClinicalResult, saveClinicalChange } from "../actions";
import styles from "../clinic.module.css";

type Kind = ClinicalChange["kind"];

const LABELS = {
  ...ENTRY_LABELS,
  intake: "New Patient Intake",
  call: "Call Patient",
  microchip: "Update Microchip",
};

const CHIP_FIELD = {
  name: "chip",
  label: "Microchip Number",
  maxLength: 24,
  required: false,
  inputMode: "numeric" as const,
};
const INTAKE_FIELDS = [
  { name: "name", label: "Patient Name", maxLength: 100, required: true },
  { name: "breed", label: "Breed", maxLength: 100 },
  { name: "owner", label: "Owner Name", maxLength: 100, required: true },
  { name: "ownerEmail", label: "Owner Email", maxLength: 254, type: "email" },
  { name: "ownerPhone", label: "Owner Phone", maxLength: 40, type: "tel" },
  CHIP_FIELD,
];

const INITIAL: ClinicalResult = { status: "idle" };

function ActionDialog({
  kind,
  id,
  patient,
  currentChip,
  close,
}: {
  kind: Kind;
  id: string;
  patient?: string;
  currentChip?: string;
  close: () => void;
}) {
  const formId = useId();
  const [state, action, pending] = useActionState(
    saveClinicalChange.bind(null, kind, id),
    INITIAL,
  );
  const [values, setValues] = useState<Record<string, string>>({
    chip: currentChip ?? "",
  });
  const saved = state.status === "saved";
  const edit = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  return (
    <Dialog
      open
      title={LABELS[kind]}
      description={patient}
      dismissible={!pending}
      onOpenChange={(open) => {
        if (!open && !pending) close();
      }}
      footer={
        saved ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" disabled={pending} onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={pending}>
              {kind === "call"
                ? "Call Patient"
                : kind === "prescription" || kind === "lab"
                  ? "Save Draft"
                  : "Save"}
            </Button>
          </>
        )
      }
    >
      {saved ? (
        <Alert tone="success">Change saved.</Alert>
      ) : (
        <form className={styles.commandForm} id={formId} action={action}>
          {state.status === "error" && (
            <Alert tone="danger">{state.message}</Alert>
          )}
          {kind === "intake" && (
            <Field id={`${formId}-species`} label="Species">
              <select
                id={`${formId}-species`}
                name="species"
                className={controlStyles.control}
                data-size="md"
                value={values.species ?? ""}
                onChange={(event) => edit("species", event.target.value)}
              >
                <option value="">Select species</option>
                {SPECIES.map((species) => (
                  <option key={species} value={species}>
                    {SPECIES_LABELS[species]}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {kind === "intake" || kind === "microchip" ? (
            (kind === "intake"
              ? INTAKE_FIELDS
              : [{ ...CHIP_FIELD, required: true }]
            ).map(({ name, label, required, ...input }) => (
              <Field key={name} label={label} required={required}>
                <TextInput
                  {...input}
                  name={name}
                  value={values[name] ?? ""}
                  onChange={(event) => edit(name, event.target.value)}
                />
              </Field>
            ))
          ) : kind === "call" ? (
            <p>Mark this patient as called in from the waiting queue.</p>
          ) : (
            <Field label={LABELS[kind]} required>
              <TextArea
                name="text"
                maxLength={1000}
                rows={5}
                value={values.text ?? ""}
                onChange={(event) => edit("text", event.target.value)}
              />
            </Field>
          )}
        </form>
      )}
    </Dialog>
  );
}

export function ClinicalAction({
  kind,
  id = "",
  patient,
  currentChip,
  label,
  variant = "secondary",
  size,
  fullWidth,
}: {
  kind: Kind;
  id?: string;
  patient?: string;
  currentChip?: string;
  label: string;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        aria-label={
          kind === "microchip" && patient
            ? `Edit microchip for ${patient}`
            : undefined
        }
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {open && (
        <ActionDialog
          kind={kind}
          id={id}
          patient={patient}
          currentChip={currentChip}
          close={() => setOpen(false)}
        />
      )}
    </>
  );
}
