import { NextResponse } from "next/server";
import {
  diagnoseStuck,
  generateAdaptiveQuestions,
  type DiagnosticAnswers,
  type DiagnosticInput,
} from "@/model/stuckSentimentModel";

function isValidAnswers(answers: unknown): answers is DiagnosticAnswers {
  if (!answers || typeof answers !== "object") {
    return false;
  }
  const candidate = answers as Record<string, string>;

  const understandsQuestion = ["yes", "partly", "no"].includes(candidate.understandsQuestion);
  const canSubmitBadIn5Min = ["yes", "maybe", "no"].includes(candidate.canSubmitBadIn5Min);
  const strongestEmotion = ["anxious", "numb", "frustrated", "scared", "overwhelmed", "guilty"].includes(
    candidate.strongestEmotion,
  );
  const taskScope = ["small_clear", "large", "unclear", "large_and_unclear"].includes(candidate.taskScope);
  const gradeWorry = ["low", "medium", "high"].includes(candidate.gradeWorry);

  return understandsQuestion && canSubmitBadIn5Min && strongestEmotion && taskScope && gradeWorry;
}

function validatePayload(payload: unknown): { ok: true; data: DiagnosticInput } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const body = payload as Partial<DiagnosticInput>;
  if (!body.subject || typeof body.subject !== "string") {
    return { ok: false, error: "Field `subject` is required." };
  }
  if (!body.assignmentType || typeof body.assignmentType !== "string") {
    return { ok: false, error: "Field `assignmentType` is required." };
  }
  if (!isValidAnswers(body.answers)) {
    return { ok: false, error: "Field `answers` is missing or invalid." };
  }

  const safePayload: DiagnosticInput = {
    subject: body.subject,
    assignmentType: body.assignmentType,
    assignmentText: typeof body.assignmentText === "string" ? body.assignmentText : undefined,
    studentStatement: typeof body.studentStatement === "string" ? body.studentStatement : undefined,
    selfTalk: Array.isArray(body.selfTalk) ? body.selfTalk.filter((entry): entry is string => typeof entry === "string") : undefined,
    answers: body.answers,
    signals: body.signals,
  };

  return { ok: true, data: safePayload };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = validatePayload(body);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const diagnosis = diagnoseStuck(validation.data);

    return NextResponse.json(
      {
        diagnosis,
        adaptiveQuestions: generateAdaptiveQuestions(validation.data.answers),
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Failed to parse request body." }, { status: 400 });
  }
}
