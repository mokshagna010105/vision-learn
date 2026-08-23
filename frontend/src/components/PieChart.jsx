import React, { useState } from 'react';

const PieChart = ({ data = [], title = '' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-400 text-xs py-8">
        No chart data available
      </div>
    );
  }

  const total = data.reduce((acc, d) => acc + d.value, 0);

  // SVG parameters
  const size = 200;
  const radius = 60;
  const strokeWidth = 18;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Custom Colors
  const colors = [
    '#2563EB', // blue
    '#14B8A6', // teal
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#EF4444', // red
    '#10B981', // green
  ];

  let accumulatedPercent = 0;

  const slices = data.map((d, idx) => {
    const percent = (d.value / (total || 1)) * 100;
    const strokeLength = (d.value / (total || 1)) * circumference;
    const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
    accumulatedPercent += percent;
    return {
      ...d,
      percent,
      strokeLength,
      strokeOffset,
      color: colors[idx % colors.length]
    };
  });

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-around gap-6">
      {/* Chart Canvas */}
      <div className="relative w-44 h-44">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90 overflow-visible">
          {/* Base Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((s, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={`${s.strokeLength} ${circumference}`}
              strokeDashoffset={s.strokeOffset}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer origin-center"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            {hoveredIdx !== null ? `${Math.round(slices[hoveredIdx].percent)}%` : total}
          </span>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {hoveredIdx !== null ? slices[hoveredIdx].label : 'Total Calls'}
          </span>
        </div>
      </div>

      {/* Legend Table */}
      <div className="flex flex-col gap-2 min-w-[120px]">
        {slices.map((s, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              hoveredIdx === idx ? 'bg-slate-100 dark:bg-slate-800' : ''
            }`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="w-3 h-3 rounded-md" style={{ backgroundColor: s.color }} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">{s.label}</span>
              <span className="text-[11px] font-semibold text-slate-500">{s.value} calls</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
