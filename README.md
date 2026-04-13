# Growth Logger

A personal development field journal. Logs directly to `~/growth_mind/raw/` as markdown files.

## Setup

```bash
cd growth-logger
npm install
npm run dev
```

Open http://localhost:3000

## Output location

By default writes to `~/growth_mind/raw/`. Override with an env variable:

```bash
LOG_OUTPUT_DIR=/your/custom/path npm run dev
```

Create a `.env.local` to make it persistent:

```
LOG_OUTPUT_DIR=/Users/nsubordin81/growth_mind/raw
```

## Files generated

- `quick_log_YYYY_MM_DD.md` — session logs, appended throughout the day
- `learning_snapshot_YYYY_MM_DD.md` — recall/Feynman snapshots, appended throughout the day

## Quick Log fields

| Field | Notes |
|-------|-------|
| Start / end time | Auto-fills current time for start |
| Title | Short label for the session |
| Goal area | DEV / MUSIC / FITNESS / ART / LEARNING / ADMIN / PERSONAL |
| What | What happened, activities, tasks |
| Why it matters | Goal connection |
| How I felt | Emotional state |
| Struggle level | 1–5 scale (beneficial challenge) |
| Struggle type | Cognitive / physical / emotional / none |
| Low-effort reward | Did you reach for easy dopamine? |
| Key insight | Write to future-you |
| Action items | Checkboxes in the markdown |
| Tags | Free-form hashtags |

## Learning Snapshot fields

| Field | Notes |
|-------|-------|
| Topic | What were you learning |
| Domain | Same goal areas as Quick Log |
| Confidence after recall | 1–5 |
| Recall attempt | Write before checking — this is the active retrieval |
| What you actually knew | After verifying |
| Confusions / gaps | Where your model broke down |
| Insight | What clicked |
| Micro-challenge | Concrete next action to deepen learning |
| Sources | References |
