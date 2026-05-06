import React, { useState } from 'react';
import { Upload, FileCheck, Clock, CheckCircle2, AlertCircle, Loader2, Gem, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PricingModal } from '../components/PricingModal';
import { Document, DocStatus } from '../types/types';
import api from '../services/api';

export const CertificateUpload: React.FC = () => {
  const { user } = useAuth();
  const [pricingOpen, setPricingOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', points: 25 });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [recentUploads, setRecentUploads] = useState<Document[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !file) return;
    setIsUploading(true);
    setUploadSuccess(false);
    try {
      const data = new FormData();
      data.append('certificate', file);
      data.append('requested_points', formData.points.toString());
      const response = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newDoc: Document = {
        id: response.data.document_id, name: formData.name + '.pdf',
        status: DocStatus.PENDING, uploadDate: response.data.uploadDate,
        points: parseInt(response.data.requested_points), size: file.size,
        owner: user?.name || '',
      };
      setRecentUploads(prev => [newDoc, ...prev]);
      setFormData({ name: '', points: 25 });
      setFile(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Form */}
      <div className="glass-strong p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload New Certificate</h3>
          <p className="text-sm text-slate-500 dark:text-white/30 mt-1">Submit documents for verification and earn academic credits</p>
        </div>

        {uploadSuccess && (
          <div className="mb-6 p-4 bg-neon-green/10 border border-neon-green/20 text-neon-green text-sm font-medium rounded-xl flex items-center gap-2 animate-scale-in">
            <CheckCircle2 size={16} />
            Certificate uploaded successfully! Awaiting teacher review.
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em]">Document Title</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. AWS Solutions Architect" className="glass-input w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em]">Requested Points</label>
              <input type="number" min="1" max="100" value={formData.points} onChange={e => setFormData({...formData, points: parseInt(e.target.value) || 0})}
                className="glass-input w-full" />
            </div>
          </div>

          {/* Drop Zone */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em]">Attach Proof</label>
            <div
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              className={`relative group border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
                dragActive ? 'border-accent-purple bg-accent-purple/5' : 'border-slate-300 bg-slate-100 hover:border-accent-purple/30 dark:border-white/[0.1] dark:bg-white/[0.02] dark:hover:border-accent-purple/30'
              }`}
            >
              <Upload size={40} className={`mb-4 transition ${dragActive ? 'text-accent-purple scale-110' : 'text-slate-400 group-hover:text-accent-purple/50 dark:text-white/20 dark:group-hover:text-accent-purple/50'}`} />
              <p className="text-sm font-semibold text-slate-500 dark:text-white/50">{file ? file.name : 'Drag & drop or click to select'}</p>
              <p className="text-[11px] text-slate-400 dark:text-white/20 mt-2">PDF / JPG • Up to 25MB</p>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <button type="submit" disabled={isUploading || !formData.name || !file}
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {isUploading ? <><Loader2 className="animate-spin" size={20} /> Validating Metadata...</> : 'Submit for Review'}
          </button>
        </form>
      </div>

      {/* Recent Uploads Timeline */}
      {recentUploads.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Recently Uploaded</h3>
          <div className="space-y-3">
            {recentUploads.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <FileCheck size={16} className="text-accent-purple" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{doc.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-white/25">{(doc.size / 1024 / 1024).toFixed(1)} MB • +{doc.points} pts</p>
                  </div>
                </div>
                <span className="status-pending text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase">
                  <Clock size={10} className="inline mr-1" />Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Upgrade Banner — Rose Floating Card */}
      <div
        onClick={() => setPricingOpen(true)}
        className="relative overflow-hidden rounded-2xl cursor-pointer group flex items-center gap-5 p-5 border border-rose-200 dark:border-rose-500/20 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-500/5 dark:to-pink-500/5 hover:border-rose-300 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(244,63,94,0.15)]"
      >
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-rose-300/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Gem size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-[0.2em] mb-0.5">✨ Storage Full? Upgrade!</p>
          <p className="text-sm font-bold text-slate-800 dark:text-white">Need more space? Get 15GB, 50GB or 100GB plans</p>
        </div>
        <div className="shrink-0 flex items-center gap-1 text-rose-500 dark:text-rose-400 font-bold text-sm group-hover:gap-2 transition-all">
          Plans <ArrowRight size={14} />
        </div>
      </div>

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
};
