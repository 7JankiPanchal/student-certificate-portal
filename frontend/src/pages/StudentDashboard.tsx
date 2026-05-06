import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, FileStack, Clock, ShieldCheck, Upload, FileCheck, 
  ArrowUpRight, TrendingUp, Zap, Eye, Download, Crown, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { PricingModal } from '../components/PricingModal';
import { Document, DocStatus } from '../types/types';
import api from '../services/api';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pricingOpen, setPricingOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Download section state
  const [docType, setDocType] = useState('Result');
  const [docId, setDocId] = useState('');
  const [semester, setSemester] = useState('1');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/documents');
        const mapped = res.data.documents.map((d: any) => ({
          id: d.document_id,
          name: d.document_id.split('/').pop() || 'Unknown Document',
          status: d.status as DocStatus,
          uploadDate: d.uploadDate || new Date().toISOString(),
          points: parseInt(d.requested_points) || 0,
          size: parseInt(d.size) || 0,
          owner: user?.name || '',
          url: d.presigned_url || d.document_id,
          hash: d.hash,
          signature: d.signature,
        }));
        setDocuments(mapped);
      } catch (err) {
        console.error('Failed to fetch documents', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [user]);

  const handleDownload = async () => {
    if (!docId) return alert("Please enter Student ID");
    try {
      // In a real app, this would be an API call returning a Blob or a file URL
      // For now, we simulate a delay and trigger a dummy download
      alert(`Simulating download for ${docType} (Semester ${semester}) for ${docId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch document');
    }
  };

  const approvedCount = documents.filter(d => d.status === DocStatus.APPROVED).length;
  const pendingCount = documents.filter(d => d.status === DocStatus.PENDING).length;
  
  // Storage calculation (convert bytes to GB)
  const totalBytes = documents.reduce((acc, doc) => acc + (doc.size || 0), 0);
  const storageUsed = parseFloat((totalBytes / (1024 * 1024 * 1024)).toFixed(3)); // use 3 decimals for precision if files are small
  const storageTotal = 5; // GB

  const quickActions = [
    { label: 'Upload Certificate', icon: Upload, path: '/upload', color: 'from-accent-purple to-accent-blue' },
    { label: 'View Documents', icon: FileStack, path: '/documents', color: 'from-accent-cyan to-accent-blue' },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <div className="glass-strong p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-200/40 dark:bg-accent-purple/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-sky-200/40 dark:bg-accent-cyan/10 rounded-full blur-[60px] translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-slate-500 dark:text-white/40 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
            {user?.name || 'Student'} <span className="inline-block animate-float">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-white/30 max-w-lg">
            Manage your academic files, check storage limits, and download official university documents.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Trophy} label="Total Points" value={user?.points || 0} suffix="pts" color="purple" subtext="Academic credits" />
        <StatCard icon={Clock} label="Pending" value={pendingCount} suffix="items" color="amber" subtext="Awaiting review" />
        <StatCard icon={ShieldCheck} label="Verified" value={approvedCount} suffix="docs" color="green" subtext="Cryptographically signed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Download section + Recent Documents */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Download Official Documents Panel */}
          <div className="glass p-6 neon-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Zap size={120} /></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Request Official Documents</h3>
              <p className="text-sm text-slate-500 dark:text-white/40 mb-6">Download your results, hall tickets, or fee receipts securely.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Document Type</label>
                  <select 
                    value={docType} onChange={e => setDocType(e.target.value)}
                    className="glass-input w-full py-2.5 text-sm appearance-none"
                  >
                    <option value="Result">Exam Result</option>
                    <option value="HallTicket">Hall Ticket</option>
                    <option value="FeeReceipt">Fee Receipt</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Student ID / PRN</label>
                  <input 
                    type="text" value={docId} onChange={e => setDocId(e.target.value)}
                    placeholder="e.g. 2023CS001" className="glass-input w-full py-2.5 text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Semester / Term</label>
                  <select 
                    value={semester} onChange={e => setSemester(e.target.value)}
                    className="glass-input w-full py-2.5 text-sm appearance-none"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              
              <button onClick={handleDownload} className="btn-primary w-full sm:w-auto text-sm py-2.5 px-6 flex items-center justify-center gap-2">
                <ArrowUpRight size={16} /> Fetch Document
              </button>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Uploads</h3>
                <p className="text-sm text-slate-500 dark:text-white/30 mt-0.5">Your latest certificates</p>
              </div>
              <button onClick={() => navigate('/documents')} className="btn-ghost text-xs flex items-center gap-1">
                View All <ArrowUpRight size={14} />
              </button>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-white/[0.03] rounded-xl animate-pulse" />)}
              </div>
            ) : documents.length === 0 ? (
              <div className="py-8 text-center">
                <FileCheck size={32} className="text-slate-300 dark:text-white/10 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-white/30 font-medium text-sm">No documents yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.slice(0, 4).map((doc, i) => (
                  <div 
                    key={doc.id} 
                    onClick={() => window.open(doc.url || doc.id, '_blank')}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple shrink-0"><FileCheck size={16} /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{doc.name}</p>
                        <p className="text-[11px] text-slate-400 dark:text-white/25">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                        doc.status === DocStatus.APPROVED ? 'status-approved' : doc.status === DocStatus.PENDING ? 'status-pending' : 'status-rejected'
                      }`}>
                        {doc.status === DocStatus.APPROVED ? 'Approved' : doc.status === DocStatus.PENDING ? 'Pending' : 'Rejected'}
                      </div>
                      {doc.status === DocStatus.APPROVED && doc.hash && doc.signature && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/verify?email=${encodeURIComponent(user?.email || '')}`);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-accent-blue/10 hover:text-accent-blue transition-colors"
                            title="Verify Certificate Instantly"
                          >
                            <ShieldCheck size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(doc.url || doc.id, '_blank');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-accent-cyan/10 hover:text-accent-cyan transition-colors"
                            title="Download Certificate"
                          >
                            <Download size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Storage Meter + Quick Actions */}
        <div className="space-y-6">
          {/* Storage Progress Ring */}
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={18} className="text-accent-cyan" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Cloud Storage</h3>
            </div>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="68" stroke="currentColor" className="text-slate-200 dark:text-white/[0.04]" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="80" cy="80" r="68"
                    stroke="url(#storageGrad)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={427}
                    strokeDashoffset={427 - (427 * (storageUsed / storageTotal))}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="storageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{storageUsed}<span className="text-sm">GB</span></span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider">of {storageTotal}GB</span>
                </div>
              </div>
            </div>
            <p className="text-center text-[11px] text-slate-400 dark:text-white/25 mt-2">
              {((storageUsed / storageTotal) * 100).toFixed(1)}% space utilized
            </p>
          </div>

          {/* Quick Actions */}
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-neon-amber" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button key={action.label} onClick={() => navigate(action.path)} className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all group text-left">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}>
                    <action.icon size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white transition">{action.label}</span>
                  <ArrowUpRight size={14} className="ml-auto text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/50 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Upgrade Card — Glowing Amber Style */}
          <div
            onClick={() => setPricingOpen(true)}
            className="relative overflow-hidden rounded-2xl cursor-pointer group p-6 border-2 border-amber-200 dark:border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5 hover:border-amber-300 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(245,158,11,0.2)]"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Crown size={18} className="text-white" />
              </div>
              <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">⚡ Limited Offer</span>
              <h4 className="font-black text-slate-900 dark:text-white text-sm mt-1">Go Premium</h4>
              <p className="text-[11px] text-slate-500 dark:text-white/40 mt-1 mb-4">From ₹99/mo · 15GB to 100GB plans</p>
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs group-hover:gap-3 transition-all duration-300">
                <Sparkles size={12} />
                View Plans
                <ArrowUpRight size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
};
