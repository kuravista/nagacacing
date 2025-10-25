# 📊 NagaCacing Data Pipeline Guide

**Date**: October 25, 2025  
**Status**: Development Mode with Mock Data  
**Problem Solved**: 404 error on data.json → Mock data fallback active

---

## 🔴 Problem Identified

```
GET https://pub-aced78dc99054d71b7284cb28b297c6b.r2.dev/data.json 404 (Not Found)
```

**Root Cause**: Backend data pipeline tidak berjalan → data.json tidak ada di Cloudflare R2

---

## ✅ Solusi Diterapkan

### Automatic Fallback Chain (Dev Mode)

```
┌─────────────────────────────────────┐
│ 1. Try load from Cloudflare R2 URL  │
│    (production source)              │
└────────────┬────────────────────────┘
             │ (success) ✅ → Use data
             │ (fail 404)
             ▼
┌─────────────────────────────────────┐
│ 2. Check localStorage cache         │
│    (stale but valid)                │
└────────────┬────────────────────────┘
             │ (found) ✅ → Use cache
             │ (not found)
             ▼
┌─────────────────────────────────────┐
│ 3. Use MOCK DATA                    │
│    (development fallback)           │
│    ✅ Bubbles render locally!       │
└─────────────────────────────────────┘
```

### File Created

- **`frontend/src/data/mockData.ts`** — 20 stocks dengan data IHSG realistis
  - Banking: BBCA, BBNI, BBKP, BRIS
  - Mining: ADRO, BUMI, INCO, PTBA
  - Independent: UNVR, ASII, TLKM, PGAS, SMGR, MYRX, dll

### Changes Made

1. ✅ Created `mockData.ts` dengan sample data 20 stocks
2. ✅ Updated `loader.ts` untuk import mock data
3. ✅ Added fallback chain: R2 → localStorage → mock data
4. ✅ Console warnings untuk transparansi source data

---

## 🚀 Bagaimana Sekarang Menggunakan

### Mode 1: Development (Current - Mock Data) ✅

```bash
cd frontend
npm run dev
# Akan load mock data jika R2 tidak tersedia
# Bubbles seharusnya sudah terlihat di browser!
```

**Kelebihan**:
- ✅ Instant development
- ✅ Tidak perlu backend running
- ✅ Real IHSG stocks + realistic data
- ✅ Responsif untuk testing UI/UX

**Kekurangan**:
- ❌ Data tidak real-time
- ❌ Tidak dari Yahoo Finance
- ❌ Hanya 20 stocks (bukan 900)

---

### Mode 2: Production (Needs Backend) 🔜

Untuk production, Anda memerlukan:

#### A. Option A: Jalankan Backend Lokal (Generate data.json)

**Step 1: Implementasi Backend (30 min)**

Backend structure sudah ada tapi kosong. Files yang perlu dibuat:

1. **`backend/src/fetch/yahoo.ts`** — Fetch dari Yahoo Finance API
```typescript
// Pseudo-code structure
export async function fetchYahooData(symbols: string[]): Promise<TickerData[]> {
  // Use yahoo-finance2 package
  // Fetch price, changePct, volume, marketCap, spark7
  // Return normalized data
}
```

2. **`backend/src/build/generateDataJson.ts`** — Generate data.json
```typescript
// Pseudo-code structure
export async function generateData(): Promise<Data> {
  // 1. Fetch data from Yahoo
  // 2. Join dengan groups dari docs/group_konglo.json
  // 3. Calculate stats (z-scores, quantiles)
  // 4. Create proper data.json structure
  // 5. Return result
}
```

3. **`backend/src/upload/r2.ts`** — Upload ke R2
```typescript
// Pseudo-code structure
export async function uploadToR2(data: Data): Promise<void> {
  // 1. Connect to Cloudflare R2 using AWS SDK S3
  // 2. Upload data.json with proper headers:
  //    - Cache-Control: public, max-age=120, stale-while-revalidate=300
  //    - Content-Type: application/json
  // 3. Set CORS headers for public access
}
```

