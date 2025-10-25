/**
 * PixiJS Visualization Engine
 * Renders 900+ bubbles with WebGL instancing and spatial indexing
 */

import * as PIXI from 'pixi.js';
import { Ticker } from '../data/schema.js';
import { radiusScale, colorScale, calculateZScore } from './scales.js';

export interface BubbleData {
  ticker: Ticker;
  x: number;
  y: number;
  radius: number;
  color: string;
  zScore: number;
  vx?: number;  // Velocity X for bounce animation
  vy?: number;  // Velocity Y for bounce animation
}

export interface EngineConfig {
  container: HTMLElement;
  width: number;
  height: number;
  isMobileMode?: boolean;
}

/**
 * Spatial hash grid for efficient collision detection
 */
class SpatialGrid {
  private grid = new Map<string, BubbleData[]>();
  private cellSize: number;

  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
  }

  add(bubble: BubbleData): void {
    const key = this.getKey(bubble.x, bubble.y);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(bubble);
  }

  getNearby(x: number, y: number, range: number): BubbleData[] {
    const nearby: BubbleData[] = [];
    const minCellX = Math.floor((x - range) / this.cellSize);
    const maxCellX = Math.ceil((x + range) / this.cellSize);
    const minCellY = Math.floor((y - range) / this.cellSize);
    const maxCellY = Math.ceil((y + range) / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx},${cy}`;
        if (this.grid.has(key)) {
          nearby.push(...this.grid.get(key)!);
        }
      }
    }

    return nearby;
  }

  private getKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  clear(): void {
    this.grid.clear();
  }
}

/**
 * Main PixiJS engine
 */
export class VisualizationEngine {
  private app: PIXI.Application;
  private bubbles: Map<string, PIXI.Graphics> = new Map();
  private bubbleDataMap = new Map<string, BubbleData>();
  private textContainers = new Map<string, PIXI.Container>();
  private spatialGrid = new SpatialGrid(150);
  private config: EngineConfig;
  private animationFrameId: number | null = null;
  private isAnimating = false;

  constructor(config: EngineConfig) {
    this.config = config;
    
    console.log('Engine config:', {
      configWidth: config.width,
      configHeight: config.height,
      devicePixelRatio: window.devicePixelRatio
    });
    
    this.app = new PIXI.Application({
      width: config.width,
      height: config.height,
      backgroundColor: 0x1a1a1a,
      backgroundAlpha: 1,
      resolution: window.devicePixelRatio || 1,
      antialias: true,
    });

    console.log('PixiJS app created:', {
      width: config.width,
      height: config.height,
      appView: !!this.app.view,
      appViewWidth: this.app.view?.width,
      appViewHeight: this.app.view?.height
    });

    // Properly append canvas
    if (this.app.view && config.container) {
      const canvas = this.app.view as HTMLCanvasElement;
      // Set CSS size to match container (canvas element size will be multiplied by devicePixelRatio for internal rendering)
      canvas.style.width = `${config.width}px`;
      canvas.style.height = `${config.height}px`;
      config.container.appendChild(canvas);
      console.log('Canvas appended to container via app.view:', {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        canvasStyleWidth: canvas.style.width,
        canvasStyleHeight: canvas.style.height,
        containerWidth: config.container.offsetWidth,
        containerHeight: config.container.offsetHeight
      });
    } else {
      console.warn('Could not append canvas - missing app.view or container');
    }

    // Setup resize listener
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Render bubbles for given tickers
   */
  async render(tickers: Ticker[], stats: any): Promise<void> {
    console.log(`Starting render with ${tickers.length} tickers`);
    // Safety check - MUST be first
    if (!this.app || !this.app.screen) {
      console.warn('App or screen not initialized');
      return;
    }

    // Clear previous bubbles
    this.clear();

    // Get safe screen dimensions early
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;
    console.log(`Screen dimensions: ${screenWidth}x${screenHeight}`);

    // Calculate scales
    const minCap = stats.minMarketCap;
    const maxCap = stats.maxMarketCap;

    // Calculate z-scores for volume
    const volumes = tickers.map((t) => t.volume);
    const volumeZScores = tickers.map((t) => calculateZScore(t.volume, volumes));

    // Position bubbles with gentle initial velocity for smooth start
    const bubbleData = tickers.map((ticker, index) => {
      // Random angle for circular distribution of velocities
      const angle = (index / tickers.length) * Math.PI * 2;
      return {
        ticker,
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        radius: radiusScale(ticker.marketCap, minCap, maxCap, this.config.isMobileMode ? 'mobile' : 'desktop'),
        color: colorScale(ticker.changePct, -10, 10),
        zScore: volumeZScores[index],
        vx: Math.cos(angle) * 0.3,  // Gentle initial velocity in different directions
        vy: Math.sin(angle) * 0.3,
      };
    });

    console.log(`Created ${bubbleData.length} bubble data items`);

    // Skip initial collision resolution - let physics handle it during animation
    // await this.resolveCollisions(bubbleData);

    // Render bubbles and store data for physics
    console.log(`Rendering ${bubbleData.length} bubbles...`);
    this.bubbleDataMap.clear();
    for (const bubble of bubbleData) {
      this.renderBubble(bubble);
      this.bubbleDataMap.set(bubble.ticker.symbol, bubble);
      this.spatialGrid.add(bubble);
    }
    console.log(`✓ All bubbles rendered`);

    // Start animation loop
    this.animate();
  }

  /**
   * Resolve collisions between bubbles
   * @deprecated Not used in current implementation
   */
  // private async resolveCollisions(bubbles: BubbleData[]): Promise<void> {
  //   // Safety check
  //   if (!this.app || !this.app.screen) {
  //     console.warn('App or screen not initialized in resolveCollisions');
  //     return;
  //   }

  //   // ✅ Cache dimensions to avoid async scope issues
  //   const width = this.app.screen.width;
  //   const height = this.app.screen.height;
  //   const iterations = 5;  // Number of iterations for force-directed layout

  //   const repulsion = 1.5;
  //   const damping = 0.85;
  //   const vx = new Array(bubbles.length).fill(0);
  //   const vy = new Array(bubbles.length).fill(0);

  //   for (let iter = 0; iter < iterations; iter++) {
  //     // Reset forces
  //     for (let i = 0; i < bubbles.length; i++) {
  //       let fx = 0,
  //         fy = 0;

  //       // Repulsion from other bubbles
  //       for (let j = 0; j < bubbles.length; j++) {
  //         if (i === j) continue;

  //         const dx = bubbles[j].x - bubbles[i].x;
  //         const dy = bubbles[j].y - bubbles[i].y;
  //         const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
  //         const minDist = bubbles[i].radius + bubbles[j].radius + 2;

  //         if (dist < minDist) {
  //           const force = (minDist - dist) * repulsion;
  //           const angle = Math.atan2(dy, dx);
  //           fx -= Math.cos(angle) * force;
  //           fy -= Math.sin(angle) * force;
  //         }
  //       }

  //       // Attraction to center (use cached width/height)
  //       const cx = width / 2;
  //       const cy = height / 2;
  //       const dx = cx - bubbles[i].x;
  //       const dy = cy - bubbles[i].y;
  //       const centerForce = 0.01;
  //       fx += dx * centerForce;
  //       fy += dy * centerForce;

  //       // Update velocity
  //       vx[i] = (vx[i] + fx) * damping;
  //       vy[i] = (vy[i] + fy) * damping;

  //       // Update position
  //       bubbles[i].x += vx[i];
  //       bubbles[i].y += vy[i];

  //       // Keep within bounds (use cached dimensions)
  //       bubbles[i].x = Math.max(bubbles[i].radius, Math.min(width - bubbles[i].radius, bubbles[i].x));
  //       bubbles[i].y = Math.max(bubbles[i].radius, Math.min(height - bubbles[i].radius, bubbles[i].y));
  //     }

  //     // Yield to browser periodically
  //     if (iter % 2 === 0) {
  //       await new Promise((resolve) => requestAnimationFrame(resolve));
  //     }
  //   }
  // }

  /**
   * Render a single bubble with smooth radial gradient (like @bubble.png)
   */
  private renderBubble(bubble: BubbleData): void {
    const graphics = new PIXI.Graphics();

    // ✅ Convert hex color string to number
    const colorNum = typeof bubble.color === 'string' 
      ? parseInt(bubble.color.replace('#', ''), 16)
      : bubble.color;

    // ✅ SIMPLE BUBBLE GRADIENT: Only 2 rings for clean look
    // Edge terang, center transparent
    
    // Layer 2: Outer ring (brightest)
    graphics.lineStyle(bubble.radius * 0.15, colorNum, 0.75);
    graphics.drawCircle(0, 0, bubble.radius * 0.925);
    graphics.lineStyle(0);
    
    // Layer 1: Inner ring (lighter)
    graphics.lineStyle(bubble.radius * 0.12, colorNum, 0.35);
    graphics.drawCircle(0, 0, bubble.radius * 0.7);
    graphics.lineStyle(0);
    
    // Center is COMPLETELY EMPTY (transparent!)

    // Highlight if high z-score (high volume)
    if (bubble.zScore >= 2) {
      graphics.lineStyle(4, 0x00ffff, 0.6);
      graphics.drawCircle(0, 0, bubble.radius + 3);
      
      // Extra glow for very high volume
      if (bubble.zScore >= 3) {
        graphics.lineStyle(2, 0x00ffff, 0.3);
        graphics.drawCircle(0, 0, bubble.radius + 8);
      }
    }

    graphics.x = bubble.x;
    graphics.y = bubble.y;
    graphics.interactive = true;
    graphics.cursor = 'pointer';

    // ✅ Add text labels
    const container = new PIXI.Container();
    container.x = bubble.x;
    container.y = bubble.y;
    
    // Symbol text (larger)
    const symbolText = new PIXI.Text(bubble.ticker.symbol, {
      fontFamily: 'Arial, sans-serif',
      fontSize: Math.max(10, bubble.radius / 3),
      fontWeight: 'bold',
      fill: 0xffffff,
      align: 'center',
    });
    symbolText.anchor.set(0.5, 0.5);
    symbolText.y = -bubble.radius * 0.1;
    container.addChild(symbolText);
    
    // Change % text (smaller)
    const changePercent = bubble.ticker.changePct ?? 0;
    const changeText = new PIXI.Text(
      `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: Math.max(8, bubble.radius / 4),
        fill: 0xffffff,
        align: 'center',
      }
    );
    changeText.anchor.set(0.5, 0.5);
    changeText.y = bubble.radius * 0.15;
    container.addChild(changeText);
    
    // Store references
    this.bubbles.set(bubble.ticker.symbol, graphics);
    if (this.app?.stage) {
      this.app.stage.addChild(graphics);
      this.app.stage.addChild(container);
    }
    
    // Store container ref for later updates
    if (!this.textContainers) {
      this.textContainers = new Map();
    }
    this.textContainers.set(bubble.ticker.symbol, container);
  }

  /**
   * Animation loop with bubble-to-bubble repulsion and center attraction
   */
  private animate(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const startTime = performance.now();
    let lastTime = startTime;
    
    // Physics constants (smooth free-floating motion)
    const repulsion = 0.05;          // Gentle repulsion
    const brownianForce = 0.012;     // Subtle but visible random motion
    const damping = 0.992;           // Slight damping for smooth yet active motion
    const maxVelocity = 1.8;         // Moderate velocity for visible movement

      const frame = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67;
      lastTime = currentTime;
      
      // Update physics for each bubble
      const bubbleArray = Array.from(this.bubbles.entries());
      
      for (let i = 0; i < bubbleArray.length; i++) {
        const [symbol, graphics] = bubbleArray[i];
        const bubbleA = this.findBubbleData(symbol);
        if (!bubbleA) continue;
        
        // Initialize velocity
        if (!bubbleA.vy) bubbleA.vy = 0;
        if (!bubbleA.vx) bubbleA.vx = 0;
        
        // ✅ Brownian motion (random force for free-floating movement)
        bubbleA.vx += (Math.random() - 0.5) * brownianForce;
        bubbleA.vy += (Math.random() - 0.5) * brownianForce;
        
        // Bubble-to-bubble repulsion (collision avoidance)
        for (let j = i + 1; j < bubbleArray.length; j++) {
          const [otherSymbol] = bubbleArray[j];
          const bubbleB = this.findBubbleData(otherSymbol);
          if (!bubbleB) continue;
          
          const dx = bubbleB.x - bubbleA.x;
          const dy = bubbleB.y - bubbleA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = bubbleA.radius + bubbleB.radius + 5; // Extra spacing for movement
          
          // Gentle repulsion when overlapping
          if (distance < minDistance && distance > 0) {
            const angle = Math.atan2(dy, dx);
            const targetX = bubbleA.x + Math.cos(angle) * minDistance;
            const targetY = bubbleA.y + Math.sin(angle) * minDistance;
            
            // Apply smooth separation force
            const ax = (targetX - bubbleB.x) * repulsion;
            const ay = (targetY - bubbleB.y) * repulsion;
            
            bubbleA.vx -= ax;
            bubbleA.vy -= ay;
            bubbleB.vx = (bubbleB.vx || 0) + ax;
            bubbleB.vy = (bubbleB.vy || 0) + ay;
          }
        }
        
        // Apply velocity
        bubbleA.x += bubbleA.vx * deltaTime;
        bubbleA.y += bubbleA.vy * deltaTime;
        
        // Bounce off edges
        if (this.app.screen) {
          // Bottom bounce
          if (bubbleA.y + bubbleA.radius > this.app.screen.height) {
            bubbleA.y = this.app.screen.height - bubbleA.radius;
            bubbleA.vy *= -0.8;
          }
          // Top bounce
          if (bubbleA.y - bubbleA.radius < 0) {
            bubbleA.y = bubbleA.radius;
            bubbleA.vy *= -0.8;
          }
          // Right bounce
          if (bubbleA.x + bubbleA.radius > this.app.screen.width) {
            bubbleA.x = this.app.screen.width - bubbleA.radius;
            bubbleA.vx *= -0.8;
          }
          // Left bounce
          if (bubbleA.x - bubbleA.radius < 0) {
            bubbleA.x = bubbleA.radius;
            bubbleA.vx *= -0.8;
          }
        }
        
        // Apply damping to keep motion smooth
        bubbleA.vx *= damping;
        bubbleA.vy *= damping;
        
        // Cap max velocity
        const speed = Math.sqrt(bubbleA.vx * bubbleA.vx + bubbleA.vy * bubbleA.vy);
        if (speed > maxVelocity) {
          const scale = maxVelocity / speed;
          bubbleA.vx *= scale;
          bubbleA.vy *= scale;
        }
        
        // Update graphics position
        graphics.x = bubbleA.x;
        graphics.y = bubbleA.y;
        
        // Update text labels position
        const textContainer = this.textContainers.get(symbol);
        if (textContainer) {
          textContainer.x = bubbleA.x;
          textContainer.y = bubbleA.y;
        }
      }

      // ✅ Explicitly render (ensure canvas updates)
      if (this.app && this.app.renderer) {
        this.app.renderer.render(this.app.stage);
      }

      this.animationFrameId = requestAnimationFrame(frame);
    };

    this.animationFrameId = requestAnimationFrame(frame);
    console.log('✓ Continuous motion animation with Brownian force started');
  }
  
  /**
   * Helper to find bubble data by symbol
   */
  private findBubbleData(symbol: string): BubbleData | null {
    // This is a workaround - ideally we'd store bubble references
    // For now, we'll need to store bubble data in the instance
    const bubbleData = this.bubbleDataMap.get(symbol);
    return bubbleData || null;
  }

  /**
   * Get bubble at position
   */
  getBubbleAt(x: number, y: number): Ticker | null {
    for (const [symbol, graphics] of this.bubbles) {
      const dx = graphics.x - x;
      const dy = graphics.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < (graphics.width / 2) * graphics.scale.x) {
        // Find ticker by symbol - would need ticker reference
        console.log(`Bubble clicked: ${symbol}`);
        return null; // Would need ticker reference
      }
    }
    return null;
  }

  /**
   * Resize canvas
   */
  resize(width?: number, height?: number): void {
    if (!this.app || !this.app.renderer) {
      console.warn('App or renderer not initialized');
      return;
    }
    
    if (width && height) {
      this.app.renderer.resize(width, height);
    } else {
      const rect = this.config.container.getBoundingClientRect();
      this.app.renderer.resize(rect.width, rect.height);
    }
  }

  /**
   * Clear all bubbles
   */
  clear(): void {
    for (const graphic of this.bubbles.values()) {
      this.app.stage.removeChild(graphic);
    }
    for (const container of this.textContainers.values()) {
      this.app.stage.removeChild(container);
    }
    this.bubbles.clear();
    this.textContainers.clear();
    this.bubbleDataMap.clear();
    this.spatialGrid.clear();

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      this.isAnimating = false;
    }
  }

  /**
   * Destroy engine
   */
  destroy(): void {
    console.log('Destroying PixiJS engine and cleaning up canvas...');
    this.clear();
    // Destroy with removeView to remove canvas from DOM
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
  }
}
