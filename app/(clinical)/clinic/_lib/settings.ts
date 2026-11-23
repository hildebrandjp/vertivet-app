export interface ProfessionalProfile {
  title: string;
  license: string;
}

export interface PracticeOperations {
  consultationMinutes: number;
  cleanupMinutes: number;
  opensAt: string;
  closesAt: string;
  triageStartsAt: string;
  triageEndsAt: string;
  audioAlert: boolean;
  allocations: { roomId: string; staffId: string }[];
  roster: { staffId: string; startsAt: string; endsAt: string }[];
  formulary: { id: string; enabled: boolean }[];
}

export interface PracticeSettings {
  profile: ProfessionalProfile;
  operations: PracticeOperations;
  defaults: PracticeOperations;
  rooms: { id: string; name: string; equipment?: string }[];
  staff: { id: string; name: string }[];
  medications: { id: string; name: string; description?: string }[];
  labIntegration?: { name: string; status: "connected" | "disconnected" };
  helpDesk?: string;
}

export interface SettingsPatch {
  profile?: ProfessionalProfile;
  operations?: PracticeOperations;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

const text = (value: unknown, max: number) =>
  typeof value === "string" && value.length <= max;
const time = (value: unknown): value is string =>
  typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

function rows<T>(
  value: unknown,
  pick: (row: Record<string, unknown>) => T | null,
  key: (row: T) => string,
): T[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  const output: T[] = [];
  const ids = new Set<string>();
  for (const entry of value) {
    const row = record(entry);
    const item = row && pick(row);
    if (!item || ids.has(key(item))) return null;
    ids.add(key(item));
    output.push(item);
  }
  return output;
}

const id = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= 128;

export function validateSettingsPatch(input: unknown): SettingsPatch | string {
  const patch = record(input);
  if (!patch || (patch.profile === undefined && patch.operations === undefined))
    return "No settings changes were supplied.";
  const result: SettingsPatch = {};
  if (patch.profile !== undefined) {
    const profile = record(patch.profile);
    if (
      !profile ||
      typeof profile.title !== "string" ||
      typeof profile.license !== "string" ||
      !text(profile.title, 100) ||
      !text(profile.license, 60)
    )
      return "Check the professional title and license number.";
    result.profile = {
      title: profile.title.trim(),
      license: profile.license.trim(),
    };
  }

  if (patch.operations !== undefined) {
    const settings = record(patch.operations);
    if (!settings) return "Check the practice settings.";
    const {
      consultationMinutes,
      cleanupMinutes,
      opensAt,
      closesAt,
      triageStartsAt,
      triageEndsAt,
      audioAlert,
    } = settings;
    if (
      typeof consultationMinutes !== "number" ||
      !Number.isInteger(consultationMinutes) ||
      consultationMinutes < 5 ||
      consultationMinutes > 240 ||
      typeof cleanupMinutes !== "number" ||
      !Number.isInteger(cleanupMinutes) ||
      cleanupMinutes < 0 ||
      cleanupMinutes > 120
    ) {
      return "Enter a consultation duration from 5 to 240 minutes and a cleanup buffer from 0 to 120 minutes.";
    }
    if (!time(opensAt) || !time(closesAt) || opensAt >= closesAt)
      return "Clinic opening time must be before closing time.";
    if (
      !time(triageStartsAt) ||
      !time(triageEndsAt) ||
      triageStartsAt >= triageEndsAt ||
      triageStartsAt < opensAt ||
      triageEndsAt > closesAt
    ) {
      return "The emergency triage period must fall within clinic operating hours.";
    }
    if (typeof audioAlert !== "boolean")
      return "Check the audio alert preference.";
    const allocations = rows(
      settings.allocations,
      ({ roomId, staffId }) =>
        id(roomId) && (staffId === "" || id(staffId))
          ? { roomId, staffId }
          : null,
      (row) => row.roomId,
    );
    const roster = rows(
      settings.roster,
      ({ staffId, startsAt, endsAt }) =>
        id(staffId) && time(startsAt) && time(endsAt) && startsAt < endsAt
          ? { staffId, startsAt, endsAt }
          : null,
      (row) => row.staffId,
    );
    const formulary = rows(
      settings.formulary,
      (row) =>
        id(row.id) && typeof row.enabled === "boolean"
          ? { id: row.id, enabled: row.enabled }
          : null,
      (row) => row.id,
    );
    if (!allocations || !roster || !formulary)
      return "Check room assignments, roster shifts, and formulary entries.";
    result.operations = {
      consultationMinutes,
      cleanupMinutes,
      opensAt,
      closesAt,
      triageStartsAt,
      triageEndsAt,
      audioAlert,
      allocations,
      roster,
      formulary,
    };
  }
  return result;
}
