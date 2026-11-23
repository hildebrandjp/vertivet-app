import {
  buildSchema,
  execute,
  GraphQLError,
  getOperationAST,
  parse,
  validate,
  visit,
} from "graphql";
import {
  type BookAppointmentInput,
  type RegisterPatientInput,
  type SignInInput,
  SPECIES,
} from "../../../shared/practice/contracts";
import {
  type Member,
  PracticeError,
  type practice,
} from "../application/practice";

const schema = buildSchema(`
  enum Species { ${SPECIES.join(" ")} }
  type Member { name: String!, clinic: String! }
  type Patient { id: ID!, name: String!, species: Species!, owner: String! }
  type Appointment { id: ID!, patient: String!, startsAt: String!, reason: String! }
  type PatientPage { items: [Patient!]!, hasMore: Boolean! }
  type AppointmentPage { items: [Appointment!]!, hasMore: Boolean! }
  type Workspace { member: Member!, patients: PatientPage!, appointments: AppointmentPage! }
  type Query {
    me: Member
    patients: [Patient!]!
    appointments: [Appointment!]!
    workspace(patientOffset: Int! = 0, appointmentOffset: Int! = 0): Workspace
  }
  type Mutation {
    signIn(clinic: String!, email: String!, password: String!): Boolean!
    signOut: Boolean!
    registerPatient(name: String!, species: Species!, owner: String!, email: String!): Patient!
    bookAppointment(patientId: ID!, startsAt: String!, reason: String!): Appointment!
  }
`);

type Service = ReturnType<typeof practice>;

export async function runPracticeGraphQL(
  service: Service,
  input: {
    query: string;
    variables?: Record<string, unknown>;
    operationName?: string;
  },
  token?: string,
) {
  let document: ReturnType<typeof parse>;
  try {
    document = parse(input.query, { maxTokens: 500 });
  } catch (error) {
    if (error instanceof GraphQLError)
      return { result: { errors: [error.toJSON()] } };
    throw error;
  }
  let fields = 0;
  visit(document, {
    Field: () => {
      fields++;
    },
  });
  if (
    fields > 40 ||
    document.definitions.some((node) => node.kind === "FragmentDefinition")
  ) {
    return {
      result: {
        errors: [
          { message: "Use a smaller operation without named fragments." },
        ],
      },
    };
  }
  const errors = validate(schema, document);
  if (errors.length)
    return { result: { errors: errors.map((error) => error.toJSON()) } };

  const operation = getOperationAST(document, input.operationName);
  if (
    operation?.operation === "mutation" &&
    operation.selectionSet.selections.length !== 1
  ) {
    return {
      result: { errors: [{ message: "Send one mutation field per request." }] },
    };
  }

  let nextToken: string | null | undefined;
  let authenticated: Promise<Member | undefined> | undefined;
  const member = () =>
    (authenticated ??= Promise.resolve(service.member(token)));
  async function requireMember() {
    const current = await member();
    if (!current) throw new PracticeError("Sign in to access this clinic.");
    return current;
  }
  const rootValue = {
    me: member,
    patients: async () => service.patients(await requireMember()),
    appointments: async () => service.appointments(await requireMember()),
    workspace: async ({
      patientOffset,
      appointmentOffset,
    }: {
      patientOffset: number;
      appointmentOffset: number;
    }) => {
      const current = await member();
      return current
        ? service.workspace(current, patientOffset, appointmentOffset)
        : null;
    },
    signIn: async ({ clinic, email, password }: SignInInput) => {
      nextToken = await service.signIn(clinic, email, password, token);
      return true;
    },
    signOut: async () => {
      await service.signOut(token);
      nextToken = null;
      return true;
    },
    registerPatient: async (input: RegisterPatientInput) =>
      service.register(await requireMember(), input),
    bookAppointment: async (input: BookAppointmentInput) =>
      service.book(await requireMember(), input),
  };
  const response = await execute({
    schema,
    document,
    rootValue,
    variableValues: input.variables,
    operationName: input.operationName,
  });
  return {
    nextToken,
    result: {
      ...response,
      ...(response.errors && {
        errors: response.errors.map((error) => {
          if (
            !error.originalError ||
            error.originalError instanceof PracticeError
          )
            return error.toJSON();
          console.error(
            "Practice GraphQL request failed:",
            error.originalError,
          );
          return { message: "The request could not be completed." };
        }),
      }),
    },
  };
}
