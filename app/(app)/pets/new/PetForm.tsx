"use client";

import { ROUTES } from "@/app/shared/config/routes";
import { useActionForm } from "@/app/shared/hooks/useActionForm";
import { Alert } from "@/app/shared/ui/Alert";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import { Combobox } from "@/app/shared/ui/Combobox";
import { Field } from "@/app/shared/ui/Field";
import { TextInput } from "@/app/shared/ui/TextInput";
import { PET_SPECIES } from "../../_lib/data/types";
import { formatSpecies } from "../../_lib/format";
import styles from "../pets.module.css";
import { addPet } from "./actions";
import { INITIAL_PET_FORM, PET_FIELDS, validatePet } from "./pet-form";

const speciesOptions = PET_SPECIES.map((value) => ({
  value,
  label: formatSpecies(value),
}));

export function PetForm() {
  const form = useActionForm({
    action: addPet,
    initialState: INITIAL_PET_FORM,
    fields: PET_FIELDS,
    validate: validatePet,
  });
  const values = form.state.values;

  return (
    <form
      action={form.formAction}
      onSubmit={form.onSubmit}
      noValidate
      className={styles.form}
    >
      {form.formError && (
        <Alert tone="danger" title={form.formError.title}>
          {form.formError.message}
        </Alert>
      )}
      <Field label="Pet name" required error={form.fieldErrors.name}>
        <TextInput
          name="name"
          maxLength={60}
          defaultValue={values?.name}
          onChange={() => form.clearFieldError("name")}
        />
      </Field>
      <Field label="Species" required error={form.fieldErrors.species}>
        <Combobox
          name="species"
          options={speciesOptions}
          defaultValue={values?.species}
          onValueChange={() => form.clearFieldError("species")}
        />
      </Field>
      <Field label="Breed" required error={form.fieldErrors.breed}>
        <TextInput
          name="breed"
          maxLength={80}
          defaultValue={values?.breed}
          onChange={() => form.clearFieldError("breed")}
        />
      </Field>
      <Field label="Date of birth" required error={form.fieldErrors.birthDate}>
        <TextInput
          name="birthDate"
          type="date"
          defaultValue={values?.birthDate}
          onChange={() => form.clearFieldError("birthDate")}
        />
      </Field>
      <div className={styles.formActions}>
        <ButtonLink href={ROUTES.pets} variant="secondary">
          Cancel
        </ButtonLink>
        <Button type="submit" loading={form.pending}>
          Save Pet
        </Button>
      </div>
    </form>
  );
}
