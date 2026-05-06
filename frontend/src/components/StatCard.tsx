import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  subtext?: string;
  color: 'purple' | 'cyan' | 'green' | 'amber' | 'rose';
}

const colorMap = {
  purple: {
    iconBg: 'bg-accent-purple/10',
    iconText: 'text-accent-purple',
    valueTxt: 'text-accent-purple',
    glow: 'group-hover:shadow-glow-purple',
  },
  cyan: {
    iconBg: 'bg-accent-cyan/10',
    iconText: 'text-accent-cyan',
    valueTxt: 'text-accent-cyan',
    glow: 'group-hover:shadow-glow-cyan',
  },
  green: {
    iconBg: 'bg-neon-green/10',
    iconText: 'text-neon-green',
    valueTxt: 'text-neon-green',
    glow: 'group-hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]',
  },
  amber: {
    iconBg: 'bg-neon-amber/10',
    iconText: 'text-neon-amber',
    valueTxt: 'text-neon-amber',
    glow: 'group-hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]',
  },
  rose: {
    iconBg: 'bg-neon-rose/10',
    iconText: 'text-neon-rose',
    valueTxt: 'text-neon-rose',
    glow: 'group-hover:shadow-glow-magenta',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, suffix, subtext, color }) => {
  const c = colorMap[color];

  return (
    <div className={`group glass p-6 transition-all duration-500 hover:border-slate-300 dark:hover:border-white/[0.15] ${c.glow} animate-fade-in`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.iconBg}`}>
          <Icon size={20} className={c.iconText} />
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-4xl font-black ${c.valueTxt}`}>{value}</span>
        {suffix && <span className="text-slate-500 dark:text-white/40 text-sm font-medium mb-1">{suffix}</span>}
      </div>
      {subtext && <p className="text-[11px] text-slate-400 dark:text-white/30 font-medium mt-3">{subtext}</p>}
    </div>
  );
};
