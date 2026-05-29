# Quality Gates Reference

Quality gates are mandatory checkpoints between phases. No phase transition
occurs without passing the relevant gate. Gates are enforced by the Coordinator.

---

## Gate Definitions

### Gate: DISCOVER → DESIGN (`discovery-complete`)

| Check | Pass Criteria | Verification |
|-------|-------------|--------------|
| Backlog exists | `backlog.json` created and valid JSON | `python3 -c "import json; json.load(open('backlog/backlog.json'))"` |
| Items have required fields | Each item has: id, title, priority, effort, acceptance_criteria | Script validation |
| Priorities assigned | Every item has P0-P3 | Check `priority` field |
| At least 1 item | Backlog is not empty | `jq '.items | length' backlog.json` |
| State assessment complete | All 10 dimensions scored | Check `state_assessment` object |

### Gate: DESIGN → BUILD (`design-complete`)

| Check | Pass Criteria | Verification |
|-------|-------------|--------------|
| Spec exists | `specs/spec-{ITEM-ID}.md` created | File exists |
| Acceptance criteria defined | At least 1 testable criterion | Manual check |
| Files identified | Files to create/modify listed | Spec contains sections |
| Scope defined | IN/OUT scope clearly stated | Spec contains sections |
| Effort matches item | Spec complexity ~ item effort estimate | Sanity check |

### Gate: BUILD → VERIFY (`build-green`)

| Check | Pass Criteria | Verification |
|-------|-------------|--------------|
| Code compiles | Zero TypeScript/compilation errors | `npx tsc --noEmit; echo $?` → 0 |
| Build succeeds | Production build completes | `npm run build; echo $?` → 0 |
| Tests pass | All tests pass (including pre-existing) | `npm test; echo $?` → 0 |
| No new lint errors | Zero new ESLint errors introduced | `npm run lint 2>&1 | grep "error" | wc -l` → 0 |
| Build report exists | `builds/build-report-{ITEM-ID}.json` created | File exists and valid JSON |

### Gate: VERIFY → HARDEN (`verify-passed`)

| Check | Pass Criteria | Verification |
|-------|-------------|--------------|
| Verify report exists | `reports/verify-report-{ITEM-ID}.json` created | File exists |
| Overall verdict | Verdict is PASS or WARN (not FAIL) | `jq '.overall_verdict' report.json` |
| All critical checks pass | Build, typecheck, tests, acceptance all PASS | Check individual statuses |
| Acceptance criteria met | 100% acceptance criteria pass rate | `jq '.checks.acceptance_criteria.passed == .checks.acceptance_criteria.total'` |

### Gate: HARDEN → RELEASE (`harden-cleared`)

| Check | Pass Criteria | Verification |
|-------|-------------|--------------|
| Harden report exists | `reports/harden-report-{ITEM-ID}.json` created | File exists |
| No CRITICAL findings | Zero CRITICAL severity findings | Check report |
| No blocking issues | `blocking_issues` array is empty | `jq '.blocking_issues | length' report.json` → 0 |
| Security clean | No exposed secrets, no XSS vectors | Check `security.status` |
| Error handling verified | All async operations have error handling | Check `error_handling.status` |

### Gate: RELEASE → MONITOR (`release-done`)

| Check | Pass Criteria | Verification |
|-------|-------------|--------------|
| Build artifacts created | Production build output exists | `ls dist/ OR ls build/ OR ls .next/` |
| Version bumped | Version number incremented | Compare with previous |
| Changelog updated | New entry in CHANGELOG.md | Check file modification |
| Release report exists | `releases/release-report.json` created | File exists |

### Gate: MONITOR → ITERATE (`health-verified`)

| Check | Pass Criteria | Verification |
|-------|-------------|--------------|
| App starts | Application process starts without crash | PID check |
| Routes respond | All checked routes return 2xx status | HTTP status codes |
| No runtime errors | Zero unhandled exceptions in logs | Log scan |
| Monitor report exists | `reports/monitor-report.json` created | File exists |
| Overall health | Health is HEALTHY or DEGRADED (not UNHEALTHY) | Check `overall_health` |

---

## Gate Enforcement Protocol

```
WHEN transitioning from Phase A to Phase B:

1. READ the gate definition for A → B
2. EXECUTE each check in the gate
3. SCORE each check: PASS / FAIL
4. IF all checks PASS:
   → Log gate result to logs/gate-log.json
   → Proceed to Phase B
5. IF any check FAILS:
   → Log failure to logs/gate-failures.json
   → Execute remediation (return to Phase A for fixes)
   → Re-run gate (up to 3 retries)
   → If 3 retries fail:
     → Mark item as BLOCKED
     → Log root cause
     → Move to next backlog item
```

---

## Gate Log Format

### logs/gate-log.json

```json
{
  "gates": [
    {
      "gate": "build-green",
      "item": "ITEM-003",
      "timestamp": "2026-02-12T10:20:00Z",
      "attempt": 1,
      "result": "PASS",
      "checks": {
        "code_compiles": "PASS",
        "build_succeeds": "PASS",
        "tests_pass": "PASS",
        "no_new_lint_errors": "PASS",
        "build_report_exists": "PASS"
      },
      "duration_sec": 12
    }
  ]
}
```

### logs/gate-failures.json

```json
{
  "failures": [
    {
      "gate": "build-green",
      "item": "ITEM-005",
      "timestamp": "2026-02-12T10:35:00Z",
      "attempt": 1,
      "failed_checks": {
        "code_compiles": {
          "result": "FAIL",
          "error": "TS2305: Module 'utils' has no exported member 'parseConfig'",
          "file": "src/config/loader.ts",
          "line": 12
        }
      },
      "remediation": "Fix import statement in loader.ts",
      "retrying": true
    }
  ]
}
```

---

## Gate Bypass Rules

Gates can NEVER be bypassed for:
- Build compilation (code must compile)
- Test suite (tests must pass)
- Security findings rated CRITICAL

Gates can be downgraded to WARN for:
- Lint warnings (not errors)
- Performance recommendations
- Documentation completeness
- Accessibility (for P2/P3 items only)

A WARN allows progression but is tracked for the Iterator to address in the next cycle.
