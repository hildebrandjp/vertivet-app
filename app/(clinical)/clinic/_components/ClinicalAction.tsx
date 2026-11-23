"use client";

import { useActionState, useId, useState } from "react";
import { Alert } from "@/app/shared/ui/Alert";
import { Button, type ButtonVariant } from "@/app/shared/ui/Button";
import { Dialog } from "@/app/shared/ui/Dialog";
import { Field } from "@/app/shared/ui/Field";
import { TextArea } from "@/app/shared/ui/TextArea";
import { TextInput } from "@/app/shared/ui/TextInput";
import { type ClinicalChange, ENTRY_LABELS } from "../_lib/model";
import { type ClinicalResult, saveClinicalChange } from "../actions";
import styles from "../clinic.module.css";

type Kind = ClinicalChange["kind"];

const LABELS = {
  ...ENTRY_LABELS,
  intake: "New Patient Intake",
  call: "Call Patient",
};

const INTAKE_FIELDS = [
  { name: "name", label: "Patient Name", required: true },
  { name: "owner", label: "Owner Name", required: true },
  { name: "breed", label: "Breed", required: false },
  { name: "chip", label: "Microchip Number", required: false },
];

const INITIAL: ClinicalResult = { status: "idle" };

function ActionDialog({
  kind,
  id,
  patient,
  close,
}: {
  kind: Kind;
  id: string;
  patient?: string;
  close: () => void;
}) {
  const formId = useId();
  const [state, action, pending] = useActionState(
    saveClinicalChange.bind(null, kind, id),
    INITIAL,
  );
  const [values, setValues] = useState<Record<string, string>>({});
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
          {kind === "intake" ? (
            INTAKE_FIELDS.map(({ name, label, required }) => (
              <Field key={name} label={label} required={required}>
                <TextInput
                  name={name}
                  maxLength={name === "chip" ? 15 : 100}
                  value={values[name] ?? ""}
                  inputMode={name === "chip" ? "numeric" : undefined}
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
  label,
  variant = "secondary",
  size,
  fullWidth,
}: {
  kind: Kind;
  id?: string;
  patient?: string;
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
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {open && (
        <ActionDialog
          kind={kind}
          id={id}
          patient={patient}
          close={() => setOpen(false)}
        />
      )}
    </>
  );
}
