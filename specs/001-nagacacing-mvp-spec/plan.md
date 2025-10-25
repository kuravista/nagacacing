# Implementation Plan: NagaCacing MVP V1.0

**Branch**: `001-nagacacing-mvp-spec` | **Date**: 2025-10-25 | **Spec**: `specs/001-nagacacing-mvp-spec/spec.md`
**Input**: Product PRD at `docs/PRD.md` and feature spec above

## Summary

Visualisasi "Market Storytelling" IHSG yang memetakan rotasi kekuatan antar grup konglomerasi (Naga) vs saham independen (Cacing). Frontend TypeScript + PixiJS di Cloudflare Pages merender 900+ gelembung dengan peta warna perubahan harian dan radius ∝ √(marketCap). Data dibaca periodik dari `data.json` di Cloudflare R2 yang dihasilkan cron backend (Node.js) tiap 15 menit dari Yahoo Finance. Fitur inti: filter search/market cap, pop-up card, Daily Story, snapshot PNG ber‑watermark, onboarding/legenda/feedback/disclaimer, mode mobile.

## Technical Context

**Language/Version**: Frontend TypeScript 5.x (Vite 5); Backend Node.js 20.x (TypeScript)  
**Primary Dependencies**: PixiJS 7.x (WebGL rendering), Zustand (state ringan), Zod (validasi `data.json`), color-scale utilities, date-fns; Backend: yahoo-finance2 (atau setara), AWS SDK S3 (R2 compatible), p-limit, zod, winston/pino  
**Storage**: Cloudflare R2 (S3-compatible) untuk `data.json`; sumber grup di `docs/group_konglo.json` (source‑of‑truth) → dikonsumsi langsung oleh backend (`backend/src/groups.json` boleh disalin dari sini)  
**Testing**: Vitest (unit), Playwright (E2E UI kritikal), contract tests untuk skema `data.json` (JSON Schema); lint/type: ESLint + Prettier + TS strict  
**Target Platform**: Web statis (Cloudflare Pages) + VM free-tier untuk cron generator; CDN publik untuk `data.json`  
**Project Type**: Web (frontend + backend terpisah)  
**Performance Goals**: TTI ≤ 2.5s desktop / ≤ 4s mobile; FPS ≥ 60/30; interaksi filter < 200ms; search hasil < 100ms; bundle awal ≤ 300 KB gzip (tanpa `data.json`)  
**Constraints**: WCAG 2.1 AA (kontras 4.5:1, keyboard nav); tanpa PII; CORS valid untuk `data.json`; cache headers `Cache-Control: public, max-age=120, stale-while-revalidate=300`; data delay ±15 menit  
**Scale/Scope**: ~900 ticker; refresh 15 menit; target pengguna awal komunitas retail; lalu lintas rendah‑menengah

## Constitution Check

GATE pre‑design (must pass) — semua direncanakan memenuhi, tidak ada pengecualian saat ini:
- Code Quality: formatter (Prettier), linter (ESLint), TS strict; typed public surface; docs skema `data.json`.
- Testing: Vitest + Playwright; contract tests (JSON Schema) untuk `data.json`; target ≥80% overall, ≥90% diff coverage untuk perubahan P1.
- UX Consistency: Komponen UI konsisten; a11y WCAG 2.1 AA; copy/empty/loading/error ditentukan di spec.
- Performance: Budget didefinisikan di plan/PRD; validasi via sampling FPS dan timing interaksi; ukuran bundle dipantau.
- Security/Deps: Scan dependensi di CI; sanitasi `dailyStory`/strings; secrets via env/secret store; tidak ada secrets di repo.

Re‑check akan dilakukan pasca desain (setelah `research.md`, kontrak, dan data‑model selesai). Status saat ini: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-nagacacing-mvp-spec/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── openapi.yaml
    └── data.schema.json
```

### Source Code (target repository layout)

```text
backend/
├── src/
│   ├── groups.json               # mapping manual grup Naga
│   ├── fetch/
│   │   └── yahoo.ts              # ambil & normalisasi data
│   ├── build/
│   │   └── generateDataJson.ts   # bangkitkan data.json + dailyStory
│   ├── upload/r2.ts              # upload ke R2 (S3 API)
│   └── cron.ts                   # entrypoint siklus 15 menit
└── tests/
    ├── unit/
    └── contract/                 # validasi JSON Schema data.json

frontend/
├── src/
│   ├── app.tsx                   # bootstrap
│   ├── data/schema.ts            # Zod schema untuk data.json
│   ├── state/store.ts            # Zustand state
│   ├── viz/engine.ts             # PixiJS stage, instancing, spatial index
│   ├── viz/scales.ts             # radius/color scales (memoized)
│   ├── viz/hit.ts                # hit-testing (spatial index)
│   ├── components/
│   │   ├── Controls.tsx          # search + slider
│   │   ├── PopupCard.tsx
│   │   ├── DailyStory.tsx
│   │   ├── Legend.tsx
│   │   └── FooterDisclaimer.tsx
│   └── services/snapshot.ts      # ekspor PNG + watermark
└── tests/
    ├── e2e/
    └── unit/
```

**Structure Decision**: Web app dua proyek (frontend + backend) untuk memisahkan siklus render real‑time dari generator data terjadwal; kontrak `data.json` jadi boundary yang dikontrak.

## Complexity Tracking

Tidak ada pelanggaran konstitusi yang perlu pembenaran saat ini.


