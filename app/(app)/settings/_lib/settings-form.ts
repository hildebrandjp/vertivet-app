import { createValidator, rules } from "@/app/shared/forms/validation";
import type { OwnerPreferences } from "../../_lib/data/settings-types";

export const CONTACT_FIELDS = {
  fullName: 100,
  email: 254,
  phone: 30,
  clinicBranch: 120,
  emergencyPhone: 30,
} as const;

export type ContactField = keyof typeof CONTACT_FIELDS;
export const CONTACT_NAMES = Object.keys(CONTACT_FIELDS) as ContactField[];

const phone = [rules.phone(), rules.maxLength(CONTACT_FIELDS.phone)];

export const validateContact = createValidator<ContactField>({
  fullName: [
    rules.required("Enter your full name."),
    rules.maxLength(CONTACT_FIELDS.fullName),
  ],
  email: [
    rules.required("Enter your email address."),
    rules.email(),
    rules.maxLength(CONTACT_FIELDS.email),
  ],
  phone,
  clinicBranch: [rules.maxLength(CONTACT_FIELDS.clinicBranch)],
  emergencyPhone: phone,
});

export function preferencesOf(settings: OwnerPreferences): OwnerPreferences {
  const {
    fullName,
    email,
    phone,
    clinicBranch,
    emergencyPhone,
    visitReminders,
    vaccinationAlerts,
  } = settings;
  return {
    fullName,
    email,
    phone,
    clinicBranch,
    emergencyPhone,
    visitReminders,
    vaccinationAlerts,
  };
}

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const PHOTO_LIMIT = 750_000;
export const DEMO_PHOTO_LIMIT = 2_500;
