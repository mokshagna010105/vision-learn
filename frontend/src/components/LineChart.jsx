import React, { useState } from 'react';

const LineChart = ({ data = [], title = '', height = 200 }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-400 text-xs py-8">
        No chart data available
      </div>
    );
  }

  const values = data.map(d => d.value);
  const labels = data.map(d => d.label);
  
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const range = maxVal - minVal;

  const width = 500;
  const graphHeight = height - 60;
  const paddingX = 40;
  const paddingY = 20;

  const points = data.map((d, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * (width - paddingX * 2);
    // Invert Y coordinate because SVG origin is top-left
    const y = paddingY + graphHeight - ((d.value - minVal) / range) * graphHeight;
    return { x, y, label: d.label, value: d.value };
  });


  
  // Construct path string
  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    // Area under path (for gradient fill)
    areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + graphHeight} L ${points[0].x} ${paddingY + graphHeight} Z`;
  }

  return (
    <div className="w-full">
      {title && <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">{title}</h4>}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
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

          {/* Area Fill */}
          {areaD && <path d={areaD} fill="url(#lineGrad)" className="transition-all duration-300" />}

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Points & Interactive circles */}
          {points.map((p, idx) => (
            <g key={idx}>
              {/* Vertical guideline on hover */}
              {hoveredIdx === idx && (
                <line
                  x1={p.x}
                  y1={paddingY}
                  x2={p.x}
                  y2={paddingY + graphHeight}
                  stroke="#2563EB"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  className="opacity-40"
                />
              )}

              {/* Point Circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 6 : 4}
                fill={hoveredIdx === idx ? '#14B8A6' : '#2563EB'}
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-200 cursor-pointer shadow-sm"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* X Axis Labels */}
              <text
                x={p.x}
                y={paddingY + graphHeight + 18}
                textAnchor="middle"
                className="text-[9px] font-bold fill-slate-400 dark:fill-slate-500 uppercase tracking-wider"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div
            className="absolute bg-slate-900/95 dark:bg-slate-800/95 text-white text-[10px] font-semibold py-1.5 px-2.5 rounded-lg shadow-md border border-slate-700/50 pointer-events-none transition-all"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${(points[hoveredIdx].y / height) * 100 - 45}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-[8px] text-slate-400 dark:text-slate-400 font-bold uppercase">{points[hoveredIdx].label}</div>
            <div className="text-accent-300">{points[hoveredIdx].value}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineChart;
