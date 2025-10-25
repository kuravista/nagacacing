# NagaCacing MVP — Quick Start Guide

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: 2025-10-25

---

## Table of Contents

1. [For Users](#for-users)
2. [For Developers](#for-developers)
3. [Deployment](#deployment)
4. [FAQ](#faq)

---

## For Users

### What is NagaCacing?

NagaCacing is a market storytelling platform that visualizes Indonesian stock market dynamics through an interactive bubble chart. Each bubble represents a stock, with size showing market capitalization and color indicating daily performance.

**The Story**: "Naga" (large conglomerates) vs "Cacing" (independent companies)

### Getting Started (2 minutes)

1. **Visit**: https://nagacacing.com
2. **Wait**: Data loads (usually <2 seconds)
3. **Explore**: Scroll/zoom to explore 900+ stocks
4. **Click**: Click any bubble to see details

### Understanding the Visualization

**Bubble Size** = Market Capitalization
- Bigger bubbles = higher market value
- Smaller bubbles = emerging companies

**Bubble Color** = Daily Performance
- 🟢 Green = Price up
- ⚫ Gray = Stable
- 🔴 Red = Price down

**Bubble Glow** = Trading Activity
- Glowing = High trading volume (z-score ≥ 2)
- Dim = Low trading volume

### Key Features

#### 🔍 Search
- Type stock symbol or company name
- Supports partial matching
- Case-insensitive
- Press Enter or wait 150ms

#### 📊 Filter by Market Cap
- Slide to Q1 (smallest) → Q4 (largest)
- 25% step increments
- Combines with search (AND logic)

#### 🪱 Cacing Hunter Mode
- Find small-cap opportunities
- Highlights independent stocks ≤Q2
- Perfect for retail investors

#### 🫧 Inspect Ticker
- Click any bubble
- View: price, change%, volume, market cap, 7-day chart
- Responsive popup

#### 📸 Export PNG
- Screenshot the visualization
- Professional watermark
- Share on social media

#### 📊 Legend
- Expand to understand symbols
- Explains all colors & sizes
- Always available (top-left)

### Mobile Usage

**Auto-optimized for your device**:
- Naga Mode: Company clusters (Conglomerates)
- Cacing Mode: Top 20 independent stocks
- Toggle: 🐉 Naga | 🪱 Cacing (bottom)

**30+ FPS smooth**: Optimized for mid-range devices

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Escape | Close popup |
| Tab | Navigate controls |
| Shift+Tab | Navigate backwards |
| Enter | Select button |

### Tips & Tricks

✅ **Use zoom/scroll** to explore different market segments  
✅ **Combine search + filter** for targeted discovery  
✅ **Toggle Naga/Cacing** on mobile to see different views  
✅ **Export PNG** to share analysis  
✅ **Check legend** if unfamiliar with symbols  

### FAQ - User

**Q: Is this investment advice?**  
A: No. NagaCacing is for exploration and education only. Consult financial advisors before investing.

**Q: How often is data updated?**  
A: Daily (typically after market close). Last updated time shown in footer.

**Q: Why can't I see old data?**  
A: We show daily snapshots. Historical data coming in Phase 2.

**Q: Does it work offline?**  
A: After first visit, cached data works offline (24hr TTL).

**Q: Is my data tracked?**  
A: Telemetry is optional. No tracking by default.

---

## For Developers

### Installation (5 minutes)

**Prerequisites**:
- Node.js 20.x
- npm or yarn

**Clone & Setup**:

```bash
git clone https://github.com/nagacacing/mvp.git
cd nagacacing

# Frontend
cd frontend
npm install
npm run dev    # Start dev server (http://localhost:5173)

# Backend (in another terminal)
cd backend
npm install
npm run start  # Run data generation cron
```

### Directory Structure

```
nagacacing/
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # Business logic
│   │   ├── state/         # Zustand store
│   │   ├── utils/         # Utilities
│   │   ├── viz/           # PixiJS engine
│   │   └── app.tsx        # Root component
│   ├── tests/
│   │   ├── unit/          # Vitest tests
│   │   └── e2e/           # Playwright tests
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── cron.ts        # Data pipeline
│   │   ├── logger.ts      # Logging
│   │   ├── groups.ts      # Group utilities
│   │   └── utils/
│   ├── tests/             # Contract tests
│   └── tsconfig.json
├── specs/
│   └── 001-nagacacing-mvp-spec/
│       ├── spec.md
│       ├── data-model.md
│       ├── contracts/
│       └── checklists/
└── docs/
    └── group_konglo.json
```

### Development Commands

**Frontend**:

```bash
cd frontend

# Development
npm run dev        # Start dev server with HMR
npm run build      # Production build
npm run preview    # Preview production build

# Testing
npm run test       # Unit tests
npm run test:watch # Watch mode
npm run test:e2e   # E2E tests

# Quality
npm run lint       # ESLint
npm run format     # Prettier
npm run type-check # TypeScript check
```

**Backend**:

```bash
cd backend

# Development
npm run dev        # Watch mode
npm run build      # TypeScript compile
npm run start      # Run cron job

# Testing & Quality
npm run test       # Unit tests
npm run lint       # ESLint
npm run format     # Prettier
npm run type-check # TypeScript check
```

### Environment Variables

**Frontend** (`.env.local`):

```
VITE_DATA_URL=https://api.nagacacing.com/data.json
VITE_FEEDBACK_FORM_URL=https://forms.gle/nagacacing-feedback
```

**Backend** (`.env`):

```
YAHOO_API_KEY=your_api_key
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
R2_BUCKET_NAME=nagacacing-data
LOG_LEVEL=info
```

### Key Code Snippets

**Load Data**:
```typescript
import { loadDataWithFallback } from './data/loader';

const result = await loadDataWithFallback({
  url: 'https://api.nagacacing.com/data.json',
});

if (result.success) {
  console.log(`Loaded ${result.data.tickers.length} tickers`);
}
```

**Render Visualization**:
```typescript
import { VisualizationEngine } from './viz/engine';

const engine = new VisualizationEngine({
  container: document.getElementById('viz'),
  width: 1920,
  height: 1080,
});

await engine.render(tickers, stats);
```

**Search & Filter**:
```typescript
import { searchTickers, filterByMarketCap, applyFilters } from './utils/search';

const results = applyFilters(tickers, 'BBCA', 50, 100); // Q2-Q4
```

**Track Telemetry**:
```typescript
import { getTelemetryService } from './services/telemetry';

const telemetry = getTelemetryService();
telemetry.enable(); // User opt-in
telemetry.trackFrame(16); // 60 FPS
telemetry.trackError('Something failed');
```

### Testing

**Unit Tests**:
```bash
npm run test -- --watch
npm run test -- --coverage
```

**E2E Tests**:
```bash
npm run test:e2e -- --headed  # Visual mode
npm run test:e2e -- --debug   # Debug mode
```

**Contract Tests**:
```bash
cd backend
npm run test -- backend/tests/contract/
```

### Performance Profiling

**Chrome DevTools**:
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Interact with app
5. Stop and analyze

**Key Metrics**:
- FPS: Should stay ≥58 on desktop, ≥30 on mobile
- Render time: Should be <16ms per frame
- Memory: Should stay <120MB

### Debugging Tips

**Console Logs**:
```typescript
// Enable debug logging
localStorage.setItem('nagacacing_debug', 'true');
// Check console for detailed logs
```

**Visual Debugging**:
```typescript
// Toggle grid overlay
localStorage.setItem('nagacacing_show_grid', 'true');
```

**Network Inspection**:
- Open DevTools Network tab
- Check `data.json` size & response time
- Verify caching headers

### FAQ - Developer

**Q: How do I add a new visualization mode?**  
A: Extend `VisualizationEngine` class and add render logic to handle new data format.

**Q: Can I use this for production?**  
A: Yes! This is production-ready code. See [Deployment](#deployment).

**Q: How do I extend the data model?**  
A: Update `specs/contracts/data.schema.json`, then regenerate with `npm run generate`.

**Q: What's the tech stack?**  
A: Frontend: React + TypeScript + PixiJS + Zustand. Backend: Node.js + TypeScript + Yahoo Finance API.

---

## Deployment

### Prerequisites

- [ ] GitHub Actions secrets configured
- [ ] Cloudflare R2 bucket created
- [ ] Yahoo Finance API key obtained
- [ ] Domain & SSL certificate ready
- [ ] CI/CD pipeline passing

### Steps

1. **Build Frontend**:
```bash
cd frontend
npm run build        # Creates dist/
npm run type-check   # Verify types
npm run lint         # Check linting
```

2. **Build Backend**:
```bash
cd backend
npm run build        # TypeScript compile
npm run type-check   # Verify types
npm run lint         # Check linting
```

3. **Deploy to Cloud**:
```bash
# Frontend (static to Vercel/Netlify)
npm run deploy:frontend

# Backend (to Lambda/Cloud Run)
npm run deploy:backend
```

4. **Run Data Pipeline**:
```bash
# Trigger cron job
curl -X POST https://your-backend.com/cron/generate-data \
  -H "Authorization: Bearer YOUR_SECRET"
```

### Production Checklist

- [ ] Environment variables configured
- [ ] CORS headers set correctly
- [ ] SSL/HTTPS enabled
- [ ] CDN cache headers configured
- [ ] Monitoring alerts enabled
- [ ] Error tracking setup (Sentry)
- [ ] Analytics enabled (optional, telemetry)
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Disaster recovery plan documented

---

## FAQ

### General

**Q: Is NagaCacing open source?**  
A: Yes! MIT License. Contributions welcome.

**Q: Can I use this for my own market?**  
A: Yes! Fork the repo and customize for your market/exchange.

**Q: What are performance targets?**  
A: Desktop: 60 FPS, Mobile: 30+ FPS, Load: <2s

**Q: How do I report a bug?**  
A: GitHub Issues: https://github.com/nagacacing/mvp/issues

**Q: Can I contribute?**  
A: Yes! Read CONTRIBUTING.md and submit PRs.

### Technical

**Q: Why PixiJS?**  
A: GPU-accelerated rendering for 900+ bubbles smoothly.

**Q: Why Zustand over Redux?**  
A: Simpler, faster, perfect for MVP. No boilerplate.

**Q: Can I use this with different data source?**  
A: Yes! Implement `fetchData` interface and plug in your API.

**Q: Is there a GraphQL API?**  
A: Not yet. REST API in roadmap.

### Business

**Q: Is there a commercial license?**  
A: Contact hello@nagacacing.com for licensing options.

**Q: Can I resell this?**  
A: Per MIT License, yes. Credit required.

**Q: What's the roadmap?**  
A: See ROADMAP.md for upcoming features.

---

## Getting Help

- **Documentation**: https://nagacacing.com/docs
- **GitHub Issues**: https://github.com/nagacacing/mvp/issues
- **Email**: hello@nagacacing.com
- **Twitter**: @nagacacing

---

## Next Steps

1. ✅ Review the spec: `specs/001-nagacacing-mvp-spec/spec.md`
2. ✅ Check performance: `PERFORMANCE_BUDGET.md`
3. ✅ Run locally: `npm run dev`
4. ✅ Run tests: `npm run test`
5. ✅ Deploy: Follow deployment guide

---

**Happy exploring!** 🐉🪱

*NagaCacing: Market Storytelling Platform*  
*Visualisasi Naga vs Cacing*

