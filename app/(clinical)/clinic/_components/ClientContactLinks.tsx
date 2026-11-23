import { isEmail, isPhone } from "@/app/shared/forms/validation";

export function Phone({ value }: { value?: string }) {
  return value ? (
    isPhone(value) ? (
      <a href={`tel:${value.replace(/[^+\d]/g, "")}`}>{value}</a>
    ) : (
      value
    )
  ) : null;
}

export function Email({ value }: { value?: string }) {
  return value ? (
    isEmail(value) ? (
      <a href={`mailto:${encodeURIComponent(value).replace("%40", "@")}`}>
        {value}
      </a>
    ) : (
      value
    )
  ) : null;
}
