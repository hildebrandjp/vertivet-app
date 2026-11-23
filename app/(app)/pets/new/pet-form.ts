import { idleState } from "@/app/shared/forms/form-state";
import { createValidator, rules } from "@/app/shared/forms/validation";
import { fromISODate, toISODate } from "@/app/shared/utils/date";
import { PET_SPECIES } from "../../_lib/data/types";

export const PET_FIELDS = ["name", "species", "breed", "birthDate"] as const;
export type PetField = (typeof PET_FIELDS)[number];
export const INITIAL_PET_FORM = idleState<PetField>();

export const validatePet = createValidator<PetField>({
  name: [rules.required("Enter your pet’s name."), rules.maxLength(60)],
  species: [rules.required("Choose a species."), rules.oneOf(PET_SPECIES)],
  breed: [rules.required("Enter a breed or mixed breed."), rules.maxLength(80)],
  birthDate: [
    rules.required("Enter a date of birth."),
    (value) => {
      const date = fromISODate(value);
      if (!date || toISODate(date) !== value) return "Enter a valid date.";
      return value > toISODate(new Date())
        ? "Enter a date that is today or earlier."
        : null;
    },
  ],
});
