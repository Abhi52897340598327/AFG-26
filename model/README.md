# Stuck Model Runtime

## What this module does
- Runs a 5-question adaptive diagnostic flow.
- Classifies one of 6 stuck types with confidence.
- Returns a type-specific intervention plan.
- Builds trend insights from historical sessions.

## Main entry point
- `runStuckModel(request)` in `model/engine.ts`

## API route
- `POST /api/stuck/diagnose`

### Example payload
```json
{
  "answers": {
    "understandsQuestion": "yes",
    "canSubmitBadInFiveMinutes": "no",
    "strongestEmotion": "anxious",
    "taskScope": "small_clear",
    "gradeWorry": "high"
  },
  "context": {
    "subject": "Chemistry",
    "assignmentType": "Homework",
    "timeStuckMinutes": 45,
    "tasksOpenCount": 3,
    "energyLevel": 3,
    "panicLevel": 4
  },
  "history": []
}
```

### Example response shape
```json
{
  "status": "diagnosed",
  "diagnosis": {
    "primaryType": "fear",
    "confidence": 0.82,
    "rankedTypes": [],
    "summary": "Fear Stuck detected (82% confidence)."
  },
  "plan": {
    "stuckType": "fear",
    "headline": "You are protecting your identity, not avoiding work.",
    "firstAction": "Say: 'My grade is data, not identity.' Then open question 1. (Chemistry)"
  },
  "insights": [],
  "profile": {
    "totalSessions": 0,
    "byType": {
      "confusion": 0,
      "ambiguity": 0,
      "fear": 0,
      "overwhelm": 0,
      "exhaustion": 0,
      "perfection_loop": 0
    },
    "bySubjectAndType": {},
    "averageTimeStuckMinutes": 0
  }
}
```
