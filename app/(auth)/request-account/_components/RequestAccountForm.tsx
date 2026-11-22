"use client";

import { ROUTES } from "@/app/shared/config/routes";
import { useActionForm } from "@/app/shared/hooks/useActionForm";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import { Checkbox } from "@/app/shared/ui/Checkbox";
import { Combobox } from "@/app/shared/ui/Combobox";
import { Field } from "@/app/shared/ui/Field";
import { StatusPanel } from "@/app/shared/ui/StatusPanel";
import { TextArea } from "@/app/shared/ui/TextArea";
import { TextInput } from "@/app/shared/ui/TextInput";
import { AuthCard, AuthForm, AuthFormRow } from "../../_components/AuthCard";
import {
  CLINIC_TYPES,
  MESSAGE_MAX_LENGTH,
  REQUEST_ACCOUNT_FIELDS,
  REQUEST_ACCOUNT_INITIAL_STATE,
  TEAM_SIZES,
  validateRequestAccount,
} from "../../_lib/request-account-form";
import { requestAccount } from "../actions";

/** Clinic onboarding form that turns into a "request received" summary. */
export function RequestAccountForm() {
  const form = useActionForm({
    action: requestAccount,
    initialState: REQUEST_ACCOUNT_INITIAL_STATE,
    fields: REQUEST_ACCOUNT_FIELDS,
    validate: validateRequestAccount,
  });
  const { fieldErrors: errors, clearFieldError: clear } = form;
  const values = form.state.values;

  if (form.succeeded) {
    return (
      <AuthCard>
        <StatusPanel
          autoFocus
          title="Request received"
          actions={
            <ButtonLink href={ROUTES.login} fullWidth>
              Back to Sign In
            </ButtonLink>
          }
        >
          Thanks, <strong>{values?.contactName}</strong>. Our onboarding team
          will verify <strong>{values?.clinicName}</strong> and reply to{" "}
          <strong>{values?.email}</strong> within 1–2 business days.
        </StatusPanel>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Clinic Details"
      description="All fields are required unless marked optional"
      error={form.formError}
      onDismissError={form.dismissFormError}
    >
      <AuthForm
        action={form.formAction}
        onSubmit={form.onSubmit}
        aria-busy={form.pending || undefined}
      >
        <Field
          label="Clinic name"
          labelVariant="caps"
          error={errors.clinicName}
        >
          <TextInput
            name="clinicName"
            autoComplete="organization"
            placeholder="Happy Paws Veterinary Clinic"
            maxLength={120}
            defaultValue={values?.clinicName}
            onChange={() => clear("clinicName")}
          />
        </Field>

        <Field
          label="Clinic type"
          labelVariant="caps"
          error={errors.clinicType}
        >
          <Combobox
            name="clinicType"
            options={CLINIC_TYPES}
            defaultValue={values?.clinicType || null}
            placeholder="Select clinic type"
            searchPlaceholder="Search clinic types…"
            onValueChange={() => clear("clinicType")}
          />
        </Field>

        <Field
          label="Contact person"
          labelVariant="caps"
          error={errors.contactName}
        >
          <TextInput
            name="contactName"
            autoComplete="name"
            placeholder="Dr. Emma Wilson"
            maxLength={80}
            defaultValue={values?.contactName}
            onChange={() => clear("contactName")}
          />
        </Field>

        <Field label="Work email" labelVariant="caps" error={errors.email}>
          <TextInput
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@clinic.com"
            defaultValue={values?.email}
            onChange={() => clear("email")}
          />
        </Field>

        <AuthFormRow>
          <Field label="Phone" labelVariant="caps" error={errors.phone}>
            <TextInput
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+1 555 010 2030"
              defaultValue={values?.phone}
              onChange={() => clear("phone")}
            />
          </Field>
          <Field label="Team size" labelVariant="caps" error={errors.teamSize}>
            <Combobox
              name="teamSize"
              options={TEAM_SIZES}
              defaultValue={values?.teamSize || null}
              placeholder="Veterinarians"
              searchPlaceholder="Search…"
              onValueChange={() => clear("teamSize")}
            />
          </Field>
        </AuthFormRow>

        <Field
          label="Anything we should know? (optional)"
          labelVariant="caps"
          hint={`Practice management software, locations, go-live date… Up to ${MESSAGE_MAX_LENGTH} characters.`}
          error={errors.message}
        >
          <TextArea
            name="message"
            rows={3}
            maxLength={MESSAGE_MAX_LENGTH}
            placeholder="Tell us about your practice"
            defaultValue={values?.message}
            onChange={() => clear("message")}
          />
        </Field>

        <Field error={errors.consent}>
          <Checkbox
            name="consent"
            size="sm"
            label="I'm authorised to register this clinic and agree to be contacted by VertiVet about this request."
            defaultChecked={values?.consent === "on"}
            onChange={() => clear("consent")}
          />
        </Field>

        <Button type="submit" fullWidth loading={form.pending}>
          Submit Request
        </Button>
      </AuthForm>
    </AuthCard>
  );
}
