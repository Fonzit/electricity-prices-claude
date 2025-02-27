'use client';

import { useEffect, useRef } from 'react';
import { Price } from '../types/api';

type PriceChartProps = {
  prices: Price[];
};

export function PriceChart({ prices }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !prices.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sort prices by start date
    const sortedPrices = [...prices].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    // Calculate chart dimensions
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    // Find min and max price for scaling
    const minPrice = Math.min(...sortedPrices.map(p => p.price));
    const maxPrice = Math.max(...sortedPrices.map(p => p.price));
    const priceRange = maxPrice - minPrice;
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw price bars
    const barWidth = width / sortedPrices.length;
    
    // Find the current hour
    const now = new Date();
    const currentHourIndex = sortedPrices.findIndex(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return now >= start && now < end;
    });
    
    sortedPrices.forEach((price, index) => {
      const x = padding + index * barWidth;
      const barHeight = ((price.price - minPrice) / (priceRange || 1)) * height;
      const y = canvas.height - padding - barHeight;
      
      // Calculate color based on price (green for low, yellow for medium, red for high)
      const priceRatio = (price.price - minPrice) / (priceRange || 1);
      const barColor = priceRatio > 0.7 ? '#ef4444' : // Red
                      priceRatio > 0.4 ? '#facc15' : // Yellow
                      '#4ade80'; // Green
      
      // Check if this is the current hour
      const isCurrentHour = index === currentHourIndex;
      
      // Draw bar
      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth - 2, barHeight);
      
      // If current hour, add highlight and marker
      if (isCurrentHour) {
        // Draw border around current hour bar
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth - 2, barHeight);
        
        // Draw an arrow pointing to the bar
        ctx.beginPath();
        ctx.moveTo(x + (barWidth - 2) / 2, y - 2);
        ctx.lineTo(x + (barWidth - 2) / 2 - 3, y - 8);
        ctx.lineTo(x + (barWidth - 2) / 2 + 3, y - 8);
        ctx.closePath();
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // Add a "NOW" marker above the bar and arrow
        ctx.fillStyle = '#000';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NYT', x + (barWidth - 2) / 2, y - 10);
      }
      
      // Add time labels for every 4th bar
      if (index % 4 === 0) {
        const date = new Date(price.startDate);
        const time = date.getHours().toString().padStart(2, '0') + ':00';
        
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(time, x + barWidth / 2, canvas.height - padding + 15);
      }
    });
    
    // Add price scale on the left axis
    const numPriceLabels = 5;
    for (let i = 0; i <= numPriceLabels; i++) {
      const price = minPrice + (priceRange / numPriceLabels) * i;
      const y = canvas.height - padding - (i / numPriceLabels) * height;
      
      ctx.fillStyle = '#888';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2), padding - 5, y + 3);
      
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
    ctx.fillText('Sähkön Hinnat (senttiä/kWh)', canvas.width / 2, padding / 2);
    
    // Add event listeners for tooltip
    if (canvas && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      
      canvas.onmousemove = (e) => {
        // Get mouse position relative to the canvas, accounting for browser differences
        const rect = canvas.getBoundingClientRect();
        
        // Calculate the scale factor between the canvas's logical size and display size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // Get mouse position in canvas coordinates, accounting for scaling
        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;
        
        // Calculate which price bar the mouse is over
        const padding = 40;
        const barWidth = width / sortedPrices.length;
        
        // Clear previous drawing to avoid stacking overlays
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawChart(); // Redraw the chart
        }
        
        if (canvasX >= padding && canvasX <= canvas.width - padding && 
            canvasY >= padding && canvasY <= canvas.height - padding) {
          
          const barIndex = Math.floor((canvasX - padding) / barWidth);
          
          if (barIndex >= 0 && barIndex < sortedPrices.length) {
            const price = sortedPrices[barIndex];
            const date = new Date(price.startDate);
            const formattedDate = date.toLocaleDateString('fi-FI', { 
              day: '2-digit', 
              month: '2-digit',
              year: 'numeric'
            });
            const time = date.getHours().toString().padStart(2, '0') + ':00';
            
            const barX = padding + barIndex * barWidth;
            const barHeight = ((price.price - minPrice) / (priceRange || 1)) * height;
            const barY = canvas.height - padding - barHeight;
            
            // Highlight the selected bar
            if (ctx) {
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 2;
              ctx.strokeRect(
                barX, 
                barY, 
                barWidth - 2, 
                barHeight
              );
            }
            
            // Position and show tooltip
            tooltip.innerHTML = `
              <div class="font-bold">${price.price.toFixed(2)} c/kWh</div>
              <div class="text-xs opacity-80">${formattedDate} | ${time}</div>
              <div class="absolute left-1/2 bottom-0 w-0 h-0 -mb-2 transform -translate-x-1/2" style="border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid rgba(17, 24, 39, 1);"></div>
            `;
            
            tooltip.style.display = 'block';
            
            // Position the tooltip directly above the bar
            const barCenterX = barX + (barWidth - 2) / 2;  // Center of the bar in canvas coordinates
            const tooltipX = (barCenterX / canvas.width) * rect.width + rect.left;
            const tooltipY = barY * (rect.height / canvas.height) + rect.top - 40;
            
            tooltip.style.left = `${tooltipX}px`;
            tooltip.style.top = `${tooltipY}px`;
          } else {
            tooltip.style.display = 'none';
          }
        } else {
          tooltip.style.display = 'none';
        }
      };
      
      canvas.onmouseleave = () => {
        tooltip.style.display = 'none';
        
        // Redraw to remove highlight
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawChart();
        }
      };
      
      // Function to redraw chart without highlights
      function drawChart() {
        if (!ctx) return;
        
        // Draw axes
        ctx.beginPath();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Find the current hour (define it at the top so its available to both instances of drawChart)
        const now = new Date();
        const currentHourIndex = sortedPrices.findIndex(p => {
          const start = new Date(p.startDate);
          const end = new Date(p.endDate);
          return now >= start && now < end;
        });
        
        // Draw price bars
        sortedPrices.forEach((price, index) => {
          const x = padding + index * barWidth;
          const barHeight = ((price.price - minPrice) / (priceRange || 1)) * height;
          const y = canvas.height - padding - barHeight;
          
          // Calculate color based on price
          const priceRatio = (price.price - minPrice) / (priceRange || 1);
          const barColor = priceRatio > 0.7 ? '#ef4444' : // Red
                          priceRatio > 0.4 ? '#facc15' : // Yellow
                          '#4ade80'; // Green
          
          // Check if this is the current hour
          const isCurrentHour = index === currentHourIndex;
          
          // Draw bar
          ctx.fillStyle = barColor;
          ctx.fillRect(x, y, barWidth - 2, barHeight);
          
          // If current hour, add highlight and marker
          if (isCurrentHour) {
            // Draw border around current hour bar
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, barWidth - 2, barHeight);
            
            // Draw an arrow pointing to the bar
            ctx.beginPath();
            ctx.moveTo(x + (barWidth - 2) / 2, y - 2);
            ctx.lineTo(x + (barWidth - 2) / 2 - 3, y - 8);
            ctx.lineTo(x + (barWidth - 2) / 2 + 3, y - 8);
            ctx.closePath();
            ctx.fillStyle = '#000';
            ctx.fill();
            
            // Add a "NOW" marker above the bar and arrow
            ctx.fillStyle = '#000';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('NYT', x + (barWidth - 2) / 2, y - 10);
          }
          
          // Add time labels for every 4th bar
          if (index % 4 === 0) {
            const date = new Date(price.startDate);
            const time = date.getHours().toString().padStart(2, '0') + ':00';
            
            ctx.fillStyle = '#888';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(time, x + barWidth / 2, canvas.height - padding + 15);
          }
        });
        
        // Add price scale on the left axis
        for (let i = 0; i <= numPriceLabels; i++) {
          const price = minPrice + (priceRange / numPriceLabels) * i;
          const y = canvas.height - padding - (i / numPriceLabels) * height;
          
          ctx.fillStyle = '#888';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(price.toFixed(2), padding - 5, y + 3);
          
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
        ctx.fillText('Sähkön Hinnat (senttiä/kWh)', canvas.width / 2, padding / 2);
      }
    }
  }, [prices]);

  // Determine if now is a good time to use electricity (below average price)
  const averagePrice = prices.length ? prices.reduce((sum, p) => sum + p.price, 0) / prices.length : 0;
  const currentPrice = prices.find(p => {
    const now = new Date();
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return now >= start && now < end;
  });
  
  const isGoodTime = currentPrice && currentPrice.price < averagePrice;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={400}
          className="w-full h-auto bg-white dark:bg-gray-900 rounded mb-4 cursor-pointer"
        />
        
        {/* Tooltip */}
        <div 
          ref={tooltipRef}
          className="fixed bg-gray-900 text-white px-3 py-2 rounded-md text-center text-sm pointer-events-none shadow-lg border border-gray-700 hidden"
          style={{ zIndex: 10, transform: 'translate(-50%, -100%)' }}
        ></div>
      </div>
      
      {currentPrice && (
        <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
          <p className="font-medium">Nykyinen Hinta: <span className="font-bold">{currentPrice.price.toFixed(2)} senttiä/kWh</span></p>
          <p className="mt-2">
            {isGoodTime ? 
              '✅ Hyvä aika käyttää sähköä! Hinta on keskiarvoa alhaisempi.' : 
              '⚠️ Hinta on keskiarvoa korkeampi. Harkitse odottamista jos mahdollista.'}
          </p>
        </div>
      )}
    </div>
  );
}