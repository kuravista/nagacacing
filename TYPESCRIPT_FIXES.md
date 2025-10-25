# TypeScript Fixes Required — NagaCacing MVP

**Status**: Post-vite-env.d.ts fix (13 errors remaining)  
**Date**: October 25, 2025

---

## Summary

✅ Fixed (6 errors resolved):
- import.meta.env type error (fixed by vite-env.d.ts)
- loader.ts error (changed null to undefined)
- backend groups.ts warning (exported SourceGroup type)

❌ Still Required (13 errors):

---

## Remaining Errors & Fixes

### 1. app.tsx: Unused Variables (2 errors)

**Current**:
```typescript
const { version, generatedAt } = useVersionInfo();
```

**Error**:
```
error TS6133: 'version' is declared but its value is never read (line 197)
error TS6133: 'generatedAt' is declared but its value is never read (line 198)
```

**Analysis**: 
- These variables ARE used (line 116-118 in footer)
- But TypeScript doesn't see it due to how JSX is written
- Solution: Use them directly in JSX without intermediate variables

**Fix**: Inline the usage
```typescript
// Replace the two lines above with using them directly
// Already done in the code (lines 116-118 in footer)
// Just need to destructure differently or use useVersionInfo() inline
```

**Better Fix**: Use the store selector inline
```typescript
// Instead of:
const { version, generatedAt } = useVersionInfo();
// ... then use them later ...

// Change to:
export const useVersionAndData = () =>
  useAppStore((state) => ({
    version: state.dataVersion,
    generatedAt: state.dataGeneratedAt,
  }));
```

OR simply inline:
```typescript
// In footer, change from:
{version && generatedAt ? (
  <>
    v{version} • Generated: {new Date(generatedAt).toLocaleString()}
  </>
) : (
  'Loading version info...'
)}

// To extract it differently - the fix is in how useVersionInfo selector is used
// Actually, the error is likely because TypeScript doesn't track the usage properly
// Solution: Add a comment or use in a way TypeScript recognizes
```

**Actual Fix** (simplest):
```typescript
// In app.tsx, change:
const { version, generatedAt } = useVersionInfo();

// To:
const versionInfo = useVersionInfo();
const { version, generatedAt } = versionInfo;

// Then in footer, explicitly reference them:
{version ? `v${version}` : 'Loading version info...'}
```

OR disable the specific error:
```typescript
// @ts-expect-error - used in JSX footer
const { version, generatedAt } = useVersionInfo();
```

**Recommended Fix**: Edit Controls.tsx to properly destructure from full store:

```typescript
import React, { useMemo } from 'react';
import { useAppStore } from '../state/store.js';
import { debounce } from '../utils/search.js';

interface ControlsProps {
  onSearchChange?: (query: string) => void;
  onSliderChange?: (min: number, max: number) => void;
  onModeChange?: (hunting: boolean) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  onSearchChange,
  onSliderChange,
  onModeChange,
}) => {
  const { searchQuery, marketCapFilter, showCacingHunterMode, setSearchQuery, setMarketCapFilter, setCacingHunterMode } = useAppStore();
  
  // Rest of component...
};
```

---

### 2. Controls.tsx: Missing Setter Functions (4 errors)

**Errors**:
```
error TS2339: Property 'setSearchQuery' does not exist on type '...'
error TS2339: Property 'setMarketCapFilter' does not exist on type '...'
error TS2339: Property 'setCacingHunterMode' does not exist on type '...'
error TS6133: 'useCallback' is declared but its value is never read
```

**Root Cause**:
- Line 22 tries to destructure setters from `useFilterState()`
- But `useFilterState()` only returns state, not actions
- `useCallback` is imported but not used

**Fix**: Import all from `useAppStore()` directly

```typescript
// BEFORE (line 6-22):
import React, { useCallback, useMemo } from 'react';
import { useFilterState } from '../state/store.js';
import { debounce } from '../utils/search.js';

export const Controls: React.FC<ControlsProps> = ({
  onSearchChange,
  onSliderChange,
  onModeChange,
}) => {
  const { searchQuery, marketCapFilter, showCacingHunterMode } = useFilterState();
  const { setSearchQuery, setMarketCapFilter, setCacingHunterMode } = useFilterState();

// AFTER:
import React, { useMemo } from 'react';
import { useAppStore } from '../state/store.js';
import { debounce } from '../utils/search.js';

export const Controls: React.FC<ControlsProps> = ({
  onSearchChange,
  onSliderChange,
  onModeChange,
}) => {
  const { 
    searchQuery, 
    marketCapFilter, 
    showCacingHunterMode,
    setSearchQuery,
    setMarketCapFilter,
    setCacingHunterMode
  } = useAppStore();
```

