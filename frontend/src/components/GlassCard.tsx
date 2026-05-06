import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
  glowColor?: 'purple' | 'cyan' | 'magenta' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  noPadding = false,
  glowColor = 'none' 
}) => {
  const glowClasses = {
    purple: 'hover:shadow-glow-purple hover:border-accent-purple/30',
    cyan: 'hover:shadow-glow-cyan hover:border-accent-cyan/30',
    magenta: 'hover:shadow-glow-magenta hover:border-accent-magenta/30',
    none: 'hover:border-white/[0.15]',
  };

  return (
    <div className={`glass shadow-glass transition-all duration-500 ${glowClasses[glowColor]} ${className}`}>
      {(title || subtitle) && (
        <div className={noPadding ? 'px-6 pt-6 pb-4' : 'mb-5'}>
          {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-white/40 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};
