import {
  type DiagnosisResult,
  type DiagnosticContext,
  type InterventionPlan,
  type InterventionStep,
  type SessionRecord,
  type StuckType,
} from "./types";

interface InterventionTemplate {
  headline: string;
  whyThisWorks: string;
  steps: InterventionStep[];
  reflectionPrompt: string;
}

const INTERVENTION_LIBRARY: Record<StuckType, InterventionTemplate> = {
  confusion: {
    headline: "You are not lazy. You are missing a concept link.",
    whyThisWorks:
      "Concept confusion improves fastest when you isolate the exact gap instead of rereading everything.",
    steps: [
      {
        id: "confusion-1",
        instruction:
          "Write one sentence: 'The part I do not understand is ____.'",
        minutes: 2,
      },
      {
        id: "confusion-2",
        instruction:
          "Break the task into prerequisites and mark which one is missing.",
        minutes: 5,
      },
      {
        id: "confusion-3",
        instruction:
          "Use a help request template: 'I understand A and B, but not C. Can you explain C with one example?'",
        minutes: 3,
      },
    ],
    reflectionPrompt: "After this block, what concept is now clearer?",
  },
  ambiguity: {
    headline: "You need a definition of done, not more effort.",
    whyThisWorks:
      "Ambiguity paralysis resolves when completion criteria are explicit and small.",
    steps: [
      {
        id: "ambiguity-1",
        instruction:
          "Define minimum viable submission in one line (what must exist to earn partial credit).",
        minutes: 3,
      },
      {
        id: "ambiguity-2",
        instruction: "Create a 3-item checklist of acceptable completion.",
        minutes: 4,
      },
      {
        id: "ambiguity-3",
        instruction:
          "Complete only checklist item 1 before touching style or polish.",
        minutes: 10,
      },
    ],
    reflectionPrompt: "Did your checklist remove uncertainty about done?",
  },
  fear: {
    headline: "You are protecting your identity, not avoiding work.",
    whyThisWorks:
      "Fear-based paralysis decreases when outcome and identity are separated and effort starts in low-stakes mode.",
    steps: [
      {
        id: "fear-1",
        instruction:
          "Say: 'My grade is data, not identity.' Then open question 1.",
        minutes: 1,
      },
      {
        id: "fear-2",
        instruction:
          "Run ugly first draft mode for 5 minutes. Wrong answers allowed. No edits.",
        minutes: 5,
      },
      {
        id: "fear-3",
        instruction:
          "Do one 5-minute exposure: attempt the hardest part without checking correctness.",
        minutes: 5,
      },
    ],
    reflectionPrompt: "Did starting lower fear intensity after 5 minutes?",
  },
  overwhelm: {
    headline: "The task is too large for your current working memory.",
    whyThisWorks:
      "Overwhelm improves when scope is collapsed into one visible action at a time.",
    steps: [
      {
        id: "overwhelm-1",
        instruction:
          "Close all unrelated tabs and leave only one assignment visible.",
        minutes: 2,
      },
      {
        id: "overwhelm-2",
        instruction:
          "Convert the assignment into a single 10-minute action unit.",
        minutes: 3,
      },
      {
        id: "overwhelm-3",
        instruction:
          "Run a 10-minute focus timer on only that action. No planning during timer.",
        minutes: 10,
      },
    ],
    reflectionPrompt: "What single action helped you regain momentum?",
  },
  exhaustion: {
    headline: "Your brain needs recovery before effort will work.",
    whyThisWorks:
      "Cognitive exhaustion needs energy management first, then lightweight restart.",
    steps: [
      {
        id: "exhaustion-1",
        instruction:
          "Take a 12-minute reset: water, movement, no screens, no guilt.",
        minutes: 12,
      },
      {
        id: "exhaustion-2",
        instruction:
          "Choose one low-friction starter action (title page, outline, first equation setup).",
        minutes: 5,
      },
      {
        id: "exhaustion-3",
        instruction:
          "Schedule the next deep-work block for your highest-energy time tomorrow.",
        minutes: 3,
      },
    ],
    reflectionPrompt: "Did your energy improve enough for a starter action?",
  },
  perfection_loop: {
    headline: "You are trapped in quality control before completion.",
    whyThisWorks:
      "Perfection loops break when completion is timed and editing is delayed.",
    steps: [
      {
        id: "perfection-1",
        instruction: "Set a forced-submit timer for a rough draft checkpoint.",
        minutes: 1,
      },
      {
        id: "perfection-2",
        instruction:
          "Write uninterrupted for 8 minutes. You are not allowed to backspace for style.",
        minutes: 8,
      },
      {
        id: "perfection-3",
        instruction:
          "Do one pass for correctness only. Stop after checklist is satisfied.",
        minutes: 6,
      },
    ],
    reflectionPrompt: "Where did extra polishing stop adding real grade value?",
  },
};

const BASE_GUARDRAILS = [
  "This tool supports learning; it does not complete assignments for students.",
  "Interventions should never be used to cheat or bypass academic integrity rules.",
  "If distress is severe or persistent, prompt escalation to a counselor or trusted adult.",
];

export function buildInterventionPlan(
  diagnosis: DiagnosisResult,
  context: DiagnosticContext = {},
  history: SessionRecord[] = [],
): InterventionPlan {
  const template = INTERVENTION_LIBRARY[diagnosis.primaryType];
  const subject = context.subject?.trim();

  const steps = template.steps.map((step) => ({
    ...step,
    instruction: subject
      ? `${step.instruction} (${subject})`
      : step.instruction,
  }));

  const repeatCount = history.filter(
    (session) => session.stuckType === diagnosis.primaryType,
  ).length;

  const escalationPrompt =
    repeatCount >= 3
      ? "This stuck type has repeated several times. Consider reaching out to a teacher, tutor, or counselor with your symptom pattern."
      : undefined;

  return {
    stuckType: diagnosis.primaryType,
    headline: template.headline,
    whyThisWorks: template.whyThisWorks,
    firstAction: steps[0]?.instruction ?? "Start with one tiny action.",
    steps,
    reflectionPrompt: template.reflectionPrompt,
    escalationPrompt,
    guardrails: BASE_GUARDRAILS,
  };
}
