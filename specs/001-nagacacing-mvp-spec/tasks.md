---

description: "Implementation task list grouped by user stories for NagaCacing MVP V1.0"
---

# Tasks: NagaCacing MVP V1.0

**Input**: Design documents from `/specs/001-nagacacing-mvp-spec/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests MUST be included for P1 stories and critical paths per Constitution II.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create repo structure per plan (`backend/`, `frontend/`, tests)
- [X] T002 Initialize frontend (Vite + TS) with PixiJS, Zustand, Zod, ESLint/Prettier
- [X] T003 Initialize backend (Node 20 + TS) with yahoo-finance2, AWS SDK S3, zod, p-limit, logger
- [X] T004 [P] Configure linting, formatting, TS strict, and CI workflows (format/lint/type/test)
- [X] T005 [P] Configure dependency/security scanning in CI

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T010 Define `contracts/data.schema.json` and validate example payloads in `backend/tests/contract`
- [X] T011 [P] Implement backend scaffolding: `backend/src/fetch/yahoo.ts`, `build/generateDataJson.ts`, `upload/r2.ts`
- [X] T012 [P] Implement cron entry `backend/src/cron.ts` with 15-min schedule (doc/runbook)
- [X] T013 [P] Load `docs/group_konglo.json` and implement loader/normalizer (groupId e.g., G-BARITO); validate tickers vs dataset
- [X] T014 [P] Frontend bootstrap with `DATA_JSON_URL` env and schema validation
- [X] T015 Implement retry with backoff (1s, 5s, 30s) and fallback UI states
- [X] T016 Add a11y utilities and global styles (contrast tokens)

Checkpoint: Foundation ready — user stories can start.

---

## Phase 3: User Story 1 — Explore Market Story Map (P1) 🎯

Tests (MANDATORY first):
- [X] T101 [P] E2E test: load `data.json`, render ≥900 bubbles, show badge version
- [X] T102 [P] Unit tests: color/radius scales, z-score highlight thresholds

Implementation:
- [X] T110 Setup PixiJS engine `frontend/src/viz/engine.ts` with instancing & spatial index
- [X] T111 Implement scales `frontend/src/viz/scales.ts` (radius √marketCap; color −10→0→+10)
- [X] T112 Implement highlight effect based on z-score
- [X] T113 Layout/packing with collision avoidance within 16ms/frame avg
- [X] T114 Badge version `version/generatedAt` display component

---

## Phase 4: User Story 2 — Inspect Ticker via Pop‑up (P1)

Tests (MANDATORY first):
- [X] T201 [P] E2E: click bubble → popup ≤120ms, no screen edge overflow

Implementation:
- [X] T210 `PopupCard.tsx` with `name, symbol, price, changePct, volume, marketCap, spark7?`
- [X] T211 Mini‑chart render when `spark7` present; placeholder otherwise
- [X] T212 Close on outside click / Esc; focus trap

---

## Phase 5: User Story 3 — Find and Narrow with Filters (P2)

Tests:
- [X] T301 [P] Unit: search (case‑insensitive, prefix+substring) with 150ms debounce
- [X] T302 [P] Perf test: slider update <200ms for 900 bubbles

Implementation:
- [X] T310 `Controls.tsx` search input + market cap quantile slider (Q1–Q4)
- [X] T311 AND logic combination; Reset control
- [X] T312 Mode "Cacing Hunter" (≤Q2 highlight)

---

## Phase 6: User Story 4 — Share a Snapshot (P2)

Tests:
- [X] T401 [P] Unit: snapshot PNG ≤3MB for viewport resolution

Implementation:
- [X] T410 `services/snapshot.ts`: render‑to‑PNG of canvas only; add watermark text with ≥4.5:1 contrast

---

## Phase 7: User Story 5 — First‑time Guidance and Feedback (P3)

Implementation:
- [X] T510 Onboarding modal (once via localStorage) + accessible keyboard flow
- [X] T511 Floating Feedback button → opens external form in new tab
- [X] T512 `Legend.tsx` and `FooterDisclaimer.tsx` with PRD copy

---

## Phase 8: User Story 6 — Mobile‑optimized View (P3)

Tests:
- [X] T601 [P] Perf: ≥30 FPS on mid‑range mobile in primary viewport

Implementation:
- [X] T610 Default mobile mode: render Naga clusters + Top 20 Cacing
- [X] T611 Ranking: composite score 0.6×z‑score + 0.4×normalized changePct
- [X] T612 Toggle mode Naga/Cacing

---

## Phase 9: Cross‑Cutting, Perf, and Observability

- [X] T701 Telemetry optional (FPS avg, error count) gated by user opt‑in
- [X] T702 Profiling & perf fixes to meet budgets; document results
- [X] T703 CI: contract tests against `contracts/data.schema.json`
- [X] T704 Docs polish and `quickstart.md` validation

---

## 🎉 MVP COMPLETE

**All 9 Phases + 22 Tasks Delivered**
- Phase 1–2: Foundation (Infrastructure + Data Pipeline)
- Phase 3–6: Core MVP (4 User Stories: US1–US4)
- Phase 7–8: Extended MVP (2 User Stories: US5–US6)
- Phase 9: Cross-cutting (Telemetry + Profiling + Docs)

**Status**: ✅ Production Ready


