# Workspace Structure Reference

Every project using the Autonomous SDLC framework operates within a structured workspace.
This document defines the directory layout and file conventions.

---

## Directory Layout

```
{project}-sdlc/
│
├── state.json                          # Master state tracker (updated continuously)
│
├── backlog/
│   ├── backlog.json                    # Current prioritized backlog
│   └── archive/
│       ├── backlog-cycle-1.json        # Archived backlog from cycle 1
│       └── backlog-cycle-2.json        # Archived backlog from cycle 2
│
├── specs/
│   ├── spec-ITEM-001.md               # Technical spec for ITEM-001
│   ├── spec-ITEM-002.md               # Technical spec for ITEM-002
│   └── ...
│
├── builds/
│   ├── build-report-ITEM-001.json     # Build report for ITEM-001
│   ├── build-report-ITEM-002.json     # Build report for ITEM-002
│   └── ...
│
├── reports/
│   ├── verify-report-ITEM-001.json    # Verification report
│   ├── harden-report-ITEM-001.json    # Hardening report
│   ├── monitor-report.json            # Latest health check
│   ├── iteration-report-cycle-1.json  # Cycle 1 retrospective
│   ├── iteration-report-cycle-2.json  # Cycle 2 retrospective
│   └── cycle-summary-1.json           # Cycle 1 executive summary
│
├── releases/
│   ├── release-report.json            # Latest release info
│   └── CHANGELOG.md                   # Cumulative changelog
│
└── logs/
    ├── gate-log.json                  # All quality gate results
    ├── gate-failures.json             # Failed gate attempts
    └── activity-log.json              # Chronological activity log
```

---

## File Conventions

### Naming

```
Reports:     {phase}-report-{ITEM-ID}.json
Specs:       spec-{ITEM-ID}.md
Backlogs:    backlog.json (current), backlog-cycle-{N}.json (archived)
Iterations:  iteration-report-cycle-{N}.json
Summaries:   cycle-summary-{N}.json
Logs:        {type}-log.json
```

### Item IDs

```
Format: ITEM-{NNN}
Examples: ITEM-001, ITEM-042, ITEM-100
IDs are never reused. They increment monotonically across cycles.
```

### Timestamps

All timestamps use ISO 8601 format: `2026-02-12T10:30:00Z`

---

## State.json Schema

```json
{
  "project": "string — project name",
  "current_phase": "DISCOVER | DESIGN | BUILD | VERIFY | HARDEN | RELEASE | MONITOR | ITERATE",
  "current_item": "string — current ITEM-ID or null",
  "cycle": "number — current cycle count",
  "started_at": "ISO timestamp — when the SDLC was initialized",
  "last_updated": "ISO timestamp — last state update",
  
  "backlog": {
    "total": "number",
    "completed": "number",
    "in_progress": "number",
    "blocked": "number",
    "remaining": "number"
  },
  
  "quality_gates": {
    "total_checks": "number",
    "passed": "number",
    "warned": "number",
    "failed": "number",
    "retried": "number"
  },
  
  "metrics": {
    "builds_successful": "number",
    "builds_failed": "number",
    "tests_passed": "number",
    "tests_failed": "number",
    "type_errors": "number",
    "lint_warnings": "number",
    "files_changed": "number",
    "lines_added": "number",
    "lines_removed": "number"
  },
  
  "phase_history": [
    {
      "phase": "string",
      "item": "string",
      "result": "PASS | WARN | FAIL | BLOCKED",
      "duration_sec": "number",
      "timestamp": "ISO timestamp"
    }
  ],
  
  "blocked_items": [
    {
      "id": "string",
      "blocked_at_phase": "string",
      "root_cause": "string",
      "attempts": "number",
      "blocked_since": "ISO timestamp"
    }
  ]
}
```

---

## Activity Log Format

### logs/activity-log.json

Chronological record of every significant action:

```json
{
  "activities": [
    {
      "timestamp": "2026-02-12T10:00:00Z",
      "phase": "DISCOVER",
      "action": "codebase_scan",
      "item": null,
      "details": "Scanned 142 files across 23 directories",
      "result": "completed"
    },
    {
      "timestamp": "2026-02-12T10:02:00Z",
      "phase": "DISCOVER",
      "action": "backlog_generated",
      "item": null,
      "details": "Generated 15 items (2 P0, 5 P1, 6 P2, 2 P3)",
      "result": "completed"
    },
    {
      "timestamp": "2026-02-12T10:05:00Z",
      "phase": "DESIGN",
      "action": "spec_created",
      "item": "ITEM-001",
      "details": "Technical spec for TypeScript build error fixes",
      "result": "completed"
    }
  ]
}
```

---

## Workspace Initialization

Use the init script to set up a new workspace:

```bash
bash scripts/init-state.sh {project-name}
```

This creates all directories, initializes state.json, and creates empty log files.
