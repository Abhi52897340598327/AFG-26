import { NextResponse } from "next/server";
import {
  runStuckModel,
  type DiagnoseRequest,
  type DiagnosticAnswers,
  type DiagnosticContext,
  type SessionRecord,
} from "@/model";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(
  payload: unknown,
): { ok: true; data: DiagnoseRequest } | { ok: false; error: string } {
  if (!isObject(payload)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const body = payload as {
    answers?: unknown;
    context?: unknown;
    history?: unknown;
  };

  if (body.answers !== undefined && !isObject(body.answers)) {
    return { ok: false, error: "Field `answers` must be an object when provided." };
  }
  if (body.context !== undefined && !isObject(body.context)) {
    return { ok: false, error: "Field `context` must be an object when provided." };
  }
  if (body.history !== undefined && !Array.isArray(body.history)) {
    return { ok: false, error: "Field `history` must be an array when provided." };
  }

  const data: DiagnoseRequest = {
    answers: (body.answers as Partial<DiagnosticAnswers>) ?? {},
    context: (body.context as DiagnosticContext | undefined) ?? {},
    history: (body.history as SessionRecord[] | undefined) ?? [],
  };

  return { ok: true, data };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = validatePayload(body);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = runStuckModel(validation.data);

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to parse request body." }, { status: 400 });
  }
}
