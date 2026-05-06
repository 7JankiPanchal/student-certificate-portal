import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Upload, CheckCircle2, XCircle, Loader2, FileSearch, Fingerprint, Zap, ArrowRight } from 'lucide-react';
import { PricingModal } from '../components/PricingModal';
import api from '../services/api';

export const VerifyCertificate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState(searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; hashMatch: boolean; signatureMatch: boolean; documentInfo?: { name: string; uploadDate: string } } | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !studentEmail) return;
    setLoading(true); setResult(null); setError('');
    try {
      const data = new FormData();
      data.append('certificate', file);
      data.append('student_email', studentEmail);
      const res = await api.post('/verify', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); setDragActive(e.type !== 'dragleave'); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center mx-auto mb-4 shadow-glow-cyan animate-float">
          <Fingerprint size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Verify Certificate</h1>
        <p className="text-slate-500 dark:text-white/30 mt-2">Upload a certificate to verify its cryptographic integrity</p>
      </div>

      {/* Verify Form */}
      <div className="glass-strong p-8">
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em]">Student Email</label>
            <input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required className="glass-input w-full" placeholder="student@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em]">Certificate File</label>
            <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragActive ? 'border-accent-cyan bg-accent-cyan/5' : 'border-slate-300 bg-slate-100 hover:border-accent-cyan/30 dark:border-white/[0.1] dark:bg-white/[0.02] dark:hover:border-accent-cyan/30'}`}>
              <Upload size={32} className={`mx-auto mb-3 ${dragActive ? 'text-accent-cyan' : 'text-slate-400 dark:text-white/15'}`} />
              <p className="text-sm text-slate-500 dark:text-white/40 font-medium">{file ? file.name : 'Drop certificate file here'}</p>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <button type="submit" disabled={loading || !file || !studentEmail}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="animate-spin" size={20} /> Verifying...</> : <><FileSearch size={18} /> Verify Authenticity</>}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-neon-rose/10 border border-neon-rose/20 text-neon-rose text-sm font-medium rounded-xl animate-scale-in">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`glass-strong p-8 animate-slide-up ${result.valid ? 'border-neon-green/20' : 'border-neon-rose/20'}`}>
          <div className="text-center mb-6">
            {result.valid ? (
              <div className="w-20 h-20 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={40} className="text-neon-green" /></div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-neon-rose/10 flex items-center justify-center mx-auto mb-4"><XCircle size={40} className="text-neon-rose" /></div>
            )}
            <h2 className={`text-2xl font-black ${result.valid ? 'text-neon-green' : 'text-neon-rose'}`}>
              {result.valid ? 'Certificate is Authentic' : 'Verification Failed'}
            </h2>
            <p className="text-slate-500 dark:text-white/30 text-sm mt-1">{result.valid ? 'This document has not been tampered with' : 'The document may have been modified'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl text-center ${result.hashMatch ? 'bg-neon-green/5 border border-neon-green/20' : 'bg-neon-rose/5 border border-neon-rose/20'}`}>
              <ShieldCheck size={24} className={`mx-auto mb-2 ${result.hashMatch ? 'text-neon-green' : 'text-neon-rose'}`} />
              <p className="text-xs font-bold text-slate-500 dark:text-white/60">Hash Check</p>
              <p className={`text-sm font-black ${result.hashMatch ? 'text-neon-green' : 'text-neon-rose'}`}>{result.hashMatch ? 'MATCH' : 'MISMATCH'}</p>
            </div>
            <div className={`p-4 rounded-xl text-center ${result.signatureMatch ? 'bg-neon-green/5 border border-neon-green/20' : 'bg-neon-rose/5 border border-neon-rose/20'}`}>
              <Fingerprint size={24} className={`mx-auto mb-2 ${result.signatureMatch ? 'text-neon-green' : 'text-neon-rose'}`} />
              <p className="text-xs font-bold text-slate-500 dark:text-white/60">Signature Check</p>
              <p className={`text-sm font-black ${result.signatureMatch ? 'text-neon-green' : 'text-neon-rose'}`}>{result.signatureMatch ? 'VALID' : 'INVALID'}</p>
            </div>
          </div>
        </div>
      )}
      {/* Upgrade Banner — Glass Sky Blue Style */}
      <div
        onClick={() => setPricingOpen(true)}
        className="relative overflow-hidden rounded-2xl cursor-pointer group border border-sky-200 dark:border-sky-500/20 backdrop-blur-xl bg-gradient-to-r from-sky-50/80 to-blue-50/80 dark:from-sky-500/5 dark:to-blue-500/5 hover:border-sky-300 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(14,165,233,0.2)] p-5"
      >
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h4v4H0V0zm8 0h4v4H8V0zm8 0h4v4h-4V0zm8 0h4v4h-4V0zM0 8h4v4H0V8zm8 0h4v4H8V8zm8 0h4v4h-4V8zm8 0h4v4h-4V8z' fill='%230ea5e9' fill-rule='evenodd'/%3E%3C/svg%3E\")" }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-sky-500/40 group-hover:scale-110 transition-all duration-300">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-[0.2em]">Verify More · Store More</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Upgrade for unlimited verifications &amp; storage</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md group-hover:bg-sky-700 group-hover:shadow-sky-500/30 transition-all group-hover:gap-3 duration-300">
            View Plans <ArrowRight size={13} />
          </div>
        </div>
      </div>

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
};
