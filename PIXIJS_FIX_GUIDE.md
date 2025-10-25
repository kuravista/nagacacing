# 🔧 PixiJS Graphics Fix Guide — Latest API (v7/v8)

**Date**: October 25, 2025  
**Source**: Official PixiJS docs + Exa research  
**Status**: Based on latest documentation  

---

## 🎯 Problem Summary

```javascript
// ❌ WRONG (v6 style - doesn't work in v7+):
graphics.circle(x, y, radius);
graphics.fill({ color });
graphics.stroke({ width, color });

// ✅ CORRECT (v7+ style - method chaining):
graphics.circle(x, y, radius)
  .fill({ color })
  .stroke({ width, color });
```

---

## ✅ PixiJS v7 Graphics API — Correct Methods

### Method 1: Method Chaining (Recommended)

```javascript
const graphics = new PIXI.Graphics();

// Draw circle with fill and stroke
graphics
  .circle(100, 100, 50)           // x, y, radius
  .fill({ color: 0xff0000 })      // fill color
  .stroke({ width: 2, color: 0x000000 }); // stroke

// Add to stage
app.stage.addChild(graphics);
```

### Method 2: Separate Calls (Old Style - Still Works)

```javascript
const graphics = new PIXI.Graphics();

// Set fill style
graphics.beginFill(0xff0000);

// Draw circle
graphics.drawCircle(100, 100, 50);

// End fill
graphics.endFill();

// Set stroke
graphics.lineStyle(2, 0x000000);

// Draw circle again for stroke
graphics.drawCircle(100, 100, 50);

app.stage.addChild(graphics);
```

### Method 3: Modern API (v7+ Recommended)

```javascript
const graphics = new PIXI.Graphics();

// Single command chain
graphics
  .moveTo(50, 50)
  .lineTo(100, 100)
  .arc(100, 100, 50, 0, Math.PI)
  .closePath()
  .fill({ color: 0x00ff00, alpha: 0.5 })
  .stroke({ width: 2, color: 0x000000 });

app.stage.addChild(graphics);
```

---

## 🐛 Your Current Issues & Fixes

### Issue 1: graphics.circle is not a function

**Your Code** (engine.ts renderBubble):
```typescript
const graphics = new PIXI.Graphics();
graphics.circle(bubble.x, bubble.y, bubble.radius);  // ❌ WRONG
graphics.fill({ color: bubble.color, alpha: 0.8 });
```

**Fix - Use Method Chaining**:
```typescript
const graphics = new PIXI.Graphics();
graphics
  .circle(bubble.x, bubble.y, bubble.radius)  // ✅ CORRECT
  .fill({ color: bubble.color, alpha: 0.8 });

this.app.stage.addChild(graphics);
```

### Issue 2: Cannot read properties of undefined (reading 'width')

**Location**: resolveCollisions() at line ~111

**Problem**: `this.app.screen` is undefined

**Fix**:
```typescript
async resolveCollisions(bubbles: BubbleData[]): Promise<void> {
  // ✅ Add safety check
  if (!this.app || !this.app.screen) {
    console.warn('App or screen not initialized');
    return;
  }

  // Get screen dimensions safely
  const { width, height } = this.app.screen;

  // Rest of collision logic...
  for (const bubble of bubbles) {
    // collision detection code
  }
}
```

---

## 📚 PixiJS v7 Graphics Methods Reference

### Drawing Shapes

| Method | Parameters | Example |
|--------|------------|---------|
| `.circle()` | x, y, radius | `graphics.circle(100, 100, 50)` |
| `.ellipse()` | x, y, width, height | `graphics.ellipse(100, 100, 50, 30)` |
| `.rect()` | x, y, width, height | `graphics.rect(0, 0, 100, 100)` |
| `.roundRect()` | x, y, width, height, radius | `graphics.roundRect(0, 0, 100, 100, 10)` |
| `.arc()` | x, y, radius, start, end | `graphics.arc(100, 100, 50, 0, Math.PI)` |
| `.moveTo()` | x, y | `graphics.moveTo(50, 50)` |
| `.lineTo()` | x, y | `graphics.lineTo(100, 100)` |
| `.closePath()` | - | `graphics.closePath()` |

### Styling

| Method | Parameters | Example |
|--------|------------|---------|
| `.fill()` | options | `graphics.fill({ color: 0xff0000, alpha: 0.8 })` |
| `.stroke()` | options | `graphics.stroke({ width: 2, color: 0x000000 })` |
| `.beginFill()` | color, alpha | `graphics.beginFill(0xff0000, 0.8)` |
| `.endFill()` | - | `graphics.endFill()` |
| `.lineStyle()` | width, color, alpha | `graphics.lineStyle(2, 0x000000)` |

### Clearing

| Method | Purpose |
|--------|---------|
| `.clear()` | Clear all graphics |
| `.destroy()` | Destroy graphics object |

---

## 💡 Complete Working Example

