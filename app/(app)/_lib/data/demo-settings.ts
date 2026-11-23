import "server-only";
import { cookies } from "next/headers";
import { DEMO_USER } from "./demo-data";
import type { OwnerPreferences, OwnerSettings } from "./settings-types";

const SETTINGS_COOKIE = "vertivet_demo_settings";
const PHOTO_COOKIE = "vertivet_demo_avatar";

const defaults: OwnerSettings = {
  fullName: `${DEMO_USER.firstName} ${DEMO_USER.lastName}`,
  email: DEMO_USER.email,
  phone: "+1 (555) 234-5678",
  clinicBranch: "VertiVet Central — 450 Health Ave",
  emergencyPhone: "",
  visitReminders: true,
  vaccinationAlerts: true,
  memberSince: "2024",
  memberId: "VR-40912",
};

export async function getDemoSettings(): Promise<OwnerSettings> {
  const store = await cookies();
  const settings: OwnerSettings = { ...defaults };
  try {
    const saved = JSON.parse(store.get(SETTINGS_COOKIE)?.value ?? "{}");
    for (const key of [
      "fullName",
      "email",
      "phone",
      "clinicBranch",
      "emergencyPhone",
      "savedAt",
    ] as const) {
      if (typeof saved?.[key] === "string") settings[key] = saved[key];
    }
    for (const key of ["visitReminders", "vaccinationAlerts"] as const) {
      if (typeof saved?.[key] === "boolean") settings[key] = saved[key];
    }
  } catch {
    // A malformed development cookie can be replaced on the next save.
  }
  const photo = store.get(PHOTO_COOKIE)?.value;
  if (photo && /^[A-Za-z0-9+/]+={0,2}$/.test(photo)) {
    settings.avatarUrl = `data:image/jpeg;base64,${photo}`;
  }
  return settings;
}

export async function saveDemoSettings(
  preferences: OwnerPreferences,
  photo?: File,
): Promise<OwnerSettings | null> {
  const store = await cookies();
  const saved = { ...preferences, savedAt: new Date().toISOString() };
  const value = JSON.stringify(saved);
  if (encodeURIComponent(value).length > 3800) return null;

  const options = { httpOnly: true, sameSite: "lax", path: "/" } as const;
  const base64 =
    photo && Buffer.from(await photo.arrayBuffer()).toString("base64");
  if (base64 && encodeURIComponent(base64).length > 3800) return null;

  store.set(SETTINGS_COOKIE, value, options);
  if (base64) store.set(PHOTO_COOKIE, base64, options);
  return {
    ...defaults,
    ...saved,
    avatarUrl: base64
      ? `data:image/jpeg;base64,${base64}`
      : (await getDemoSettings()).avatarUrl,
  };
}
