import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LayoutGrid, List, FileCheck, Sparkles, Trash2, Rocket, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DocumentCard } from '../components/DocumentCard';
import { PricingModal } from '../components/PricingModal';
import { Document, DocStatus } from '../types/types';
import api from '../services/api';

export const DocumentHub: React.FC = () => {
  const { user } = useAuth();
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | DocStatus>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pricingOpen, setPricingOpen] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        if (user?.role === 'teacher') {
          const res = await api.get('/documents/all');
          const mapped = res.data.all_documents.map((d: any) => ({
            id: d.document_id, name: d.document_id ? d.document_id.split('/').pop() : 'Unknown Document',
            status: d.status as DocStatus, uploadDate: d.uploadDate || new Date().toISOString(),
            points: parseInt(d.requested_points) || 0, size: parseInt(d.size) || 0, owner: d.student_id,
            url: d.presigned_url || d.document_id, hash: d.hash, signature: d.signature,
          }));
          setDocuments(mapped);
        } else {
          const res = await api.get('/documents');
          const mapped = res.data.documents.map((d: any) => ({
            id: d.document_id, name: d.document_id ? d.document_id.split('/').pop() : 'Unknown Document',
            status: d.status as DocStatus, uploadDate: d.uploadDate || new Date().toISOString(),
            points: parseInt(d.requested_points) || 0, size: parseInt(d.size) || 0,
            owner: user?.name || '', hash: d.hash, signature: d.signature,
            url: d.presigned_url || d.document_id,
          }));
          setDocuments(mapped);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchDocs();
  }, [user]);

  const filtered = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = doc.name.toLowerCase().includes((searchQuery || '').toLowerCase());
      const matchStatus = statusFilter === 'ALL' || doc.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [documents, searchQuery, statusFilter]);

  const filters = [
    { key: 'ALL', label: 'All' },
    { key: DocStatus.PENDING, label: 'Pending' },
    { key: DocStatus.APPROVED, label: 'Approved' },
    { key: DocStatus.REJECTED, label: 'Rejected' },
  ];

  const handleDelete = async (id: string, owner: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete('/documents', { data: { document_id: id, student_id: owner } });
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete document");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center glass p-1 gap-0.5">
          {filters.map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === f.key
                  ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20 dark:bg-accent-purple/20 dark:border-accent-purple/30'
                  : 'text-slate-500 hover:text-slate-900 dark:text-white/40 dark:hover:text-white/60'
              }`}>{f.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 glass p-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-slate-200 dark:bg-white/[0.1] text-accent-purple' : 'text-slate-400 dark:text-white/30'}`}><LayoutGrid size={16} /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-slate-200 dark:bg-white/[0.1] text-accent-purple' : 'text-slate-400 dark:text-white/30'}`}><List size={16} /></button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 glass animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center glass">
          <FileCheck size={48} className="text-slate-300 dark:text-white/10 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-white/40 font-bold">No documents found</p>
          <p className="text-slate-400 dark:text-white/20 text-sm mt-1">Try adjusting your filters or upload new documents</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(doc => <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />)}
        </div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest border-b border-slate-200/60 dark:border-white/[0.06]">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Student ID</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Points</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition group cursor-pointer" onClick={() => window.open(doc.url || doc.id, '_blank')}>
                  <td className="py-4 px-6"><div className="flex items-center gap-3"><FileCheck size={16} className="text-accent-purple/60" /><span className="text-sm font-semibold text-slate-800 dark:text-white/80">{doc.name}</span></div></td>
                  <td className="py-4 px-6 text-xs text-slate-500 dark:text-white/40 font-mono">{doc.owner}</td>
                  <td className="py-4 px-6 text-xs text-slate-500 dark:text-white/30">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-xs font-bold text-accent-purple">+{doc.points}</td>
                  <td className="py-4 px-6 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase ${
                      doc.status === DocStatus.APPROVED ? 'status-approved' :
                      doc.status === DocStatus.PENDING ? 'status-pending' : 'status-rejected'
                    }`}>{doc.status === DocStatus.APPROVED ? 'Approved' : doc.status === DocStatus.PENDING ? 'Pending' : 'Rejected'}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.owner); }} className="text-slate-400 dark:text-white/20 hover:text-red-400 p-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upgrade Banner — Gradient Style */}
      <div
        onClick={() => setPricingOpen(true)}
        className="relative overflow-hidden rounded-2xl cursor-pointer group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-6 p-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Rocket size={26} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] bg-white/10 px-2.5 py-1 rounded-full border border-white/20">Pro Feature</span>
              </div>
              <h3 className="text-xl font-black text-white">Upgrade to CloudCert Premium</h3>
              <p className="text-white/60 text-sm mt-0.5">Unlock 100GB storage, batch validation &amp; dedicated support</p>
            </div>
          </div>
          <button className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-50 transition group-hover:shadow-[0_8px_24px_rgba(255,255,255,0.25)] group-hover:scale-105 duration-300">
            See Plans <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
};
