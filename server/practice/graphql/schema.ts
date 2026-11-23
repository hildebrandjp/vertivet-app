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
  type Member,
  PracticeError,
  type practice,
  type Species,
} from "../application/practice";

const schema = buildSchema(`
  enum Species { dog cat rabbit bird other }
  type Member { name: String!, clinic: String! }
  type Patient { id: ID!, name: String!, species: Species!, owner: String! }
  type Appointment { id: ID!, patient: String!, startsAt: String!, reason: String! }
  type Query { me: Member, patients: [Patient!]!, appointments: [Appointment!]! }
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
    signIn: async ({
      clinic,
      email,
      password,
    }: {
      clinic: string;
      email: string;
      password: string;
    }) => {
      if (nextToken !== undefined)
        throw new PracticeError("Submit one session change per request.");
      nextToken = await service.signIn(clinic, email, password);
      if (token) await service.signOut(token);
      return true;
    },
    signOut: async () => {
      if (nextToken !== undefined)
        throw new PracticeError("Submit one session change per request.");
      await service.signOut(token);
      authenticated = Promise.resolve(undefined);
      nextToken = null;
      return true;
    },
    registerPatient: async (input: {
      name: string;
      species: Species;
      owner: string;
      email: string;
    }) => service.register(await requireMember(), input),
    bookAppointment: async (input: {
      patientId: string;
      startsAt: string;
      reason: string;
    }) => service.book(await requireMember(), input),
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