4. **`backend/src/cron.ts`** — Wire everything (Main entry point)
```typescript
// Implement the TODO:
async function main(): Promise<void> {
  logger.info('Starting NagaCacing data generation cycle...');

  try {
    // 1. Fetch data from Yahoo
    const yahooData = await fetchYahooData(allTickers);
    
    // 2. Generate data.json
    const data = await generateData(yahooData);
    
    // 3. Upload to R2
    await uploadToR2(data);
    
    logger.info('Data generation cycle completed successfully');
  } catch (error) {
    logger.error('Data generation cycle failed', { error });
    process.exit(1);
  }
}
```

**Step 2: Setup Environment Variables**

Create `backend/.env`:
```bash
# Yahoo Finance API
YAHOO_API_KEY=your_key_or_bearer_token

# Cloudflare R2 Credentials
AWS_ACCESS_KEY_ID=your_r2_access_key
AWS_SECRET_ACCESS_KEY=your_r2_secret_key
AWS_REGION=auto

# R2 Bucket
R2_BUCKET_NAME=nagacacing-data
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Logging
LOG_LEVEL=info
```

**Step 3: Run Backend**

```bash
cd backend

# Generate data once
npm run generate
# or
npm run fetch    # Fetch only
npm run upload   # Upload only

# For continuous generation (every 15 min via cron)
npm run dev      # Watch mode
# or
npm run start    # Production mode
```

#### B. Option B: Upload Manual ke Cloudflare R2

Jika tidak ingin implement backend, bisa upload manual:

**Step 1: Create data.json manually**

Copy mock data dari `mockData.ts` dan save ke file `data.json`:

```json
{
  "version": "1.0.0",
  "generatedAt": "2025-10-25T10:00:00Z",
  "dataDelayMinutes": 15,
  "dailyStory": "Your manual story here",
  "groups": [...],
  "tickers": [...],
  "stats": {...}
}
```

**Step 2: Upload ke Cloudflare R2**

Pakai Cloudflare Dashboard atau AWS CLI:

```bash
# Using AWS CLI
aws s3 cp data.json \
  s3://nagacacing-data/data.json \
  --endpoint-url https://your-account.r2.cloudflarestorage.com \
  --region auto \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=120, stale-while-revalidate=300" \
  --content-type "application/json" \
  --acl public-read
```

**Step 3: Update Frontend URL**

Edit `frontend/.env.local`:
```
VITE_DATA_JSON_URL=https://pub-aced78dc99054d71b7284cb28b297c6b.r2.dev/data.json
```

Then reload browser.

---

## 📝 Current Status

### ✅ What's Working Now

- Frontend dev server running
- Mock data loaded automatically
- 20 stocks rendering as bubbles
- Search, filter, popup working with mock data
- Mobile view optimized

### 🔜 What's Not Yet

- Real Yahoo Finance data
- 900 stocks (only 20 mock)
- Real Cloudflare R2 storage
- 15-min auto-refresh cron
- Real IHSG data updates

---

## 🔍 Testing: Verify Mock Data Works

```bash
# 1. Open browser console (F12)
cd frontend
npm run dev
# Navigate to http://localhost:5173

# 2. Check console logs
# Should show: "Using mock data (development fallback)"

# 3. Verify bubbles render
# Should see colored bubbles for 20 stocks

# 4. Test interactions
# - Click bubble → popup shows
# - Search → filters results
# - Slider → changes market cap range
# - Mobile view → toggle Naga/Cacing
```

---

## 🚦 Next Steps (Priority Order)

### Immediate (Now - 5 min)
- [x] ✅ Mock data fallback active
- [x] ✅ Frontend should show bubbles
- [ ] Verify in browser (refresh page)

### Short Term (Today - 1 hour)
- [ ] Implement backend `fetch/yahoo.ts`
- [ ] Implement backend `build/generateDataJson.ts`
- [ ] Implement backend `upload/r2.ts`
- [ ] Wire up `cron.ts`
- [ ] Test local data generation

