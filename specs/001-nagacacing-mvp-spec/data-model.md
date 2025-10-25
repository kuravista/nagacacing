## Data Model — NagaCacing `data.json`

### Entities

DatasetMetadata
- version: string (semver)
- generatedAt: string (ISO 8601, UTC)
- dataDelayMinutes: number (≈15)

Group
- groupId: string (e.g., "G-BARITO")
- groupName: string
- tickers: string[] (symbols)

Ticker
- symbol: string (e.g., "BBCA")
- name: string
- price: number (float)
- changePct: number (−100 … +100)
- volume: number (int)
- marketCap: number (int)
- groupId: string | null
- sector: string
- spark7?: number[] (≤7, optional)

Stats
- universeSize: number
- volumeAvgWindowDays: number (default 20)
- minMarketCap: number
- maxMarketCap: number

### Relationships
- Group 1—N Ticker via `groupId` (nullable → Cacing)
- DatasetMetadata 1—1 Stats

### Validation rules
- `version` must be non‑empty semver; `generatedAt` valid ISO timestamp
- `changePct` clamped in color scale to [−10, +10] untuk pemetaan warna
- `spark7` jika ada: 2–7 poin; semua numerik
- `groups[].groupId` konsisten dengan `tickers[].groupId`

### JSON shape (overview)

```
{
  version: string,
  generatedAt: string,
  dataDelayMinutes: number,
  dailyStory: string,
  groups: Group[],
  tickers: Ticker[],
  stats: Stats
}
```

