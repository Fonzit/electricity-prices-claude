'use client';

import { useEffect, useRef } from 'react';
import { Price } from '../types/api';

type PriceHistogramProps = {
  prices: Price[];
};

export function PriceHistogram({ prices }: PriceHistogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !prices.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate chart dimensions
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    // Create histogram data
    const minPrice = Math.min(...prices.map(p => p.price));
    const maxPrice = Math.max(...prices.map(p => p.price));
    const binCount = 10;
    const binSize = (maxPrice - minPrice) / binCount;
    
    const bins = Array(binCount).fill(0);
    
    prices.forEach(price => {
      const binIndex = Math.min(
        Math.floor((price.price - minPrice) / binSize),
        binCount - 1
      );
      bins[binIndex]++;
    });
    
    const maxBinValue = Math.max(...bins);
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw histogram bars
    const barWidth = width / binCount;
    
    bins.forEach((count, index) => {
      const x = padding + index * barWidth;
      const barHeight = (count / maxBinValue) * height;
      const y = canvas.height - padding - barHeight;
      
      // Calculate color based on bin index (lower prices are green, higher are red)
      const ratio = index / (binCount - 1);
      const r = Math.round(255 * ratio);
      const g = Math.round(255 * (1 - ratio));
      const barColor = `rgb(${r}, ${g}, 80)`;
      
      // Draw bar
      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth - 2, barHeight);
      
      // Add price label
      const binPrice = minPrice + index * binSize;
      if (index % 2 === 0 || index === binCount - 1) {
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(binPrice.toFixed(1), x + barWidth / 2, canvas.height - padding + 15);
      }
    });
    
    // Add count scale on the left axis
    const numCountLabels = 5;
    for (let i = 0; i <= numCountLabels; i++) {
      const count = (maxBinValue / numCountLabels) * i;
      const y = canvas.height - padding - (i / numCountLabels) * height;
      
      ctx.fillStyle = '#888';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(count).toString(), padding - 5, y + 3);
      
      // Add horizontal grid line
      ctx.beginPath();
      ctx.strokeStyle = '#eee';
      ctx.setLineDash([2, 2]);
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Add chart title
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hintajakauma (senttiä/kWh)', canvas.width / 2, padding / 2);
  }, [prices]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={300}
        className="w-full h-auto bg-white dark:bg-gray-900 rounded"
      />
    </div>
  );
}