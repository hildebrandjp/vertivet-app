"use client";

import { ROUTES } from "@/app/shared/config/routes";
import { useActionForm } from "@/app/shared/hooks/useActionForm";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import { Field } from "@/app/shared/ui/Field";
import { StatusPanel } from "@/app/shared/ui/StatusPanel";
import { TextInput } from "@/app/shared/ui/TextInput";
import { AuthCard, AuthForm } from "../../_components/AuthCard";
import {
  FORGOT_PASSWORD_FIELDS,
  FORGOT_PASSWORD_INITIAL_STATE,
  validateForgotPassword,
} from "../../_lib/forgot-password-form";
import { forgotPassword } from "../actions";

/** Email form that turns into a "check your inbox" confirmation. */
export function ForgotPasswordForm() {
  const form = useActionForm({
    action: forgotPassword,
    initialState: FORGOT_PASSWORD_INITIAL_STATE,
    fields: FORGOT_PASSWORD_FIELDS,
    validate: validateForgotPassword,
  });
  const email = form.state.values?.email;

  if (form.succeeded) {
    return (
      <AuthCard>
        <StatusPanel
          autoFocus
          title="Check your inbox"
          actions={
            <>
              <ButtonLink href={ROUTES.login} fullWidth>
                Back to Sign In
              </ButtonLink>
              <Button variant="ghost" fullWidth onClick={form.startOver}>
                Use a different email
              </Button>
            </>
          }
        >
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a
          secure link to reset your password. The link expires soon, so use it
          promptly. Don&apos;t forget to check your spam folder.
        </StatusPanel>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset Password"
      description="We'll email you a secure reset link"
      error={form.formError}
      onDismissError={form.dismissFormError}
    >
      <AuthForm
        action={form.formAction}
        onSubmit={form.onSubmit}
        aria-busy={form.pending || undefined}
      >
        <Field
          label="Email address"
          labelVariant="caps"
          hint="Use the clinic email linked to your VertiVet account."
          error={form.fieldErrors.email}
        >
          <TextInput
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="name@clinic.com"
            defaultValue={email}
            onChange={() => form.clearFieldError("email")}
          />
        </Field>

        <Button type="submit" fullWidth loading={form.pending}>
          Send Reset Link
        </Button>
      </AuthForm>
    </AuthCard>
  );
}
