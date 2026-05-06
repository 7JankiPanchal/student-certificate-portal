import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, X, Zap, ShieldCheck, ExternalLink, AlertTriangle, TrendingUp, Send, ArrowUpRight, FileStack, FileCheck, Star, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { PricingModal } from '../components/PricingModal';
import { Document, DocStatus } from '../types/types';
import api from '../services/api';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isReviewPanel = location.pathname.includes('/review');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pricingOpen, setPricingOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [docType, setDocType] = useState('Result');
  const [docId, setDocId] = useState('');
  const [semester, setSemester] = useState('1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pendingRes, allRes] = await Promise.all([
          api.get('/documents/pending').catch(() => ({ data: { pending_documents: [] } })),
          api.get('/documents/all').catch(() => ({ data: { all_documents: [] } }))
        ]);

        const pendingDocs = pendingRes.data?.pending_documents || [];
        const mappedPending = pendingDocs.map((d: any) => ({
          id: d.document_id || `temp-${Math.random()}`,
          name: d.document_id ? d.document_id.split('/').pop() : 'Unknown Document',
          status: DocStatus.PENDING,
          uploadDate: d.uploadDate || new Date().toISOString(),
          points: parseInt(d.requested_points) || 0,
          size: parseInt(d.size) || 0,
          owner: d.student_id || 'Unknown',
          ownerName: d.student_name,
          url: d.presigned_url || d.document_id,
        }));
        setDocuments(mappedPending);

        const allDocsData = allRes.data?.all_documents || [];
        const mappedAll = allDocsData.map((d: any) => ({
          id: d.document_id || `temp-${Math.random()}`,
          name: d.document_id ? d.document_id.split('/').pop() : 'Unknown Document',
          status: d.status as DocStatus || DocStatus.PENDING,
          uploadDate: d.uploadDate || new Date().toISOString(),
          points: parseInt(d.requested_points) || 0,
          size: parseInt(d.size) || 0,
          owner: d.student_id || user?.name || 'Unknown',
          ownerName: d.student_name,
          url: d.presigned_url || d.document_id,
          hash: d.hash,
          signature: d.signature
        })).sort((a: Document, b: Document) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        setAllDocs(mappedAll);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const handleDownload = async () => {
    if (!docId) return alert("Please enter Student ID");
    try {
      // In a real app, this would be an API call returning a Blob or a file URL
      // For now, we simulate a delay and trigger a dummy download
      alert(`Simulating download for ${docType} (Semester ${semester}) for student ${docId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch document');
    }
  };

  const handleAction = async (id: string, action: 'ACCEPT' | 'REJECT', reason?: string) => {
    setActionLoading(id);
    try {
      const doc = documents.find(d => d.id === id);
      await api.post('/documents/review', { student_id: doc?.owner, document_id: id, action, message: reason });
      setDocuments(prev => prev.filter(d => d.id !== id));
      setRejectionId(null); setRejectionReason('');
    } catch (err) { console.error(err); } finally { setActionLoading(null); }
  };

  const storageUsedBytes = allDocs.reduce((acc, doc) => acc + (doc.size || 0), 0);
  const storageUsedGB = parseFloat((storageUsedBytes / (1024 * 1024 * 1024)).toFixed(3));
  const maxStorageGB = 5;
  const storagePercentage = Math.min((storageUsedGB / maxStorageGB) * 100, 100);

  const processedToday = allDocs.filter(d => {
    const today = new Date().toDateString();
    return d.status === DocStatus.APPROVED && new Date(d.uploadDate).toDateString() === today;
  }).length;

  return (
    <div className="space-y-8">
      <div className="glass-strong p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-200/40 dark:bg-accent-cyan/10 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/4" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-500 dark:text-white/40 text-sm font-medium mb-1">Faculty Portal</p>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Hello, {user?.name || 'Teacher'} 📋</h1>
            <p className="text-slate-500 dark:text-white/30 mt-1">{isReviewPanel ? 'Review pending student submissions below.' : 'Manage documents and monitor system storage.'}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-neon-amber/10 border border-neon-amber/20 rounded-xl">
            <AlertTriangle size={16} className="text-neon-amber" />
            <span className="text-sm font-bold text-neon-amber">{documents.length} pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Clock} label="Pending Review" value={documents.length} color="amber" subtext="Awaiting your action" />
        <StatCard icon={ShieldCheck} label="Processed Today" value={processedToday} color="green" subtext="Verified certificates" />
      </div>

      {isReviewPanel ? (
        <div className="glass overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-slate-200/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-accent-purple" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Validation Queue</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-white/30 mt-1">Verify student claims and assign academic weight</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-white/[0.02] rounded-xl animate-pulse" />)}</div>
            ) : documents.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-white/[0.03] text-slate-300 dark:text-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={36} /></div>
                <p className="text-slate-500 dark:text-white/40 font-bold text-lg">Queue is Clear</p>
                <p className="text-slate-400 dark:text-white/20 text-sm mt-1">All submissions have been reviewed.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {documents.map((doc) => (
                  <React.Fragment key={doc.id}>
                    <div 
                      onClick={() => window.open(doc.url || doc.id, '_blank')}
                      className="px-6 py-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-purple to-accent-magenta flex items-center justify-center text-white text-xs font-black shadow-lg shrink-0">
                            {doc.ownerName ? doc.ownerName.slice(0, 2).toUpperCase() : doc.owner.slice(-2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-white/25 mt-0.5">
                              From: <span className="text-slate-500 dark:text-white/60 font-semibold">{doc.ownerName || 'Unknown Student'}</span> <span className="font-mono text-[9px] opacity-70">({doc.owner})</span>
                              {' • '}{new Date(doc.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-green-600 dark:text-neon-green">+{doc.points} pts</span>
                          <a href={doc.url || doc.id} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 rounded-lg text-slate-400 dark:text-white/20 hover:text-accent-cyan dark:hover:text-accent-cyan hover:bg-accent-cyan/10 transition"><ExternalLink size={16} /></a>
                          <button onClick={(e) => { e.stopPropagation(); handleAction(doc.id, 'ACCEPT'); }} disabled={actionLoading === doc.id} className="btn-success text-xs flex items-center gap-1.5 disabled:opacity-50"><CheckCircle2 size={14} />Accept</button>
                          <button onClick={(e) => { e.stopPropagation(); setRejectionId(rejectionId === doc.id ? null : doc.id); }} className="btn-danger text-xs flex items-center gap-1.5"><X size={14} />Reject</button>
                        </div>
                      </div>
                    </div>
                    {rejectionId === doc.id && (
                      <div className="px-6 py-5 bg-rose-50/50 dark:bg-neon-rose/[0.03] border-t border-rose-100 dark:border-neon-rose/10 animate-scale-in">
                        <div className="max-w-xl mx-auto space-y-3">
                          <label className="text-[11px] font-bold text-rose-600 dark:text-neon-rose/80 uppercase tracking-wider">Reason for Rejection</label>
                          <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full p-4 bg-white dark:bg-white/[0.03] border border-rose-200 dark:border-neon-rose/20 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-neon-rose/20 focus:outline-none transition" placeholder="Describe why this submission doesn't meet standards..." rows={3} />
                          <div className="flex justify-end gap-3">
                            <button onClick={() => { setRejectionId(null); setRejectionReason(''); }} className="btn-ghost text-xs">Cancel</button>
                            <button onClick={() => handleAction(doc.id, 'REJECT', rejectionReason)} disabled={!rejectionReason || actionLoading === doc.id} className="btn-danger text-xs flex items-center gap-1.5 disabled:opacity-50"><Send size={12} />Submit Rejection</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-6 neon-border relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Zap size={120} /></div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Request Official Documents</h3>
                <p className="text-sm text-slate-500 dark:text-white/40 mb-6">Download results, hall tickets, or fee receipts on behalf of students.</p>

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
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
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
                  <p className="text-sm text-slate-500 dark:text-white/30 mt-0.5">Latest submissions across students</p>
                </div>
                <button onClick={() => navigate('/documents')} className="btn-ghost text-xs flex items-center gap-1">
                  View All <ArrowUpRight size={14} />
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-white/[0.03] rounded-xl animate-pulse" />)}
                </div>
              ) : allDocs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.02] flex items-center justify-center mx-auto mb-3">
                    <FileStack className="text-slate-400 dark:text-white/20" size={20} />
                  </div>
                  <p className="text-slate-500 dark:text-white/40 font-medium text-sm">No recent uploads</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allDocs.slice(0, 4).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple shrink-0"><FileCheck size={16} /></div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{doc.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-white/25">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                        doc.status === DocStatus.APPROVED ? 'status-approved' : doc.status === DocStatus.PENDING ? 'status-pending' : 'status-rejected'
                      }`}>
                        {doc.status === DocStatus.APPROVED ? 'Approved' : doc.status === DocStatus.PENDING ? 'Pending' : 'Rejected'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Faculty Storage */}
          <div className="space-y-6">
            <div className="glass p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={18} className="text-accent-cyan" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Faculty Storage</h3>
              </div>
              <div className="flex items-center justify-center py-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="68" stroke="currentColor" className="text-slate-200 dark:text-white/[0.04]" strokeWidth="10" fill="transparent" />
                    <circle
                      cx="80" cy="80" r="68"
                      stroke="url(#teacherStorageGrad)"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={427}
                      strokeDashoffset={427 - (427 * (storagePercentage / 100))}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="teacherStorageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{storageUsedGB}<span className="text-sm">GB</span></span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider">of {maxStorageGB}GB</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-[11px] text-slate-400 dark:text-white/25 mt-2">
                {storagePercentage.toFixed(1)}% space utilized across all student files
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Upgrade Banner — Sleek Notification Bar */}
      <div
        onClick={() => setPricingOpen(true)}
        className="relative overflow-hidden rounded-2xl cursor-pointer group flex items-center justify-between gap-4 p-5 border border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-500/5 dark:to-cyan-500/5 hover:border-emerald-300 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(16,185,129,0.15)]"
      >
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2310b981' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-6 transition-transform duration-300">
            <Star size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Faculty Exclusive</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              Upgrade your faculty portal — manage unlimited student submissions
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg group-hover:shadow-emerald-500/30 group-hover:scale-105 transition-all duration-300">
          <Sparkles size={13} />
          Upgrade
        </div>
      </div>

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
};
