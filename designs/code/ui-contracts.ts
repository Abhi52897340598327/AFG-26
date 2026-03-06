export type StuckButtonKind =
  | "primary"
  | "secondary"
  | "danger"
  | "chip"
  | "outline";

export interface StuckButtonContract {
  id: string;
  label: string;
  kind: StuckButtonKind;
  disabled?: boolean;
  ariaLabel?: string;
}

export interface StuckCardContract {
  id: string;
  title: string;
  subtitle?: string;
  actions?: StuckButtonContract[];
}

export interface StuckScreenContract {
  id: "home" | "diagnosis" | "result";
  cards: StuckCardContract[];
}

export const STUCK_SCREEN_CONTRACTS: StuckScreenContract[] = [
  {
    id: "home",
    cards: [
      {
        id: "trigger-card",
        title: "Start When You Freeze",
        actions: [
          { id: "start-diagnosis", label: "I'M STUCK", kind: "primary" },
          { id: "load-demo-context", label: "Load Demo Context", kind: "secondary" }
        ]
      }
    ]
  },
  {
    id: "diagnosis",
    cards: [
      {
        id: "question-card",
        title: "Adaptive Questionnaire",
        actions: [
          { id: "go-back", label: "Back", kind: "outline" },
          { id: "go-next", label: "Next", kind: "primary" },
          { id: "restart", label: "Restart", kind: "secondary" }
        ]
      }
    ]
  },
  {
    id: "result",
    cards: [
      {
        id: "plan-card",
        title: "Intervention Plan",
        actions: [
          { id: "save-session", label: "Save Session", kind: "primary" },
          { id: "new-diagnosis", label: "New Diagnosis", kind: "secondary" },
          { id: "back-home", label: "Back To Home", kind: "outline" }
        ]
      }
    ]
  }
];
