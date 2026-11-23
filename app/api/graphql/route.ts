import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_SECONDS } from "@/server/practice/application/practice";
import { runPracticeGraphQL } from "@/server/practice/graphql/schema";
import { getPracticeService } from "@/server/practice/infrastructure/runtime";
import { PRACTICE_GRAPHQL_PATH } from "@/shared/practice/contracts";

const COOKIE = "vv_practice_session";

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
    if (size > 16_384) {
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
    return failure("Origin is not allowed.", 403);
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  ) {
    return failure("Send a JSON request.", 415);
  }
  let body: unknown;
  try {
    body = await readBody(request);
  } catch (error) {
    return error instanceof RangeError
      ? failure("Request is too large.", 413)
      : failure("Invalid JSON.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return failure("Invalid GraphQL request.", 400);
  const { query, variables, operationName } = body as Record<string, unknown>;
  if (
    typeof query !== "string" ||
    (variables != null &&
      (typeof variables !== "object" || Array.isArray(variables))) ||
    (operationName != null && typeof operationName !== "string")
  ) {
    return failure("Invalid GraphQL request.", 400);
  }
  const { result, nextToken } = await runPracticeGraphQL(
    getPracticeService(),
    {
      query,
      variables: variables as Record<string, unknown> | undefined,
      operationName:
        typeof operationName === "string" ? operationName : undefined,
    },
    request.cookies.get(COOKIE)?.value,
  );
  const response = NextResponse.json(result, {
    headers: { "Cache-Control": "private, no-store" },
  });
  if (nextToken !== undefined) {
    response.cookies.set(COOKIE, nextToken ?? "", {
      path: PRACTICE_GRAPHQL_PATH,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: nextToken ? SESSION_SECONDS : 0,
    });
  }
  return response;
}
