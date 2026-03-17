import { NextResponse } from "next/server";
import { runStuckModel, type DiagnoseRequest, type SessionRecord } from "@/model";

function safeHistory(value: unknown): SessionRecord[] {
  return Array.isArray(value) ? (value as SessionRecord[]) : [];
}

export async function GET(): Promise<Response> {
  return NextResponse.json({
    message:
      "POST diagnostic answers to this endpoint to classify a stuck session and get an intervention plan.",
  });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as Partial<DiagnoseRequest> | null;

    const result = runStuckModel({
      answers: body?.answers ?? {},
      context: body?.context ?? {},
      history: safeHistory(body?.history),
    });

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload. Provide JSON with answers/context/history." },
      { status: 400 },
    );
  }
}
