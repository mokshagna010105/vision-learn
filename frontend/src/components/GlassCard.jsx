import React from 'react';

const GlassCard = ({ children, className = '', hover = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        glass-panel 
        rounded-2xl 
        shadow-sm 
        p-6 
        transition-all 
        duration-350 
        ${hover ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-white/60 dark:hover:border-white/10' : ''} 
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
