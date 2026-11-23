"use client";

import { ROUTES } from "@/app/shared/config/routes";
import { useActionForm } from "@/app/shared/hooks/useActionForm";
import { Button } from "@/app/shared/ui/Button";
import { Checkbox } from "@/app/shared/ui/Checkbox";
import { Field } from "@/app/shared/ui/Field";
import { PasswordInput } from "@/app/shared/ui/PasswordInput";
import { TextInput } from "@/app/shared/ui/TextInput";
import { TextLink } from "@/app/shared/ui/TextLink";
import {
  isRemembered,
  LOGIN_FIELDS,
  LOGIN_INITIAL_STATE,
  type LoginState,
  REMEMBER_ME_DAYS,
  validateLogin,
} from "../_lib/login-form";
import { AuthCard, AuthForm } from "./AuthCard";

/**
 * The only client island on the login page: banner + sign-in card.
 * Works without JavaScript too (progressive enhancement via the form action).
 */
export function LoginForm({
  action,
  clinical = false,
}: {
  action: (state: LoginState, data: FormData) => Promise<LoginState>;
  clinical?: boolean;
}) {
  const form = useActionForm({
    action,
    initialState: LOGIN_INITIAL_STATE,
    fields: LOGIN_FIELDS,
    validate: validateLogin,
  });
  const { fieldErrors, clearFieldError } = form;
  const values = form.state.values;

  return (
    <AuthCard
      title="Sign In"
      description={
        clinical
          ? "Use the email assigned by your clinic."
          : "Please provide your verified professional ID"
      }
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
          error={fieldErrors.email}
        >
          <TextInput
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="name@clinic.com"
            defaultValue={values?.email}
            onChange={() => clearFieldError("email")}
          />
        </Field>

        <Field
          label="Password"
          labelVariant="caps"
          error={fieldErrors.password}
          labelAction={
            <TextLink href={ROUTES.forgotPassword} size="xs">
              Forgot password?
            </TextLink>
          }
        >
          <PasswordInput
            name="password"
            autoComplete="current-password"
            onChange={() => clearFieldError("password")}
          />
        </Field>

        <Checkbox
          name="remember"
          size="sm"
          label={`Keep me logged in for ${REMEMBER_ME_DAYS} days`}
          defaultChecked={values ? isRemembered(values.remember) : true}
        />

        <Button type="submit" fullWidth loading={form.pending}>
          {clinical ? "Open Clinical Portal" : "Login to Dashboard"}
        </Button>
      </AuthForm>
    </AuthCard>
  );
}
