# NagaCacing MVP V1.0

**Market Storytelling: Visualizing Naga vs Cacing in the Indonesian Stock Market**

A full-stack TypeScript application that visualizes IHSG market dynamics through an interactive bubble chart. The visualization maps rotational strength across conglomerates (Naga 🐉) versus independent stocks (Cacing 🪱).

---

## 📋 Project Overview

- **Frontend**: TypeScript + React + PixiJS (WebGL rendering for 900+ bubbles)
- **Backend**: Node.js 20 + TypeScript (Yahoo Finance data aggregation)
- **Data Pipeline**: 15-minute cron cycle with Cloudflare R2 storage
- **Testing**: Vitest (unit) + Playwright (E2E)
- **CI/CD**: GitHub Actions (lint, type-check, test, security scan)

### Quick Facts
- **Performance**: TTI ≤2.5s (desktop) / ≤4s (mobile), FPS ≥60 (desktop) / ≥30 (mobile)
- **Bundle Size**: ≤300 KB gzip (excluding data)
- **Accessibility**: WCAG 2.1 AA (contrast 4.5:1 minimum)
- **Security**: No PII; all strings sanitized; credentials via environment variables

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- npm or pnpm
- Cloudflare R2 bucket (for backend data storage)
- GitHub Actions enabled (for CI/CD)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd nagacacing

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### Environment Setup

1. **Backend** (`.env`):
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your R2 credentials and API keys
   ```

2. **Frontend** (`.env.local`):
   ```bash
   cp frontend/.env.example frontend/.env.local
   # Edit with your DATA_JSON_URL
   ```

---

## 📁 Project Structure

```
nagacacing/
├── backend/
│   ├── src/
│   │   ├── cron.ts              # Main cron entry point
│   │   ├── logger.ts            # Winston logger
│   │   ├── fetch/
│   │   │   └── yahoo.ts         # Yahoo Finance data fetcher
│   │   ├── build/
│   │   │   └── generateDataJson.ts  # Data aggregation & generation
│   │   └── upload/
│   │       └── r2.ts            # Cloudflare R2 uploader
│   ├── tests/
│   │   ├── unit/                # Unit tests
│   │   └── contract/            # Schema validation tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   └── .prettierrc.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx             # Vite entry point
│   │   ├── app.tsx              # Root React component
│   │   ├── index.css            # Global styles + a11y tokens
│   │   ├── viz/
│   │   │   ├── engine.ts        # PixiJS stage & instancing
│   │   │   ├── scales.ts        # Radius & color scales
│   │   │   └── hit.ts           # Hit-testing
│   │   ├── components/
│   │   │   ├── Controls.tsx
│   │   │   ├── PopupCard.tsx
│   │   │   ├── DailyStory.tsx
│   │   │   ├── Legend.tsx
│   │   │   └── FooterDisclaimer.tsx
│   │   ├── services/
│   │   │   └── snapshot.ts      # PNG export with watermark
│   │   └── state/
│   │       └── store.ts         # Zustand state management
│   ├── tests/
│   │   ├── unit/
│   │   └── e2e/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   └── .prettierrc.json
│
├── .github/
│   ├── workflows/
│   │   └── ci.yml               # GitHub Actions CI/CD
│   └── dependabot.yml           # Security scanning
│
├── specs/001-nagacacing-mvp-spec/
│   ├── spec.md
│   ├── plan.md
│   ├── data-model.md
│   ├── research.md
│   ├── quickstart.md
│   ├── contracts/
│   │   ├── openapi.yaml
│   │   └── data.schema.json
│   └── checklists/
│       └── requirements.md
│
└── docs/
    ├── PRD.md
    ├── group_konglo.json
    └── group_konglo.csv
```

---

## 🛠 Development

### Backend

```bash
cd backend

# Development mode (watch)
npm run dev

# Build
npm run build

# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check

# Run tests
npm run test

# Generate data (one-off)
npm run generate

# Upload to R2 (one-off)
npm run upload
```

### Frontend

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview built version
npm run preview

# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e
```

---

## 🧪 Testing

### Unit Tests
```bash
# Backend
cd backend && npm run test

# Frontend
cd frontend && npm run test
```

### Contract Tests
```bash
cd backend
# Validates data.json against specs/001-nagacacing-mvp-spec/contracts/data.schema.json
npm run test
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

---

## 📊 CI/CD Workflow

GitHub Actions runs automatically on push/PR to `main` or `develop`:

1. **Backend Job**:
   - Lint (ESLint)
   - Type check (tsc)
   - Unit tests (Vitest)

2. **Frontend Job**:
   - Lint (ESLint)
   - Type check (tsc)
   - Build (Vite)
   - Unit tests (Vitest)

3. **Security Job**:
   - Dependency audit (npm audit)
   - Dependabot scanning (automated updates)

See `.github/workflows/ci.yml` for details.

---

## 🔐 Security

- **Credentials**: Stored in GitHub Secrets, passed via environment variables (never in code)
- **String Sanitization**: All `data.json` strings (especially `dailyStory`) escaped before rendering
- **CORS**: R2 bucket configured for public GET only
- **Dependency Scanning**: Automatic via Dependabot; audit on every CI run

---

## 📈 Performance Targets

| Metric | Desktop | Mobile |
|--------|---------|--------|
| TTI | ≤2.5s | ≤4s |
| FPS (bubbles) | ≥60 | ≥30 |
| Filter update | <200ms | <200ms |
| Search result | <100ms | <100ms |
| Bundle size | ≤300 KB gzip | ≤300 KB gzip |

---

## ♿ Accessibility

- **Color Contrast**: Minimum 4.5:1 for text (WCAG 2.1 AA)
- **Keyboard Navigation**: Full navigation with Tab/Esc
- **Focus Management**: Visible focus indicators; trap in modals
- **Screen Reader**: Semantic HTML; ARIA labels where needed
- **Loading States**: Clear feedback (spinner, text, error messages)

---

## 📝 Data Schema

See `specs/001-nagacacing-mvp-spec/contracts/data.schema.json` for the complete JSON Schema.

**Example `data.json` structure**:
```json
{
  "version": "1.0.0",
  "generatedAt": "2025-10-25T10:30:00Z",
  "dataDelayMinutes": 15,
  "dailyStory": "Naga lead today with 2% avg gain; Cacing mixed.",
  "groups": [
    { "groupId": "G-BARITO", "groupName": "Barito Group", "tickers": ["ADRO", "ABMM"] }
  ],
  "tickers": [
    {
      "symbol": "BBCA",
      "name": "Bank Central Asia",
      "price": 9250,
      "changePct": 1.5,
      "volume": 2500000,
      "marketCap": 2850000000000,
      "groupId": "G-BARITO",
      "sector": "Financials",
      "spark7": [9200, 9210, 9220, 9235, 9240, 9250]
    }
  ],
  "stats": {
    "universeSize": 900,
    "volumeAvgWindowDays": 20,
    "minMarketCap": 500000000,
    "maxMarketCap": 3000000000000
  }
}
```

---

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Make changes and commit atomically
3. Run linting, type checks, and tests locally before pushing
4. Open a PR with a clear description
5. CI must pass before merging

---

## 📄 License

MIT (or specify your license)

---

## 📞 Support & Feedback

- **Issues**: Use GitHub Issues
- **Feedback Form**: [NagaCacing Feedback](https://docs.google.com/forms/...) (link in app)

---

**Last updated**: 2025-10-25 | **Branch**: 001-nagacacing-mvp-spec | **Status**: Phase 1 Setup Complete
