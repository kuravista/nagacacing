<!--
Sync Impact Report
- Version: N/A → 1.0.0
- Modified principles: Created 4 principles (new)
- Added sections: Standards & Constraints; Development Workflow & Quality Gates
- Removed sections: Unused principle slot 5
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
  - .specify/templates/spec-template.md ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
  - .specify/templates/checklist-template.md ✅ no change
  - .specify/templates/agent-file-template.md ✅ no change
  - .specify/templates/commands/* ⚠ pending (directory absent)
- Runtime guidance updates:
  - README.md ⚠ pending (file not found)
- Deferred TODOs: None
-->

# Nagacacing Constitution

## Core Principles

### I. Code Quality & Maintainability (NON-NEGOTIABLE)

- All code MUST pass formatting, linting, and static analysis in CI before merge.
- Repository MUST define and enforce a consistent code style (formatter + linter configs).
- Public APIs MUST be typed (where language supports it) and documented with usage examples.
- Pull requests MUST be small, focused, and reviewed by at least one maintainer.
- No dead code, commented-out blocks, or unused dependencies may be merged.
- Security scanning and dependency vulnerability checks MUST run in CI for all changes.

Rationale: High-quality, consistent code reduces defects, accelerates onboarding, and lowers total cost of ownership.

### II. Test Discipline & Coverage (NON-NEGOTIABLE)

- Tests MUST be written first for P1 flows; at minimum included in the same PR as the feature/fix.
- Test suite MUST be deterministic and runnable locally and in CI within acceptable time limits.
- Coverage thresholds: ≥80% overall, ≥90% for changed lines (diff coverage). Critical paths target 100%.
- Test types:
  - Unit tests for business logic
  - Integration tests for cross-module and I/O boundaries
  - Contract tests for public APIs/protocols
  - UI tests for critical user journeys
- No merge if tests fail or coverage thresholds are not met unless an approved exception exists.

Rationale: Reliable, fast feedback enables safe change and continuous delivery.

### III. User Experience Consistency

- A single design system (components, tokens, patterns) MUST be used for UI work.
- Accessibility MUST meet WCAG 2.1 AA (contrast ≥4.5:1, keyboard navigation, focus states, ARIA where needed).
- Supported platforms/browsers/devices MUST be explicitly listed in the spec/plan for each feature.
- UX copy, empty/error/loading states, and interactions MUST be consistent across screens.
- Internationalization-ready text (no hard-coded strings) for user-facing copy unless scoped otherwise.

Rationale: Consistent UX improves usability, accessibility, and reduces rework.

### IV. Performance & Reliability Requirements

- Each feature MUST define performance goals and budgets in the plan/spec (e.g., p95 latency, memory).
- Defaults (override in plan/spec with rationale):
  - Backend primary endpoints: p95 < 200ms, p99 < 1s under expected load
  - Frontend: interactive in < 2s on 4G; 60 fps for critical interactions
- Performance tests or profiling MUST validate budgets for P1 paths before release.
- Observability is mandatory: structured logs, metrics, and traces for critical flows.
- Error budgets and alerting thresholds MUST be documented for production services.

Rationale: Explicit budgets prevent regressions and ensure predictable reliability.

## Standards & Constraints

- Definition of Done includes: green CI, coverage thresholds met, docs updated, and performance/UX checks passed.
- Semantic Versioning for public artifacts; document breaking changes with migration notes.
- API compatibility: breaking changes require a deprecation plan and versioned endpoints/schemas.
- Dependency policy: pin or lock dependencies; review transitive risk for critical updates.
- Secrets management: no secrets in code; use environment or secret stores with rotation.
- Code ownership: each area has accountable maintainers listed in CODEOWNERS (if available).

## Development Workflow, Reviews, and Quality Gates

Pre-merge gates (all MUST pass unless an approved exception exists):

1. Formatting, linting, type checks
2. Tests: unit, integration/contract as applicable; coverage thresholds
3. UX checks: design system usage, accessibility acceptance criteria
4. Performance: budgets documented and validated where applicable
5. Security: dependency and static analysis scans

Exceptions require an RFC/ADR linked in the PR, reviewer approval, and a time-bound follow-up task.

## Governance

- Authority: This constitution supersedes conflicting practices and templates.
- Amendments: Propose via PR including an ADR/RFC. Require maintainer approval.
- Versioning policy for this document:
  - MAJOR: Backward-incompatible removals or redefinitions
  - MINOR: New or materially expanded principles/sections
  - PATCH: Clarifications, wording, non-semantic refinements
- Compliance reviews: At least quarterly; violations tracked with owners and deadlines.

**Version**: 1.0.0 | **Ratified**: 2025-10-25 | **Last Amended**: 2025-10-25
