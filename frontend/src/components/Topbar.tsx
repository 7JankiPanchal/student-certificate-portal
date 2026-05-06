import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ title, onMenuClick, searchQuery, onSearchChange }) => {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return false; // Default: light mode
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="h-[72px] bg-white/60 dark:bg-dark-950/60 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between px-6 shrink-0 z-30 sticky top-0 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/[0.06] rounded-xl transition"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-900 dark:text-white hidden sm:block">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center glass-input gap-2 w-64">
          <Search size={16} className="text-slate-400 dark:text-white/30 shrink-0" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30"
          />
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/[0.06] rounded-xl transition"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/[0.06] rounded-xl transition">
          <Bell size={18} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-neon-rose rounded-full border-2 border-white dark:border-dark-950 animate-pulse" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 dark:bg-white/[0.06] mx-1 hidden sm:block" />

        {/* Profile Pill */}
        <div className="flex items-center gap-3 p-1.5 pr-4 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-2xl transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/[0.08]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-white font-black text-xs shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user?.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/30">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
