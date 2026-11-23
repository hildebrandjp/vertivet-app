import "server-only";
import { cookies } from "next/headers";
import {
  type PracticeSettings,
  type SettingsPatch,
  validateSettingsPatch,
} from "./settings";

const COOKIE = "vv_demo_clinic_settings";
const DEFAULTS: PracticeSettings["operations"] = {
  consultationMinutes: 30,
  cleanupMinutes: 5,
  opensAt: "08:00",
  closesAt: "18:00",
  triageStartsAt: "08:00",
  triageEndsAt: "09:30",
  audioAlert: true,
  allocations: [
    { roomId: "suite-2", staffId: "sarah" },
    { roomId: "surgery-a", staffId: "robert" },
  ],
  roster: [
    { staffId: "sarah", startsAt: "08:00", endsAt: "17:00" },
    { staffId: "robert", startsAt: "09:00", endsAt: "17:30" },
  ],
  formulary: [
    { id: "oral-formulary", enabled: true },
    { id: "topical-formulary", enabled: true },
  ],
};

const BASE: PracticeSettings = {
  profile: {
    title: "Lead Surgeon & Small Animal Clinician",
    license: "VET-98214-WA",
  },
  operations: DEFAULTS,
  defaults: DEFAULTS,
  rooms: [
    {
      id: "suite-2",
      name: "Exam Suite 2",
      equipment: "Ultrasound, ophthalmoscope",
    },
    {
      id: "surgery-a",
      name: "Surgery Theater A",
      equipment: "Surgical monitoring station",
    },
  ],
  staff: [
    { id: "sarah", name: "Dr. Sarah Jenkins" },
    { id: "robert", name: "Dr. Robert Hayes" },
  ],
  medications: [
    { id: "oral-formulary", name: "Oral medications" },
    { id: "topical-formulary", name: "Topical medications" },
  ],
  labIntegration: { name: "Lab Link", status: "disconnected" },
  helpDesk: "Ext. 4099 (Lab Link)",
};

export async function readDemoSettings(): Promise<PracticeSettings> {
  try {
    const saved = validateSettingsPatch(
      JSON.parse((await cookies()).get(COOKIE)?.value ?? "{}"),
    );
    if (typeof saved !== "string") return { ...BASE, ...saved };
  } catch {
    // A malformed demo cookie falls back to sample settings.
  }
  return BASE;
}

export async function storeDemoSettings(
  patch: SettingsPatch,
): Promise<PracticeSettings | null> {
  const next = { ...(await readDemoSettings()), ...patch };
  const value = JSON.stringify({
    profile: next.profile,
    operations: next.operations,
  });
  if (encodeURIComponent(value).length > 3800) return null;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/clinic",
  });
  return next;
}

export async function clearDemoSettings() {
  (await cookies()).set(COOKIE, "", { path: "/clinic", maxAge: 0 });
}
