"use client";

import { ROUTES } from "@/app/shared/config/routes";
import { useActionForm } from "@/app/shared/hooks/useActionForm";
import { Alert } from "@/app/shared/ui/Alert";
import { Button } from "@/app/shared/ui/Button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/Card";
import { Checkbox } from "@/app/shared/ui/Checkbox";
import { Field } from "@/app/shared/ui/Field";
import { PasswordInput } from "@/app/shared/ui/PasswordInput";
import { TextInput } from "@/app/shared/ui/TextInput";
import { TextLink } from "@/app/shared/ui/TextLink";
import {
  isRemembered,
  LOGIN_FIELDS,
  LOGIN_INITIAL_STATE,
  REMEMBER_ME_DAYS,
  validateLogin,
} from "../../_lib/login-form";
import { login } from "../actions";
import styles from "./LoginForm.module.css";

/**
 * The only client island on the login page: banner + sign-in card.
 * Works without JavaScript too (progressive enhancement via the form action).
 */
export function LoginForm() {
  const {
    state,
    formAction,
    pending,
    fieldErrors,
    formError,
    onSubmit,
    clearFieldError,
    dismissFormError,
  } = useActionForm({
    action: login,
    initialState: LOGIN_INITIAL_STATE,
    fields: LOGIN_FIELDS,
    validate: validateLogin,
  });
  const values = state.values;

  return (
    <div className={styles.stack}>
      {formError ? (
        <Alert
          tone="danger"
          title={formError.title}
          onDismiss={dismissFormError}
        >
          {formError.message}
        </Alert>
      ) : null}

      <Card padding="lg" className={styles.card}>
        <CardHeader divider>
          <CardTitle level={3} as="h2">
            Sign In
          </CardTitle>
          <CardDescription>
            Please provide your verified professional ID
          </CardDescription>
        </CardHeader>

        <form
          action={formAction}
          onSubmit={onSubmit}
          noValidate
          aria-busy={pending || undefined}
          className={styles.form}
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
              <TextLink href={ROUTES.forgotPassword} size="xs" prefetch={false}>
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

          <Button type="submit" fullWidth loading={pending}>
            Login to Dashboard
          </Button>
        </form>
      </Card>
    </div>
  );
}
