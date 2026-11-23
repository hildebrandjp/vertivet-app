import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt);
const SPECIES = ["dog", "cat", "rabbit", "bird", "other"] as const;
export type Species = (typeof SPECIES)[number];
export const SESSION_SECONDS = 8 * 60 * 60;

export interface Member {
  clinicId: string;
  clinic: string;
  userId: string;
  name: string;
}
export interface Patient {
  id: string;
  name: string;
  species: Species;
  owner: string;
}
export interface Appointment {
  id: string;
  patient: string;
  startsAt: string;
  reason: string;
}

export interface PracticeStore {
  credentials(
    clinic: string,
    email: string,
  ): Promise<(Member & { passwordHash: string }) | undefined>;
  createSession(member: Member, hash: string, expires: string): Promise<void>;
  session(hash: string, now: string): Promise<Member | undefined>;
  revoke(hash: string): Promise<void>;
  patients(clinicId: string): Promise<Patient[]>;
  appointments(clinicId: string): Promise<Appointment[]>;
  addPatient(
    clinicId: string,
    input: {
      id: string;
      name: string;
      species: Species;
      owner: string;
      email: string;
    },
  ): Promise<Patient>;
  addAppointment(
    clinicId: string,
    input: { id: string; patientId: string; startsAt: string; reason: string },
  ): Promise<Appointment | undefined>;
}

export class PracticeError extends Error {}

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const passwordSalt = "00000000000000000000000000000000";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await deriveKey(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

function required(value: string, max: number, label: string) {
  const clean = value.trim();
  if (!clean || clean.length > max)
    throw new PracticeError(`Enter a valid ${label}.`);
  return clean;
}

export function practice(store: PracticeStore) {
  return {
    async signIn(clinic: string, email: string, password: string) {
      if (clinic.length > 80 || email.length > 254 || password.length > 256)
        throw new PracticeError("Invalid clinic or credentials.");
      const user = await store.credentials(
        clinic.trim().toLowerCase(),
        normalizeEmail(email),
      );
      const [salt = passwordSalt, expected = "00".repeat(64)] =
        user?.passwordHash.split(":") ?? [];
      const key = (await deriveKey(password, salt, 64)) as Buffer;
      const expectedKey = Buffer.from(expected, "hex");
      if (
        !user ||
        expectedKey.length !== key.length ||
        !timingSafeEqual(key, expectedKey)
      ) {
        throw new PracticeError("Invalid clinic or credentials.");
      }
      const token = randomBytes(32).toString("hex");
      await store.createSession(
        user,
        hashToken(token),
        new Date(Date.now() + SESSION_SECONDS * 1000).toISOString(),
      );
      return token;
    },
    member(token: string | undefined) {
      return token && /^[a-f0-9]{64}$/.test(token)
        ? store.session(hashToken(token), new Date().toISOString())
        : undefined;
    },
    async signOut(token: string | undefined) {
      if (token) await store.revoke(hashToken(token));
    },
    patients: (member: Member) => store.patients(member.clinicId),
    appointments: (member: Member) => store.appointments(member.clinicId),
    register(
      member: Member,
      input: { name: string; species: Species; owner: string; email: string },
    ) {
      const email = normalizeEmail(required(input.email, 254, "owner email"));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new PracticeError("Enter a valid owner email.");
      if (!SPECIES.includes(input.species))
        throw new PracticeError("Choose a species.");
      return store.addPatient(member.clinicId, {
        id: randomUUID(),
        name: required(input.name, 100, "patient name"),
        species: input.species,
        owner: required(input.owner, 100, "owner name"),
        email,
      });
    },
    async book(
      member: Member,
      input: { patientId: string; startsAt: string; reason: string },
    ) {
      const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(
        input.startsAt,
      );
      const date = new Date(input.startsAt);
      if (
        !iso ||
        !Number.isFinite(+date) ||
        date.toISOString() !== input.startsAt ||
        +date <= Date.now()
      ) {
        throw new PracticeError("Choose a valid future appointment time.");
      }
      const saved = await store.addAppointment(member.clinicId, {
        id: randomUUID(),
        patientId: required(input.patientId, 80, "patient"),
        startsAt: date.toISOString(),
        reason: required(input.reason, 160, "visit reason"),
      });
      if (!saved)
        throw new PracticeError(
          "The patient is unavailable or already booked at that time.",
        );
      return saved;
    },
  };
}
