import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Clock, CheckCircle2, AlertCircle, ShieldCheck, Zap, Trash2, Download } from 'lucide-react';
import { Document, DocStatus } from '../types/types';

interface DocumentCardProps {
  document: Document;
  onClick?: () => void;
  onDelete?: (id: string, owner: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick, onDelete }) => {
  const navigate = useNavigate();
  const statusConfig = {
    [DocStatus.APPROVED]: {
      icon: CheckCircle2,
      class: 'status-approved',
      label: 'Approved',
    },
    [DocStatus.PENDING]: {
      icon: Clock,
      class: 'status-pending',
      label: 'Pending',
    },
    [DocStatus.REJECTED]: {
      icon: AlertCircle,
      class: 'status-rejected',
      label: 'Rejected',
    },
  };

  const status = statusConfig[document.status] || statusConfig[DocStatus.PENDING];
  const StatusIcon = status.icon;

  return (
    <div
      onClick={(e) => {
        if (onClick) onClick(e);
        else window.open(document.url || document.id, '_blank');
      }}
      className="group glass p-5 cursor-pointer transition-all duration-300 hover:shadow-[0_8px_32px_rgba(99,102,241,0.12)] hover:border-indigo-200 hover:-translate-y-1 animate-scale-in dark:hover:border-white/[0.15] dark:hover:shadow-glass"
    >
      {/* Top row */}
      <div className="flex justify-between items-start mb-5">
        <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors dark:bg-accent-purple/10 dark:text-accent-purple dark:group-hover:bg-accent-purple/20">
          <FileCheck size={24} />
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-wider">
            {document.points ? `+${document.points} pts` : ''}
          </span>
          {document.status === DocStatus.APPROVED && document.hash && document.signature && (
            <div className="flex items-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/verify`);
                }}
                className="text-slate-400 hover:text-indigo-600 dark:text-white/20 dark:hover:text-accent-blue transition-colors p-1"
                title="Verify Certificate Instantly"
              >
                <ShieldCheck size={16} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(document.url || document.id, '_blank');
                }}
                className="text-slate-400 hover:text-violet-600 dark:text-white/20 dark:hover:text-accent-cyan transition-colors p-1"
                title="Download Certificate"
              >
                <Download size={16} />
              </button>
            </div>
          )}
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(document.id, document.owner); }}
              className="text-slate-300 hover:text-rose-500 dark:text-white/20 dark:hover:text-red-400 transition-colors p-1"
              title="Delete Document"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Name */}
      <h4 className="font-bold text-slate-900 dark:text-white truncate mb-1">{document.name}</h4>
      <p className="text-[11px] text-slate-500 dark:text-white/30 font-medium mb-4">
        {document.owner && <span className="inline-block bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-white/60 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider mr-2">ID: {document.owner}</span>}
        {new Date(document.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        {document.size > 0 ? ` • ${(document.size / 1024 / 1024).toFixed(1)} MB` : ''}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.06]">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${status.class}`}>
          <StatusIcon size={12} />
          <span>{status.label}</span>
        </div>

        {document.status === DocStatus.APPROVED && document.hash && (
          <div className="group/hash relative">
            <div className="flex items-center text-indigo-500 dark:text-accent-cyan cursor-help">
              <ShieldCheck size={16} />
              <span className="ml-1 text-[10px] font-bold uppercase tracking-tight">Verified</span>
            </div>
            <div className="opacity-0 group-hover/hash:opacity-100 absolute bottom-full right-0 mb-3 w-64 p-4 bg-white dark:bg-dark-700 border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 pointer-events-none z-50">
              <div className="flex items-center mb-2 text-indigo-600 dark:text-accent-purple">
                <Zap size={12} className="mr-1.5" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Digital Fingerprint</span>
              </div>
              <p className="break-all font-mono text-[10px] leading-relaxed text-slate-500 dark:text-white/50">
                SHA256: {document.hash.slice(0, 32)}...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
