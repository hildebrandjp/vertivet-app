"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import {
  type FormState,
  fieldErrorState,
  messageErrorState,
  readFields,
} from "@/app/shared/forms/form-state";
import { createPet } from "../../_lib/data/dal";
import { PET_SPECIES } from "../../_lib/data/types";
import { PET_FIELDS, type PetField, validatePet } from "./pet-form";

export async function addPet(
  _previous: FormState<PetField>,
  formData: FormData,
): Promise<FormState<PetField>> {
  const values = readFields(formData, PET_FIELDS);
  const result = validatePet(values);
  if (!result.success) return fieldErrorState(result.fieldErrors, values);

  const { name, breed, birthDate } = result.data;
  const species = PET_SPECIES.find((item) => item === result.data.species);
  if (!species)
    return fieldErrorState({ species: "Choose a species." }, values);

  const status = await createPet({
    name: name.trim(),
    breed: breed.trim(),
    birthDate,
    species,
  });
  if (status !== "saved") {
    return messageErrorState(
      {
        title: "Pet profile could not be saved",
        message:
          status === "limited"
            ? "This browser session has reached the demo pet storage limit."
            : "Try again in a moment.",
      },
      values,
    );
  }

  revalidatePath(ROUTES.pets);
  redirect(ROUTES.pets);
}
