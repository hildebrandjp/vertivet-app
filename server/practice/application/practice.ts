import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { normalizeEmail } from "@/app/shared/forms/normalize";
import { isEmail } from "@/app/shared/forms/validation";

import {
  type Appointment,
  type BookAppointmentInput,
  LIMITS,
  type MemberSummary,
  type Patient,
  type RegisterPatientInput,
  SPECIES,
  WORKSPACE_PAGE_SIZE,
} from "../../../shared/practice/contracts";

const deriveKey = promisify(scrypt);
const SECONDS_PER_HOUR = 60 * 60;
const MILLISECONDS_PER_SECOND = 1000;
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEY_BYTES = 64;
const SESSION_TOKEN_BYTES = 32;
const HEX_CHARACTERS_PER_BYTE = 2;
const LEGACY_LIST_LIMIT = 100;
const INVALID_CREDENTIALS = "Invalid clinic or credentials.";
const ISO_UTC_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const SESSION_TOKEN_PATTERN = new RegExp(
  `^[a-f0-9]{${SESSION_TOKEN_BYTES * HEX_CHARACTERS_PER_BYTE}}$`,
);
const FALLBACK_PASSWORD_HASH = {
  salt: Buffer.alloc(PASSWORD_SALT_BYTES).toString("hex"),
  key: Buffer.alloc(PASSWORD_KEY_BYTES).toString("hex"),
};

export const SESSION_SECONDS = 8 * SECONDS_PER_HOUR;

export interface Member extends MemberSummary {
  clinicId: string;
  userId: string;
}

export interface PracticeStore {
  credentials(
    clinic: string,
    email: string,
  ): Promise<(Member & { passwordHash: string }) | undefined>;
  createSession(
    member: Member,
    hash: string,
    expires: string,
    previousHash?: string,
  ): Promise<void>;
  session(hash: string, now: string): Promise<Member | undefined>;
  revoke(hash: string): Promise<void>;
  patients(clinicId: string, offset: number, limit: number): Promise<Patient[]>;
  appointments(
    clinicId: string,
    offset: number,
    limit: number,
  ): Promise<Appointment[]>;
  addPatient(
    clinicId: string,
    input: RegisterPatientInput & { id: string },
  ): Promise<Patient>;
  addAppointment(
    clinicId: string,
    input: BookAppointmentInput & { id: string },
  ): Promise<Appointment | undefined>;
}

export class PracticeError extends Error {}

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function hashPassword(password: string) {
  const salt = randomBytes(PASSWORD_SALT_BYTES).toString("hex");
  const key = (await deriveKey(password, salt, PASSWORD_KEY_BYTES)) as Buffer;
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
    async signIn(
      clinic: string,
      email: string,
      password: string,
      previousToken?: string,
    ) {
      if (
        clinic.length > LIMITS.clinic ||
        email.length > LIMITS.email ||
        password.length > LIMITS.password
      )
        throw new PracticeError(INVALID_CREDENTIALS);
      const user = await store.credentials(
        clinic.trim().toLowerCase(),
        normalizeEmail(email),
      );
      const [
        salt = FALLBACK_PASSWORD_HASH.salt,
        expected = FALLBACK_PASSWORD_HASH.key,
      ] = user?.passwordHash.split(":") ?? [];
      const key = (await deriveKey(
        password,
        salt,
        PASSWORD_KEY_BYTES,
      )) as Buffer;
      const expectedKey = Buffer.from(expected, "hex");
      if (
        !user ||
        expectedKey.length !== key.length ||
        !timingSafeEqual(key, expectedKey)
      ) {
        throw new PracticeError(INVALID_CREDENTIALS);
      }
      const token = randomBytes(SESSION_TOKEN_BYTES).toString("hex");
      await store.createSession(
        user,
        hashToken(token),
        new Date(
          Date.now() + SESSION_SECONDS * MILLISECONDS_PER_SECOND,
        ).toISOString(),
        previousToken && hashToken(previousToken),
      );
      return token;
    },
    member(token: string | undefined) {
      return token && SESSION_TOKEN_PATTERN.test(token)
        ? store.session(hashToken(token), new Date().toISOString())
        : undefined;
    },
    async signOut(token: string | undefined) {
      if (token) await store.revoke(hashToken(token));
    },
    patients: (member: Member) =>
      store.patients(member.clinicId, 0, LEGACY_LIST_LIMIT),
    appointments: (member: Member) =>
      store.appointments(member.clinicId, 0, LEGACY_LIST_LIMIT),
    async workspace(
      member: Member,
      patientOffset: number,
      appointmentOffset: number,
    ) {
      if (
        [patientOffset, appointmentOffset].some(
          (offset) => !Number.isSafeInteger(offset) || offset < 0,
        )
      )
        throw new PracticeError("Choose a valid results page.");
      const limit = WORKSPACE_PAGE_SIZE + 1;
      const [patients, appointments] = await Promise.all([
        store.patients(member.clinicId, patientOffset, limit),
        store.appointments(member.clinicId, appointmentOffset, limit),
      ]);
      const { name, clinic } = member;
      return {
        member: { name, clinic },
        patients: {
          items: patients.slice(0, WORKSPACE_PAGE_SIZE),
          hasMore: patients.length === limit,
        },
        appointments: {
          items: appointments.slice(0, WORKSPACE_PAGE_SIZE),
          hasMore: appointments.length === limit,
        },
      };
    },
    register(member: Member, input: RegisterPatientInput) {
      const email = normalizeEmail(
        required(input.email, LIMITS.email, "owner email"),
      );
      if (!isEmail(email))
        throw new PracticeError("Enter a valid owner email.");
      if (!SPECIES.includes(input.species))
        throw new PracticeError("Choose a species.");
      return store.addPatient(member.clinicId, {
        id: randomUUID(),
        name: required(input.name, LIMITS.name, "patient name"),
        species: input.species,
        owner: required(input.owner, LIMITS.name, "owner name"),
        email,
      });
    },
    async book(member: Member, input: BookAppointmentInput) {
      const date = new Date(input.startsAt);
      if (
        !ISO_UTC_TIMESTAMP.test(input.startsAt) ||
        !Number.isFinite(+date) ||
        date.toISOString() !== input.startsAt ||
        +date <= Date.now()
      ) {
        throw new PracticeError("Choose a valid future appointment time.");
      }
      const saved = await store.addAppointment(member.clinicId, {
        id: randomUUID(),
        patientId: required(input.patientId, LIMITS.patientId, "patient"),
        startsAt: date.toISOString(),
        reason: required(input.reason, LIMITS.reason, "visit reason"),
      });
      if (!saved)
        throw new PracticeError(
          "The patient is unavailable or already booked at that time.",
        );
      return saved;
    },
  };
}