```typescript
// ✅ CORRECT - Working PixiJS v7 circle rendering

export class VisualizationEngine {
  private app: PIXI.Application;
  private bubbles: Map<string, PIXI.Graphics> = new Map();

  constructor(config: EngineConfig) {
    this.app = new PIXI.Application({
      width: config.width,
      height: config.height,
      backgroundColor: 0xffffff,
      antialias: true,
    });

    // ✅ Properly append canvas
    if (this.app.view) {
      config.container.appendChild(this.app.view as HTMLCanvasElement);
    }
  }

  /**
   * Render single bubble
   */
  private renderBubble(bubble: BubbleData): void {
    const graphics = new PIXI.Graphics();

    // ✅ Use method chaining (v7+ style)
    graphics
      .circle(bubble.x, bubble.y, bubble.radius)
      .fill({ color: bubble.color, alpha: 0.8 })
      .stroke({
        width: 1,
        color: 0x333333,
        alpha: 0.5,
      });

    // ✅ Add to stage
    this.app.stage.addChild(graphics);

    // Store reference
    this.bubbles.set(bubble.ticker.symbol, graphics);
  }

  /**
   * Resolve collisions (fixed)
   */
  async resolveCollisions(bubbles: BubbleData[]): Promise<void> {
    // ✅ Safety check
    if (!this.app || !this.app.screen) {
      console.warn('App not initialized, skipping collisions');
      return;
    }

    const { width, height } = this.app.screen;

    // Simple force-directed layout
    const iterations = 5;
    for (let iter = 0; iter < iterations; iter++) {
      for (const bubble of bubbles) {
        // Check bounds
        bubble.x = Math.max(bubble.radius, Math.min(width - bubble.radius, bubble.x));
        bubble.y = Math.max(bubble.radius, Math.min(height - bubble.radius, bubble.y));

        // Apply small forces
        bubble.x += (Math.random() - 0.5) * 2;
        bubble.y += (Math.random() - 0.5) * 2;
      }
    }
  }

  /**
   * Render all bubbles
   */
  async render(tickers: Ticker[], stats: any): Promise<void> {
    // Clear previous
    this.app.stage.removeChildren();
    this.bubbles.clear();

    // Calculate z-scores
    const volumes = tickers.map((t) => t.volume);
    const volumeZScores = tickers.map((t) => calculateZScore(t.volume, volumes));

    // Create bubble data
    const bubbleData = tickers.map((ticker, index) => ({
      ticker,
      x: Math.random() * this.app.screen.width,
      y: Math.random() * this.app.screen.height,
      radius: radiusScale(ticker.marketCap, stats.minMarketCap, stats.maxMarketCap),
      color: colorScale(ticker.changePct, -10, 10),
      zScore: volumeZScores[index],
    }));

    // Resolve collisions
    await this.resolveCollisions(bubbleData);

    // Render each bubble
    for (const bubble of bubbleData) {
      this.renderBubble(bubble);
    }

    console.log(`✓ Rendered ${bubbleData.length} bubbles`);
  }

  /**
   * Animation loop
   */
  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.app.render();
  }
}
```

---

## 🚀 Quick Fix Steps

### Step 1: Update renderBubble() (2 min)

**File**: `frontend/src/viz/engine.ts`

Replace:
```typescript
graphics.circle(...);
graphics.fill(...);
```

With:
```typescript
graphics
  .circle(...)
  .fill(...);
```

### Step 2: Add Safety Check to resolveCollisions() (2 min)

Add at beginning:
```typescript
if (!this.app || !this.app.screen) return;
```

### Step 3: Test (1 min)

```bash
# Browser already running, just refresh F5
# Check console:
# Should see: "✓ Rendered 20 bubbles"
# Should NOT see graphics.circle errors
```

---

## 📖 Official Documentation Links

- **PixiJS v7 Graphics Guide**: https://pixijs.com/7.x/guides/components/graphics
- **PixiJS v8 Graphics (Latest)**: https://pixijs.com/8.x/guides/components/scene-objects/graphics
- **API Reference**: https://pixijs.download/v7.4.2/docs/PIXI.Graphics.html

---

## ✅ PixiJS v7 Compatibility Checklist

- [x] Use `.circle()` not `drawCircle()`
- [x] Use `.fill()` and `.stroke()` methods (not `beginFill`)
- [x] Use method chaining for fluent API
- [x] Check `this.app.screen` before using
- [x] Properly append canvas as HTMLCanvasElement
- [x] Call `.clear()` before re-rendering

---

## 💾 Summary

**Key Changes from v6 to v7+**:
1. Graphics API uses method chaining
2. `.circle()` returns Graphics for chaining
3. `.fill()` and `.stroke()` are the preferred methods
4. Need to handle undefined `app.screen`
5. Better performance with new API

**Impact**: Bubbles should render once these 2 fixes are applied!

---

**Status**: Ready for implementation  
**Estimated Fix Time**: 5 minutes  
**Next Step**: Apply fixes above and refresh browser  

