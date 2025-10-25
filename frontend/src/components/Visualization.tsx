/**
 * Visualization Component
 * Renders PixiJS bubble chart visualization
 */

import React, { useEffect, useRef } from 'react';
import { Data } from '../data/schema.js';
import { VisualizationEngine } from '../viz/engine.js';

interface VisualizationProps {
  data: Data;
  isMobileMode: boolean;
}

export const Visualization: React.FC<VisualizationProps> = ({ data, isMobileMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VisualizationEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent multiple initializations - destroy existing engine first
    if (engineRef.current) {
      console.log('Cleaning up existing engine...');
      engineRef.current.destroy();
      engineRef.current = null;
    }

    try {
      // Get container's actual dimensions (not window!)
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || (window.innerHeight - 100);
      
      console.log('Container dimensions:', { width, height });

      // Initialize engine ONCE
      const engine = new VisualizationEngine({
        container: containerRef.current,
        width,
        height,
        isMobileMode,
      });

      engineRef.current = engine;

      // Render data
      engine.render(data.tickers, data.stats);

      console.log('✓ Visualization engine initialized');

      // Handle resize
      const handleResize = () => {
        const newRect = containerRef.current?.getBoundingClientRect();
        if (newRect && engineRef.current) {
          engineRef.current.resize(newRect.width, newRect.height);
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        console.log('Cleanup: removing listeners and destroying engine');
        window.removeEventListener('resize', handleResize);
        if (engineRef.current) {
          engineRef.current.destroy();
          engineRef.current = null;
        }
      };
    } catch (error) {
      console.error('Failed to initialize visualization:', error);
      return () => {
        // Cleanup on error
        if (engineRef.current) {
          engineRef.current.destroy();
          engineRef.current = null;
        }
      };
    }
  }, [data, isMobileMode]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 'calc(100vh - 100px)',
        backgroundColor: '#f5f5f5',
        position: 'relative',
      }}
    />
  );
};

export default Visualization;
