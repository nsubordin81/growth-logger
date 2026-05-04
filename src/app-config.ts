// Growth Logger Static Data Configuration
// Updated weekly during housekeeping by the Growth Mind Agent
// DO NOT EDIT manually - use the data from wiki/goals/INDEX.md, wiki/coaching-focus/, and processed/weekly_*.md

// Your active goals and priority framework
// Updated weekly from wiki/goals/INDEX.md
// Format: id (from INDEX.md), domain, title, status ('Active' or 'URGENT'), priority emoji
export const ACTIVE_GOALS = [
  { 
    id: 'G-007', 
    domain: 'Health', 
    title: 'Weight Loss (210→195 lbs)', 
    status: 'URGENT', 
    priority: '🔴' 
  },
  { 
    id: 'G-001', 
    domain: 'Music', 
    title: 'Songwriting, Guitar Technique', 
    status: 'Active', 
    priority: '🔴' 
  },
  { 
    id: 'G-002', 
    domain: 'Dev', 
    title: 'Data Architecture, ML Pipeline', 
    status: 'Active', 
    priority: '🟠' 
  },
  { 
    id: 'G-003', 
    domain: 'Art', 
    title: 'Synapse Flux, Blender Modeling', 
    status: 'Active', 
    priority: '🟠' 
  },
  { 
    id: 'G-004', 
    domain: 'Fitness', 
    title: 'Push-ups, Strength Training', 
    status: 'Active', 
    priority: '🟢' 
  },
]

// Weekly focus items from coaching
// Updated weekly from wiki/coaching-focus/ directory
// Format: label, recommended action, current status
export const WEEKLY_FOCUS = [
  { 
    label: 'Morning Priority', 
    action: 'Complete before 9 AM', 
    status: '⏳ Not started' 
  },
  { 
    label: 'YouTube Control', 
    action: 'Reward after work only', 
    status: '✅ Monitoring' 
  },
  { 
    label: 'Focus Blocks', 
    action: '60-90 min single-domain', 
    status: '⏳ Not started' 
  },
]

// Domain performance metrics from processed/weekly_*.md
// Updated weekly after processing the previous week's data
// Format: domain, total time this week, quality rating
export const DOMAIN_PERFORMANCE = [
  { domain: 'Art (Synapse)', time: '2,818 min', quality: '3.9/5' },
  { domain: 'Dev', time: '7,328 min', quality: '3.4/5' },
  { domain: 'Stretching', time: '146 min', quality: '1.1/5' },
  { domain: 'Push-ups', time: '536 min', quality: '1.2/5' },
]

// Pattern mitigation scores (1-5 scale, higher = better)
// Updated weekly from processed/weekly_*.md pattern analysis
export const PATTERN_MITIGATION = {
  endOfDayRush: 4,         // 1-5 scale (1=never mitigated, 5=fully controlled)
  youTubeDistraction: 3,   // 1-5 scale (1=never mitigated, 5=fully controlled)
}

// Weekly progress summary
// Updated weekly from processed/weekly_*.md
export const WEEKLY_SUMMARY = {
  week: '2026-W17',
  musicHours: 3,
  devHours: 12,
  patternRushCount: 5,      // Number of End-of-day Rush incidents this week
  patternYouTubeCount: 7,   // Number of YouTube Distraction incidents this week
}
