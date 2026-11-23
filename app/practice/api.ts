import {
  type BookAppointmentInput,
  PRACTICE_GRAPHQL,
  type RegisterPatientInput,
  type SignInInput,
  type WorkspaceSnapshot,
} from "@/shared/practice/contracts";

async function request<T>(
  query: string,
  variables?: object,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(PRACTICE_GRAPHQL.path, {
    method: "POST",
    headers: { "Content-Type": PRACTICE_GRAPHQL.mediaType },
    body: JSON.stringify({ query, variables }),
    signal,
  });
  const result: { data?: T; errors?: { message: string }[] } =
    await response.json();
  if (!response.ok || result.errors?.length || !result.data) {
    throw new Error(
      result.errors?.[0]?.message ?? "The request could not be completed.",
    );
  }
  return result.data;
}

export type Offsets = { patientOffset: number; appointmentOffset: number };

export const api = {
  async load(offsets: Offsets, signal?: AbortSignal) {
    const { workspace } = await request<{
      workspace: WorkspaceSnapshot | null;
    }>(
      `query($patientOffset:Int!, $appointmentOffset:Int!) {
        workspace(patientOffset:$patientOffset, appointmentOffset:$appointmentOffset) {
          member { name clinic }
          patients { hasMore items { id name owner species } }
          appointments { hasMore items { id patient startsAt reason } }
        }
      }`,
      offsets,
      signal,
    );
    return workspace;
  },
  async signIn(input: SignInInput) {
    await request(
      "mutation($clinic:String!,$email:String!,$password:String!){signIn(clinic:$clinic,email:$email,password:$password)}",
      input,
    );
  },
  async signOut() {
    await request("mutation { signOut }");
  },
  async register(input: RegisterPatientInput) {
    await request(
      "mutation($name:String!,$species:Species!,$owner:String!,$email:String!){registerPatient(name:$name,species:$species,owner:$owner,email:$email){id}}",
      input,
    );
  },
  async book(input: BookAppointmentInput) {
    await request(
      "mutation($patientId:ID!,$startsAt:String!,$reason:String!){bookAppointment(patientId:$patientId,startsAt:$startsAt,reason:$reason){id}}",
      input,
    );
  },
};
