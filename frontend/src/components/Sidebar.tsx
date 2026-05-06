import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileStack, 
  Upload, 
  ShieldCheck, 
  ClipboardCheck, 
  LogOut, 
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, pendingCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/documents', label: 'Document Hub', icon: FileStack },
    { to: '/upload', label: 'Upload Certificate', icon: Upload },
  ];

  const teacherLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/review', label: 'Review Panel', icon: ClipboardCheck, badge: pendingCount },
    { to: '/documents', label: 'Document Hub', icon: FileStack },
    { to: '/verify', label: 'Verify Certificate', icon: ShieldCheck },
  ];

  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 h-full flex flex-col
        bg-white/80 dark:bg-dark-950/80 backdrop-blur-2xl
        border-r border-slate-200/60 dark:border-white/[0.06]
        transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,0.4)] dark:from-accent-purple dark:to-accent-cyan dark:shadow-glow-purple">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 dark:text-white tracking-tight text-lg leading-none transition-colors duration-300">CloudCert</h1>
              <p className="text-[9px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.25em] mt-1 transition-colors duration-300">Academic Vault</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-900 dark:text-white/40 dark:hover:text-white rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/[0.06] transition">
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                ${isActive
                  ? 'bg-indigo-50 dark:bg-gradient-to-r dark:from-accent-purple/20 dark:to-accent-cyan/10 text-indigo-700 dark:text-white border border-indigo-200 dark:border-accent-purple/20 shadow-[0_2px_8px_rgba(99,102,241,0.15)] dark:shadow-glow-purple'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/[0.04]'
                }
              `}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
              {'badge' in link && link.badge ? (
                <span className="ml-auto text-[10px] font-black bg-amber-100 text-amber-600 border-amber-200 dark:bg-neon-amber/20 dark:text-neon-amber px-2 py-0.5 rounded-full border dark:border-neon-amber/30">
                  {String((link as any).badge)}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200/60 dark:border-white/[0.06]">
          <div className="glass-strong p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-magenta flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-white/40 dark:hover:text-neon-rose dark:hover:bg-neon-rose/5 rounded-xl transition-all duration-300 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
