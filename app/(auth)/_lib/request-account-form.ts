/**
 * Request-a-clinic-account form contract (pure: shared by client and server).
 * Option lists live here so the Combobox and the validator never disagree.
 */
import type { Option } from "@/app/shared/common";
import { type FormState, idleState } from "@/app/shared/forms/form-state";
import { createValidator, rules } from "@/app/shared/forms/validation";

export const CLINIC_TYPES: Option[] = [
  { value: "general-practice", label: "General veterinary practice" },
  { value: "animal-hospital", label: "Animal hospital" },
  { value: "specialty-referral", label: "Specialty / referral centre" },
  { value: "emergency", label: "Emergency & critical care" },
  { value: "mobile", label: "Mobile veterinary service" },
  { value: "shelter", label: "Shelter or rescue" },
];

export const TEAM_SIZES: Option[] = [
  { value: "1", label: "1 veterinarian" },
  { value: "2-5", label: "2–5 veterinarians" },
  { value: "6-15", label: "6–15 veterinarians" },
  { value: "16+", label: "16+ veterinarians" },
];

export const MESSAGE_MAX_LENGTH = 1000;

export const REQUEST_ACCOUNT_FIELDS = [
  "clinicName",
  "clinicType",
  "contactName",
  "email",
  "phone",
  "teamSize",
  "message",
  "consent",
] as const;
export type RequestAccountField = (typeof REQUEST_ACCOUNT_FIELDS)[number];

export type RequestAccountState = FormState<RequestAccountField>;
export const REQUEST_ACCOUNT_INITIAL_STATE: RequestAccountState = idleState();

const optionValues = (options: Option[]) => options.map((o) => o.value);

export const validateRequestAccount = createValidator<RequestAccountField>({
  clinicName: [
    rules.required("Enter your clinic's name."),
    rules.maxLength(120),
  ],
  clinicType: [
    rules.required("Select your clinic type."),
    rules.oneOf(optionValues(CLINIC_TYPES)),
  ],
  contactName: [
    rules.required("Enter the contact person's name."),
    rules.maxLength(80),
  ],
  email: [
    rules.required("Enter a work email address."),
    rules.email("Enter a valid email address."),
  ],
  phone: [rules.required("Enter a clinic phone number."), rules.phone()],
  teamSize: [
    rules.required("Select your team size."),
    rules.oneOf(optionValues(TEAM_SIZES)),
  ],
  message: [rules.maxLength(MESSAGE_MAX_LENGTH)],
  consent: [
    rules.required(
      "Please confirm you are authorised to register this clinic.",
    ),
  ],
});
