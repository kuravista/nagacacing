/**
 * Spark Chart Component
 * Renders a simple line chart for spark7 price data
 */

import React, { useMemo } from 'react';

interface SparkChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export const SparkChart: React.FC<SparkChartProps> = ({
  data,
  color = '#51cf66',
  height = 40,
  width = 280,
}) => {
  const path = useMemo(() => {
    if (!data || data.length === 0) return '';

    // Find min and max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Avoid division by zero

    // Calculate points
    const pointWidth = width / (data.length - 1 || 1);
    const padding = 4;
    const innerHeight = height - padding * 2;

    const points = data.map((value, index) => {
      const x = index * pointWidth;
      const y = padding + (1 - (value - min) / range) * innerHeight;
      return [x, y];
    });

    // Create SVG path
    const pathData = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`).join(' ');

    return pathData;
  }, [data, width, height]);

  if (!data || data.length < 2) {
    return null;
  }

  return (
    <svg
      data-testid="spark-chart"
      width={width}
      height={height}
      style={{
        overflow: 'visible',
        display: 'block',
      }}
    >
      {/* Background grid lines (optional) */}
      <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#f0f0f0" strokeWidth="1" />

      {/* Line */}
      <path
        d={path}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots at data points */}
      {data.map((_, index) => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const pointWidth = width / (data.length - 1 || 1);
        const padding = 4;
        const innerHeight = height - padding * 2;

        const x = index * pointWidth;
        const y = padding + (1 - (data[index] - min) / range) * innerHeight;

        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="2"
            fill={color}
            opacity="0.6"
          />
        );
      })}
    </svg>
  );
};

export default SparkChart;
