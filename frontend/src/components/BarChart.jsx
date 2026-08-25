import React, { useState } from 'react';

const BarChart = ({ data = [], title = '', height = 200 }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-400 text-xs py-8">
        No chart data available
      </div>
    );
  }

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const range = maxVal - minVal;

  const width = 500;
  const graphHeight = height - 60;
  const paddingX = 40;
  const paddingY = 20;

  const barWidth = Math.max(10, ((width - paddingX * 2) / data.length) * 0.55);
  const spacing = ((width - paddingX * 2) - barWidth * data.length) / (data.length - 1 || 1);

  const bars = data.map((d, idx) => {
    const x = paddingX + idx * (barWidth + spacing);
    const valHeight = ((d.value - minVal) / range) * graphHeight;
    const y = paddingY + graphHeight - valHeight;
    return { x, y, width: barWidth, height: valHeight, label: d.label, value: d.value };
  });

  return (
    <div className="w-full">
      {title && <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">{title}</h4>}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
            <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + ratio * graphHeight;
            const val = Math.round(maxVal - ratio * range);
            return (
              <g key={i} className="opacity-20 dark:opacity-10">
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-800 dark:fill-white font-medium">{val}</text>
              </g>
            );
          })}

          {/* Bars */}
          {bars.map((b, idx) => (
            <g key={idx}>
              {/* Rounded top rect bar */}
              <rect
                x={b.x}
                y={b.y}
                width={b.width}
                height={Math.max(b.height, 2)} // Minimum 2px height to make zero values visible
                rx="4"
                fill={hoveredIdx === idx ? 'url(#barGradHover)' : 'url(#barGrad)'}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* X Axis Labels */}
              <text
                x={b.x + b.width / 2}
                y={paddingY + graphHeight + 18}
                textAnchor="middle"
                className="text-[9px] font-bold fill-slate-400 dark:fill-slate-500 uppercase tracking-wider"
              >
                {b.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div
            className="absolute bg-slate-900/95 dark:bg-slate-800/95 text-white text-[10px] font-semibold py-1.5 px-2.5 rounded-lg shadow-md border border-slate-700/50 pointer-events-none transition-all"
            style={{
              left: `${((bars[hoveredIdx].x + bars[hoveredIdx].width / 2) / width) * 100}%`,
              top: `${(bars[hoveredIdx].y / height) * 100 - 45}%`,
              transform: 'translateX(-50%)',
            }}
          >


            
            <div className="text-[8px] text-slate-400 dark:text-slate-400 font-bold uppercase">{bars[hoveredIdx].label}</div>
            <div className="text-accent-300">{bars[hoveredIdx].value}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarChart;
