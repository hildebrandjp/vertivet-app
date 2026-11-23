import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_SECONDS } from "@/server/practice/application/practice";
import { runPracticeGraphQL } from "@/server/practice/graphql/schema";
import { getPracticeService } from "@/server/practice/infrastructure/runtime";
import { PRACTICE_GRAPHQL } from "@/shared/practice/contracts";

const SESSION_COOKIE_NAME = "vv_practice_session";
const MAX_REQUEST_BYTES = 16 * 1024;
const HTTP_STATUS = {
  badRequest: 400,
  forbidden: 403,
  payloadTooLarge: 413,
  unsupportedMediaType: 415,
} as const;
const INVALID_GRAPHQL_REQUEST = "Invalid GraphQL request.";

function failure(message: string, status: number) {
  return NextResponse.json({ errors: [{ message }] }, { status });
}

async function readBody(request: NextRequest): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let text = "";
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return JSON.parse(text + decoder.decode());
    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new RangeError("Request too large");
    }
    text += decoder.decode(value, { stream: true });
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const allowedOrigin =
    process.env.VERTIVET_ORIGIN ||
    (host ? `${request.nextUrl.protocol}//${host}` : request.nextUrl.origin);
  if (origin && origin !== allowedOrigin)
    return failure("Origin is not allowed.", HTTP_STATUS.forbidden);
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    PRACTICE_GRAPHQL.mediaType
  ) {
    return failure("Send a JSON request.", HTTP_STATUS.unsupportedMediaType);
  }
  let body: unknown;
  try {
    body = await readBody(request);
  } catch (error) {
    return error instanceof RangeError
      ? failure("Request is too large.", HTTP_STATUS.payloadTooLarge)
      : failure("Invalid JSON.", HTTP_STATUS.badRequest);
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return failure(INVALID_GRAPHQL_REQUEST, HTTP_STATUS.badRequest);
  const { query, variables, operationName } = body as Record<string, unknown>;
  if (
    typeof query !== "string" ||
    (variables != null &&
      (typeof variables !== "object" || Array.isArray(variables))) ||
    (operationName != null && typeof operationName !== "string")
  ) {
    return failure(INVALID_GRAPHQL_REQUEST, HTTP_STATUS.badRequest);
  }
  const { result, nextToken } = await runPracticeGraphQL(
    getPracticeService(),
    {
      query,
      variables: variables as Record<string, unknown> | undefined,
      operationName:
        typeof operationName === "string" ? operationName : undefined,
    },
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  const response = NextResponse.json(result, {
    headers: { "Cache-Control": "private, no-store" },
  });
  if (nextToken !== undefined) {
    response.cookies.set(SESSION_COOKIE_NAME, nextToken ?? "", {
      path: PRACTICE_GRAPHQL.path,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: nextToken ? SESSION_SECONDS : 0,
    });
  }
  return response;
}
