import "server-only";
import { cookies } from "next/headers";
import { DEMO_PETS } from "./demo-data";
import { type NewPet, PET_SPECIES, type Pet } from "./types";

const COOKIE_NAME = "vertivet_demo_pets";

async function getAddedPets(): Promise<Pet[]> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return [];
  try {
    const pets: unknown = JSON.parse(value);
    if (!Array.isArray(pets)) return [];
    return pets.flatMap((pet) => {
      const species = PET_SPECIES.find((item) => item === pet?.species);
      if (
        !species ||
        typeof pet?.id !== "string" ||
        typeof pet.name !== "string" ||
        typeof pet.breed !== "string" ||
        typeof pet.birthDate !== "string"
      )
        return [];
      const { id, name, breed, birthDate } = pet;
      return [{ id, name, species, breed, birthDate }];
    });
  } catch {
    return [];
  }
}

export async function getDemoPets(): Promise<Pet[]> {
  return [...DEMO_PETS, ...(await getAddedPets())];
}

export async function addDemoPet(input: NewPet): Promise<boolean> {
  const pets = await getAddedPets();
  const value = JSON.stringify([
    ...pets,
    { ...input, id: crypto.randomUUID() },
  ]);
  // Leave room for the cookie name and attributes after URL encoding.
  if (encodeURIComponent(value).length > 3800) return false;
  (await cookies()).set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return true;
}