---

### 3. telemetry.ts: Fetch with Undefined Endpoint (1 error)

**Error**:
```
error TS2769: No overload matches this call.
  Argument of type 'string | undefined' is not assignable to parameter of type 'string | URL | Request'
```

**Line**: 198

**Fix**: Add null check before fetch

```typescript
// BEFORE (line 192-204):
public async sendTelemetry(): Promise<void> {
  if (!this.config.enabled) return;

  const metrics = this.getMetrics();

  try {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });

// AFTER:
public async sendTelemetry(): Promise<void> {
  if (!this.config.enabled || !this.config.endpoint) return;

  const metrics = this.getMetrics();

  try {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });
```

---

### 4. engine.ts: PixiJS API & Unused Variables (8 errors)

**Errors**:
```
error TS6133: 'y' is declared but its value is never read (line 45)
error TS2339: Property 'canvas' does not exist on type 'Application'
error TS2339: Property 'circle' does not exist on type 'Graphics'
error TS2349: 'FillStyle' has no call signatures
error TS6133: 'symbol' is declared but its value is never read
```

**Root Causes**:
1. Unused variable `y` (line 45)
2. PixiJS v7 API: `canvas` property access issue
3. PixiJS v7 API: `circle()` method doesn't exist on Graphics directly
4. `FillStyle()` is not callable
5. Unused `symbol` variable (line 251)

**Fixes**:

#### A. Line 45 - Remove unused `y`:
```typescript
// BEFORE:
const [x, y] = getRandomPosition();

// AFTER:
const [x] = getRandomPosition();
```

#### B. Line 93 - canvas property:
```typescript
// BEFORE:
const canvas = this.app.canvas;

// AFTER:
const canvas = (this.app.canvas as HTMLCanvasElement) || 
               (this.app.renderer?.view as HTMLCanvasElement | undefined);

// OR better, use:
const canvas = this.app.renderer.canvas as HTMLCanvasElement;
```

#### C. Lines 205-211 - PixiJS Graphics API:

PixiJS v7 uses different Graphics methods. The correct API is:

```typescript
// BEFORE:
graphics.circle(bubble.x, bubble.y, bubble.radius);
graphics.fill({ color: color, alpha: opacity });
graphics.circle(bubble.x, bubble.y, bubble.radius + 2);
graphics.stroke({ color: glowColor, width: 1 });

// AFTER (PixiJS v7):
graphics.circle(bubble.x, bubble.y, bubble.radius);
graphics.fill(color);
graphics.circle(bubble.x, bubble.y, bubble.radius + 2);
graphics.stroke({ color: glowColor, width: 1 });

// OR use newer syntax:
const graphics = new Graphics();
graphics
  .circle(bubble.x, bubble.y, bubble.radius)
  .fill({ color: color, alpha: opacity });
graphics
  .circle(bubble.x, bubble.y, bubble.radius + 2)
  .stroke({ color: glowColor, width: 1 });
```

#### D. Line 251 - Remove unused `symbol`:
```typescript
// BEFORE:
const { symbol, price } = ticker;

// AFTER:
const { price } = ticker;
```

---

## Implementation Order

### Quick Fix (5 minutes)
1. Fix Controls.tsx imports (use `useAppStore` instead of `useFilterState`)
2. Remove unused imports (`useCallback`)
3. Add null check to telemetry.ts

### Medium Fix (15 minutes)
4. Fix engine.ts unused variables
5. Fix telemetry canvas property access
6. Fix app.tsx version/generatedAt usage

### Complete Fix (30 minutes)
7. Update engine.ts Graphics API calls to PixiJS v7 compatible
8. Test all changes with `npm run type-check`
9. Run linter: `npm run lint --fix`
10. Test build: `npm run build`

---

## Commands to Apply Fixes

```bash
cd frontend

# After manual fixes, run:
npm run type-check        # Verify all errors fixed
npm run lint -- --fix     # Auto-fix remaining linting issues
npm run build             # Test production build
npm run preview           # Preview production build locally
```

---

## Verification Checklist

- [ ] All TypeScript errors resolved (0 errors)
- [ ] ESLint warnings fixed
- [ ] Build compiles successfully
- [ ] No unused imports/variables
- [ ] App runs on dev server: `npm run dev`
- [ ] Tests pass: `npm run test`
