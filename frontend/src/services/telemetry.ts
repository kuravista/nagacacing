/**
 * Telemetry Service
 * Optional performance and error tracking (user opt-in)
 */

interface TelemetryConfig {
  enabled: boolean;
  endpoint?: string;
}

interface MetricsData {
  fpsAvg: number;
  fpsMin: number;
  fpsMax: number;
  errorCount: number;
  errorList: string[];
  renderTime: number;
  sessionDuration: number;
  timestamp: string;
}

const STORAGE_KEY = 'nagacacing_telemetry_enabled';
const DEFAULT_ENDPOINT = 'https://api.nagacacing.com/telemetry';

class TelemetryService {
  private config: TelemetryConfig;
  private metrics: {
    frameTimings: number[];
    errors: string[];
    sessionStart: number;
    renderTimes: number[];
  };

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = {
      enabled: this.loadPreference(),
      endpoint: config.endpoint || DEFAULT_ENDPOINT,
    };

    this.metrics = {
      frameTimings: [],
      errors: [],
      sessionStart: Date.now(),
      renderTimes: [],
    };

    // Track uncaught errors
    window.addEventListener('error', (event) => {
      this.trackError(event.message);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(`Unhandled Promise: ${event.reason}`);
    });
  }

  /**
   * Load user preference from localStorage
   */
  private loadPreference(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const pref = localStorage.getItem(STORAGE_KEY);
    return pref === 'true';
  }

  /**
   * Save user preference to localStorage
   */
  private savePreference(enabled: boolean): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }

  /**
   * Enable telemetry (user opt-in)
   */
  public enable(): void {
    this.config.enabled = true;
    this.savePreference(true);
  }

  /**
   * Disable telemetry (user opt-out)
   */
  public disable(): void {
    this.config.enabled = false;
    this.savePreference(false);
  }

  /**
   * Check if telemetry is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Track frame timing (for FPS calculation)
   */
  public trackFrame(deltaTime: number): void {
    if (!this.config.enabled) return;

    this.metrics.frameTimings.push(deltaTime);

    // Keep only last 300 frames (~5 seconds @ 60 FPS)
    if (this.metrics.frameTimings.length > 300) {
      this.metrics.frameTimings.shift();
    }
  }

  /**
   * Track render time
   */
  public trackRenderTime(duration: number): void {
    if (!this.config.enabled) return;

    this.metrics.renderTimes.push(duration);

    // Keep only last 100 renders
    if (this.metrics.renderTimes.length > 100) {
      this.metrics.renderTimes.shift();
    }
  }

  /**
   * Track error
   */
  public trackError(message: string): void {
    this.metrics.errors.push(message);

    // Keep only last 50 errors
    if (this.metrics.errors.length > 50) {
      this.metrics.errors.shift();
    }
  }

  /**
   * Calculate average FPS
   */
  private calculateFps(): { avg: number; min: number; max: number } {
    if (this.metrics.frameTimings.length === 0) {
      return { avg: 0, min: 0, max: 0 };
    }

    const deltaMs = this.metrics.frameTimings;
    const avgDelta = deltaMs.reduce((a, b) => a + b, 0) / deltaMs.length;
    const avgFps = 1000 / avgDelta;

    const fpsValues = deltaMs.map((dt) => 1000 / dt);
    const minFps = Math.min(...fpsValues);
    const maxFps = Math.max(...fpsValues);

    return {
      avg: Math.round(avgFps * 100) / 100,
      min: Math.round(minFps * 100) / 100,
      max: Math.round(maxFps * 100) / 100,
    };
  }

  /**
   * Calculate average render time
   */
  private calculateRenderTime(): number {
    if (this.metrics.renderTimes.length === 0) return 0;
    const sum = this.metrics.renderTimes.reduce((a, b) => a + b, 0);
    return Math.round((sum / this.metrics.renderTimes.length) * 100) / 100;
  }

  /**
   * Get current metrics
   */
  public getMetrics(): MetricsData {
    const fps = this.calculateFps();
    const sessionDuration = Math.floor((Date.now() - this.metrics.sessionStart) / 1000);

    return {
      fpsAvg: fps.avg,
      fpsMin: fps.min,
      fpsMax: fps.max,
      errorCount: this.metrics.errors.length,
      errorList: this.metrics.errors.slice(-5), // Last 5 errors
      renderTime: this.calculateRenderTime(),
      sessionDuration,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send telemetry to backend
   */
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

      if (!response.ok) {
        console.warn(`Telemetry send failed: ${response.status}`);
      }
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.debug('Telemetry send error:', error);
    }
  }

  /**
   * Reset metrics
   */
  public reset(): void {
    this.metrics = {
      frameTimings: [],
      errors: [],
      sessionStart: Date.now(),
      renderTimes: [],
    };
  }
}

// Singleton instance
let instance: TelemetryService | null = null;

export function getTelemetryService(
  config?: Partial<TelemetryConfig>
): TelemetryService {
  if (!instance) {
    instance = new TelemetryService(config);
  }
  return instance;
}

export type { MetricsData, TelemetryConfig };
