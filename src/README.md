# Growth Logger Static Config

This directory contains the static UI data configuration for the growth-logger app.

## File Structure

```
src/
├── app-config.ts          # Main configuration file (EDIT THIS WEEKLY)
├── UPDATE_GUIDE.md        # Instructions for weekly updates
└── README.md              # This file
```

## What Is This For?

The `src/app-config.ts` file contains all the static data that appears on your HomeScreen:

- **Active Goals** - Your 5 most important goals for the week
- **Weekly Focus** - Strategic priorities for the coming days
- **Domain Performance** - Stats on music, dev, art, fitness progress
- **Pattern Mitigation** - Your control over End-of-day Rush and YouTube Distraction

## Why a Separate Config File?

**Before:** All data was hardcoded in `app/page.tsx` (lines 177-196)

**After:** Data is in `src/app-config.ts`, imported by `app/page.tsx`

**Benefits:**
- ✅ Clean separation of data and UI
- ✅ Easier to update during weekly housekeeping
- ✅ Fewer TypeScript errors from manual editing
- ✅ Clear documentation of where to find each data source

## Weekly Update Process

1. **Sunday morning** - After processing the week's data

2. **Open `app-config.ts`** and update these sections:
   - Lines 17-36: `ACTIVE_GOALS` (from `wiki/goals/INDEX.md`)
   - Lines 39-48: `WEEKLY_FOCUS` (from `wiki/coaching-focus/`)
   - Lines 51-57: `DOMAIN_PERFORMANCE` (from `processed/weekly_*.md`)
   - Lines 60-63: `PATTERN_MITIGATION` (from pattern analysis)
   - Lines 66-74: `WEEKLY_SUMMARY` (from weekly processing)

3. **Save the file** - Next.js will hot-reload automatically

4. **Check your HomeScreen** - All values will update immediately

## Data Sources

| Config Section | Source File | Line Range in app-config.ts |
|----------------|-------------|------------|
| Active Goals | `wiki/goals/INDEX.md` | 17-36 |
| Weekly Focus | `wiki/coaching-focus/` | 39-48 |
| Domain Performance | `processed/weekly_*.md` | 51-57 |
| Pattern Mitigation | `processed/weekly_*.md` | 60-63 |
| Weekly Summary | `processed/weekly_*.md` | 66-74 |

## Commands

```bash
# See what's currently in config
cat src/app-config.ts

# Check for syntax errors
npx tsc --noEmit src/app-config.ts

# See git history for config changes
git log -1 -- src/app-config.ts

# Revert to last known good version
git checkout src/app-config.ts
```

## Troubleshooting

### "Cannot resolve module" error
Make sure you're using the correct import path:
```typescript
import { ACTIVE_GOALS, WEEKLY_FOCUS, ... } from '@/src/app-config'
```

### Data not updating
Check that:
1. You saved the file
2. Next.js is running (`npm run dev`)
3. You reloaded the page

### Syntax errors
Run `npx tsc --noEmit src/app-config.ts` to see specific errors

---

## For Developers

### Adding New Config Fields

1. Add field to `app-config.ts` with clear comments
2. Update `src/UPDATE_GUIDE.md` with instructions
3. Update `GROWTH_SCHEMA.md` to include in weekly checklist
4. Add to your HomeScreen React component where needed

### Example Addition

```typescript
// In app-config.ts:
export const WEEKLY_ACHIEVEMENTS = [
  { domain: 'Music', achievement: 'Finished song structure' },
  { domain: 'Dev', achievement: 'Implemented data schema' },
]

// In app/page.tsx HomeScreen:
const weeklyAchievements = WEEKLY_ACHIEVEMENTS

return (
  <div>
    {/* ...existing JSX... */}
    {weeklyAchievements.map(ach => (
      <div key={ach.domain}>{ach.achievement}</div>
    ))}
  </div>
)
```

---

*Last updated: 2026-05-04*
*Config file: `src/app-config.ts`*
*Total lines: ~77*