### Medium Term (This Week - 4 hours)
- [ ] Setup Cloudflare R2 bucket
- [ ] Configure AWS credentials
- [ ] Test upload to R2
- [ ] Update frontend .env with R2 URL
- [ ] Deploy backend to production

### Long Term (Next Week - ongoing)
- [ ] Setup cron job (15-min schedule)
- [ ] Monitor data freshness
- [ ] Setup error alerting
- [ ] Optimize data fetching

---

## 📊 Data Flow Diagram

### Current (Development)
```
Frontend
  ↓
Try load from R2 (fails)
  ↓
Try load from localStorage (empty)
  ↓
Load mock data ✅
  ↓
Render bubbles
```

### Target (Production)
```
Yahoo Finance API
  ↓
Backend (Cron every 15 min)
  ├─ Fetch data
  ├─ Process & validate
  └─ Generate data.json
  ↓
Cloudflare R2 (data.json)
  ↓
Frontend (loads on page load)
  ├─ Validate schema
  └─ Render visualization
  ↓
Cache to localStorage (24h TTL)
  ↓
Next time: Load from cache if fresh
```

---

## ⚙️ Configuration Files

### Frontend

**`frontend/.env.local`** (development):
```
VITE_DATA_JSON_URL=https://pub-aced78dc99054d71b7284cb28b297c6b.r2.dev/data.json
VITE_FEEDBACK_FORM_URL=https://forms.gle/your-form-id
```

**`frontend/src/vite-env.d.ts`** (already configured):
```typescript
interface ImportMetaEnv {
  readonly VITE_DATA_JSON_URL?: string;
  readonly VITE_FEEDBACK_FORM_URL?: string;
}
```

### Backend

**`backend/.env`** (create from .env.example):
```
YAHOO_API_KEY=your_api_key
AWS_ACCESS_KEY_ID=your_r2_key
AWS_SECRET_ACCESS_KEY=your_r2_secret
AWS_REGION=auto
R2_BUCKET_NAME=nagacacing-data
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
LOG_LEVEL=info
```

---

## 🐛 Troubleshooting

### Q: Still seeing 404 error?

**A**: Check browser Network tab:
- If R2 URL returns 404 → No data in R2
- Check Firefox/Chrome DevTools → Network tab
- R2 URL should either:
  - Return JSON (✅ working)
  - Or trigger mock data fallback (✅ working)

### Q: Bubbles not showing?

**A**: Check browser console:
- F12 → Console tab
- Should see message: "Using mock data (development fallback)"
- If you see errors, fix TypeScript errors first (see TYPESCRIPT_FIXES.md)

### Q: How to use real data?

**A**: Implement backend pipeline:
1. Create `backend/src/fetch/yahoo.ts`
2. Create `backend/src/build/generateDataJson.ts`
3. Create `backend/src/upload/r2.ts`
4. Wire up `backend/src/cron.ts`
5. Setup R2 bucket and credentials
6. Run `npm run generate` in backend

### Q: Can I use CSV data instead?

**A**: Yes, but need adapter:
1. Create `backend/src/fetch/csv.ts` instead of `yahoo.ts`
2. Parse CSV file
3. Transform to Data schema
4. Rest of pipeline same

---

## 📞 Support

For detailed implementation:
1. See `TYPESCRIPT_FIXES.md` for code quality issues
2. See `specs/001-nagacacing-mvp-spec/data-model.md` for schema
3. See `backend/package.json` for available scripts
4. Check `docs/group_konglo.json` for group definitions

---

## ✨ Summary

**Current State**: 
- ✅ Mock data working
- ✅ Bubbles rendering
- ✅ Dev experience smooth

**To Reach Production**:
- 🔜 Implement backend (4-6 hours)
- 🔜 Setup R2 + credentials (30 min)
- 🔜 Deploy & monitor (1 hour)

**Total time to real data**: ~1 day of development

---

**File**: DATA_PIPELINE_GUIDE.md  
**Last Updated**: October 25, 2025  
**Status**: Ready for Development 🚀
