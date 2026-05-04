# Growth Logger Config Update Guide

This guide explains how to update the static data in `src/app-config.ts` during your weekly housekeeping.

## What This File Does

`src/app-config.ts` contains all the static UI data that changes weekly:
- Your active goals (from `wiki/goals/INDEX.md`)
- Weekly focus areas (from `wiki/coaching-focus/`)
- Domain performance metrics (from `processed/weekly_*.md`)
- Pattern mitigation scores (from pattern analysis)

## Weekly Update Checklist

### 1. Update Active Goals (Line ~17)

**Source:** `wiki/goals/INDEX.md`

**What to do:**
1. Read `wiki/goals/INDEX.md`
2. Copy all active goals (not archived ones)
3. For each goal, extract:
   - `id` (e.g., "G-007")
   - `domain` (e.g., "Health")
   - `title` (e.g., "Weight Loss (210→195 lbs)")
   - `status` ("URGENT" or "Active")
   - `priority` emoji (🔴, 🟠, 🟢)

**Example from INDEX.md:**
```
### Active Goals
🔴 G-007 | Health | Weight Loss (210→195 lbs) | URGENT
🔴 G-001 | Music | Songwriting, Guitar Technique | Active
```

**Becomes in config:**
```typescript
{ 
  id: 'G-007', 
  domain: 'Health', 
  title: 'Weight Loss (210→195 lbs)', 
  status: 'URGENT', 
  priority: '🔴' 
},
```

---

### 2. Update Weekly Focus Items (Line ~40)

**Source:** `wiki/coaching-focus/` directory

**What to do:**
1. Check `wiki/coaching-focus/` for this week's focus
2. Copy each focus item:
   - `label` (e.g., "Morning Priority")
   - `action` (e.g., "Complete before 9 AM")
   - `status` (⏳ Not started, 🟡 In progress, ✅ Completed)

**Becomes in config:**
```typescript
{ 
  label: 'Morning Priority', 
  action: 'Complete before 9 AM', 
  status: '⏳ Not started' 
},
```

---

### 3. Update Domain Performance (Line ~53)

**Source:** `processed/weekly_*.md`

**What to do:**
1. Read your latest `processed/weekly_*.md`
2. Find the "Domain Performance" section
3. Copy each domain's data:
   - `domain` name (e.g., "Art (Synapse)")
   - `time` this week (e.g., "2,818 min")
   - `quality` rating (e.g., "3.9/5")

**Example from process week summary:**
```
### Domain Performance
| Domain | Time | Quality |
|--------|------|---------|
| Art (Synapse) | 2,818 min | 3.9/5 |
| Dev | 7,328 min | 3.4/5 |
```

**Becomes in config:**
```typescript
{ domain: 'Art (Synapse)', time: '2,818 min', quality: '3.9/5' },
{ domain: 'Dev', time: '7,328 min', quality: '3.4/5' },
```

---

### 4. Update Pattern Mitigation Scores (Line ~68)

**Source:** `processed/weekly_*.md` pattern analysis

**What to do:**
1. Find the pattern analysis section
2. Count instances of:
   - End-of-day Rush incidents
   - YouTube Distraction incidents
3. Convert to 1-5 scale:
   - 1 = Never mitigated
   - 3 = Partially mitigated
   - 5 = Fully controlled

**Example pattern section in weekly:**
```
### Pattern Metrics
- End-of-day Rush: 4/5 (good progress)
- YouTube Distraction: 3/5 (monitoring)
```

**Becomes in config:**
```typescript
PATTERN_MITIGATION = {
  endOfDayRush: 4,
  youTubeDistraction: 3,
}
```

---

### 5. Update Weekly Summary (Line ~76)

**Source:** `processed/weekly_*.md`

**What to do:**
1. Copy the week number (e.g., "2026-W17")
2. Copy hours spent in each domain
3. Copy pattern incident counts

**Becomes in config:**
```typescript
WEEKLY_SUMMARY = {
  week: '2026-W17',
  musicHours: 3,
  devHours: 12,
  patternRushCount: 5,
  patternYouTubeCount: 7,
}
```

---

## Quick Reference: Where To Find Each Data Source

| Data | Source File | Section Name |
|------|------------|--------------|
| Active Goals | `wiki/goals/INDEX.md` | "Active Goals" |
| Weekly Focus | `wiki/coaching-focus/` | All files |
| Domain Performance | `processed/weekly_*.md` | "Domain Performance" |
| Pattern Mitigation | `processed/weekly_*.md` | "Pattern Metrics" |
| Weekly Summary | `processed/weekly_*.md` | Summary totals |

---

## What Happens After You Edit This File?

1. Your Next.js app automatically uses the new values
2. No server restart needed
3. The HomeScreen will show the updated data on next page load
4. All forms continue to use the same API endpoints

---

## Emergency Commands

If you make a typo or break the file:

```bash
# Check for syntax errors
npx tsc --noEmit src/app-config.ts

# Revert to last working version
git checkout src/app-config.ts

# View last commit that changed it
git log -1 -- src/app-config.ts
```

---

## Best Practices

1. **Update on Sunday** after processing the week's data
2. **Use the exact format above** - no extra commas or quotes
3. **Match emoji exactly** - 🔴, 🟠, 🟢 are case-sensitive
4. **Keep the same order** - don't reorganize the arrays
5. **Comment changes** - add `// Updated YYYY-MM-DD` if major changes

---

*Updated: 2026-05-04*
*Config file: `src/app-config.ts`*
