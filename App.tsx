import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Cloud, 
  FileCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Bell, 
  ChevronRight,
  ChevronDown,
  User,
  ShieldCheck,
  Zap,
  Filter,
  Trash2,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Crown,
  Check
} from 'lucide-react';
import { User as UserType, Document, Role, DocStatus, DocType } from './types';
import { MOCK_STUDENT, MOCK_TEACHER, INITIAL_DOCUMENTS } from './mockData';

// --- Sub-components ---

interface SidebarItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string | number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon size={18} className={active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {badge && (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
        {badge}
      </span>
    )}
  </button>
);

const Card = ({ children, title, subtitle, className = "", noPadding = false }: { children?: React.ReactNode, title?: string, subtitle?: string, className?: string, noPadding?: boolean }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {(title || subtitle) && (
      <div className="px-6 py-5 border-b border-slate-50">
        {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    )}
    <div className={noPadding ? "" : "p-6"}>
      {children}
    </div>
  </div>
);

// --- Modals ---

const PersonalUploadModal = ({ isOpen, onClose, onUpload }: { isOpen: boolean, onClose: () => void, onUpload: (doc: Partial<Document>) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
       setFile(e.dataTransfer.files[0]);
       setFileName(e.dataTransfer.files[0].name.split('.')[0]); 
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!fileName) return;
    setUploading(true);
    setTimeout(() => {
        onUpload({
            name: fileName + (file ? '.' + file.name.split('.').pop() : '.pdf'),
            size: file ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : '1.2 MB',
            type: DocType.PERSONAL,
            status: DocStatus.APPROVED, // Personal files are auto-approved/stored
            points: 0
        });
        setUploading(false);
        onClose();
        setFileName('');
        setFile(null);
    }, 1500);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black text-slate-800">Upload Personal File</h3>
                 <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition"><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">File Name</label>
                    <input type="text" value={fileName} onChange={e=>setFileName(e.target.value)} placeholder="e.g. Project Backup" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition font-medium text-slate-800" />
                  </div>
                  <div 
                    onDragOver={e => {e.preventDefault(); setIsDragging(true)}} 
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'}`}
                  >
                     <Cloud size={40} className={isDragging ? "text-indigo-500" : "text-slate-300"} />
                     <p className="mt-4 text-sm font-bold text-slate-600">{file ? file.name : "Drag & Drop or Click"}</p>
                     <p className="text-xs text-slate-400 mt-2">Secure Personal Storage</p>
                     <input type="file" onChange={e => {
                        if(e.target.files?.[0]) {
                            setFile(e.target.files[0]);
                            setFileName(e.target.files[0].name.split('.')[0]);
                        }
                     }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <button disabled={uploading} type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50">
                     {uploading ? 'Uploading...' : 'Save to Cloud'}
                  </button>
              </form>
           </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
};

const PremiumModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');
  
  const plans = [
    { name: 'Basic', price: 'Free', storage: '5GB', features: ['Standard Support', 'Core Features'], icon: Zap, color: 'slate' },
    { name: 'Standard', price: '$9/mo', storage: '25GB', features: ['Priority Support', 'API Access', 'Batch Upload'], icon: Crown, color: 'indigo', recommended: true },
    { name: 'Premium', price: '$19/mo', storage: '100GB', features: ['Dedicated Support', 'Whitelabeling', 'Verified NFT Minting'], icon: ShieldCheck, color: 'amber' },
  ];

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => setStep('success'), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {step === 'selection' && (
              <div className="p-8 md:p-12">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Upgrade Your Academic Vault</h2>
                  <p className="text-slate-500">Scale your storage and verification capabilities with our professional plans.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div key={plan.name} className={`relative p-6 rounded-2xl border-2 transition-all ${plan.recommended ? 'border-indigo-600 shadow-xl shadow-indigo-100' : 'border-slate-100 hover:border-slate-200'}`}>
                      {plan.recommended && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">Recommended</span>}
                      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-${plan.color}-50 text-${plan.color}-600`}>
                        <plan.icon size={24} />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">{plan.name}</h4>
                      <p className="text-2xl font-black text-slate-900 mt-1">{plan.price}</p>
                      <p className="text-xs text-slate-400 font-medium mb-6">{plan.storage} Storage</p>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center text-xs text-slate-600 font-medium">
                            <Check size={14} className="text-emerald-500 mr-2 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <button 
                        onClick={handlePay}
                        className={`w-full py-3 rounded-xl text-sm font-bold transition ${plan.recommended ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {plan.price === 'Free' ? 'Current Plan' : 'Choose Plan'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="p-20 flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 mb-6">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="absolute inset-0 border-4 border-slate-100 border-t-indigo-600 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <CreditCard size={32} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Processing Payment</h3>
                <p className="text-slate-500">Securely connecting to the gateway...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="p-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <Check size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">Welcome to Pro!</h3>
                <p className="text-slate-500 mb-8">Your account has been upgraded. 50GB storage is now available.</p>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition"
                >
                  Continue to App
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main Pages ---

const StudentDashboard = ({ user, documents, onAction, onUploadPersonal }: { user: UserType, documents: Document[], onAction: (view: string) => void, onUploadPersonal: () => void }) => {
  const pointsPercentage = (user.pointsEarned / user.pointsTarget) * 100;
  const storagePercentage = (user.storageUsed / user.storageLimit) * 100;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Credits</p>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-black text-indigo-600">{user.pointsEarned}</span>
            <span className="text-slate-400 text-sm font-medium mb-1">pts</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold mt-4">+15 from last week</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Files Stored</p>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-black text-slate-800">{documents.length}</span>
            <span className="text-slate-400 text-sm font-medium mb-1">items</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-blue-500 w-2/3" />
          </div>
        </Card>
        <Card>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Approval</p>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-black text-amber-500">{documents.filter(d => d.status === DocStatus.PENDING).length}</span>
            <span className="text-slate-400 text-sm font-medium mb-1">items</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-4">Average wait: 24h</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Security Score</p>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-black text-emerald-500">98</span>
            <span className="text-slate-400 text-sm font-medium mb-1">%</span>
          </div>
          <p className="text-[10px] text-emerald-600 mt-4">Verified & Encrypted</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Recent Files" subtitle="Recently uploaded documents">
          <div className="space-y-2">
            {documents.slice(0, 4).map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition cursor-pointer group">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`p-2 rounded-lg ${
                    doc.type === DocType.CERTIFICATE ? 'bg-indigo-50 text-indigo-600' :
                    doc.type === DocType.FEE_RECEIPT ? 'bg-emerald-50 text-emerald-600' :
                    doc.type === DocType.RESULT ? 'bg-amber-50 text-amber-600' : 
                    doc.type === DocType.PERSONAL ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <FileCheck size={16} />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-slate-700 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400">{doc.uploadDate} • {doc.size}</p>
                  </div>
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  doc.status === DocStatus.APPROVED ? 'bg-emerald-50 text-emerald-600' :
                  doc.status === DocStatus.PENDING ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {doc.status}
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={onUploadPersonal}
            className="w-full mt-4 py-3 rounded-xl border border-indigo-100 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition flex items-center justify-center space-x-2"
          >
             <Cloud size={16} />
             <span>Add files to personal storage</span>
          </button>
        </Card>

        <Card title="Storage Gauge" subtitle="Cloud allocation usage" className="h-full">
          <div className="flex flex-col items-center justify-center py-6">
             <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                   <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                   <motion.circle 
                     cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                     strokeDasharray={440}
                     strokeDashoffset={440 - (440 * storagePercentage / 100)}
                     className="text-indigo-600" 
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-800">{storagePercentage.toFixed(0)}%</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Used</span>
                </div>
             </div>
             <p className="mt-6 text-sm font-medium text-slate-500">Using {user.storageUsed} GB of {user.storageLimit} GB total</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Upload Certificate', icon: FileCheck, color: 'indigo', view: 'Certificate Upload' },
          { label: 'Download Ticket', icon: Cloud, color: 'emerald', view: 'Document Hub' },
          { label: 'Cloud Drive', icon: LayoutDashboard, color: 'blue', view: 'Document Hub' },
          { label: 'Settings', icon: Settings, color: 'slate', view: 'Settings' }
        ].map((action, i) => (
          <button 
            key={i} 
            onClick={() => onAction(action.view)}
            className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group"
          >
            <div className={`p-4 rounded-2xl bg-${action.color}-50 text-${action.color}-600 mb-3 group-hover:scale-110 transition`}>
              <action.icon size={24} />
            </div>
            <span className="text-sm font-bold text-slate-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const DocumentHub = ({ documents, searchQuery, onOpenPremium, activeFilter }: { documents: Document[], searchQuery: string, onOpenPremium: () => void, activeFilter: string }) => {
  const [filter, setFilter] = useState<DocType | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Update internal filter when prop changes
  useEffect(() => {
    if (activeFilter) {
      setFilter(activeFilter as DocType | 'All');
    }
  }, [activeFilter]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'All' || doc.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [documents, searchQuery, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
          {['All', DocType.FEE_RECEIPT, DocType.HALL_TICKET, DocType.RESULT, DocType.CERTIFICATE, DocType.PERSONAL].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filter === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
            <LayoutDashboard size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
            <Menu size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDocs.map((doc) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                key={doc.id}
                className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${
                    doc.type === DocType.CERTIFICATE ? 'bg-indigo-50 text-indigo-600' :
                    doc.type === DocType.FEE_RECEIPT ? 'bg-emerald-50 text-emerald-600' :
                    doc.type === DocType.RESULT ? 'bg-amber-50 text-amber-600' : 
                    doc.type === DocType.PERSONAL ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <FileCheck size={28} />
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition">
                    <MoreVertical size={20} />
                  </button>
                </div>
                
                <h4 className="font-bold text-slate-800 truncate mb-1">{doc.name}</h4>
                <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">
                  <span>{doc.type}</span>
                  <span className="mx-2">•</span>
                  <span>{doc.size}</span>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    doc.status === DocStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' :
                    doc.status === DocStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {doc.status === DocStatus.APPROVED ? <CheckCircle2 size={12} /> : doc.status === DocStatus.PENDING ? <Clock size={12} /> : <AlertCircle size={12} />}
                    <span>{doc.status}</span>
                  </div>
                  
                  {doc.status === DocStatus.APPROVED && (
                    <div className="group/hash relative">
                      <div className="flex items-center text-indigo-500 cursor-help">
                        <ShieldCheck size={18} />
                        <span className="ml-1 text-[10px] font-black uppercase tracking-tighter">Verified</span>
                      </div>
                      <div className="opacity-0 group-hover/hash:opacity-100 absolute bottom-full right-0 mb-3 w-64 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl transition-all pointer-events-none z-50">
                        <div className="flex items-center mb-2 text-indigo-400">
                          <Zap size={14} className="mr-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Digital Fingerprint</span>
                        </div>
                        <p className="break-all font-mono text-[10px] leading-relaxed opacity-70">SHA256: {doc.hash || 'b5ac22f1...'} </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-50">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Size</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <FileCheck size={18} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-medium">{doc.type}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-medium">{doc.size}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-medium">{doc.uploadDate}</td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        doc.status === DocStatus.APPROVED ? 'text-emerald-600 bg-emerald-50' :
                        doc.status === DocStatus.PENDING ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50'
                      }`}>
                        {doc.status}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right opacity-0 group-hover:opacity-100 transition">
                      <button className="text-slate-400 hover:text-indigo-600"><ExternalLink size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div onClick={onOpenPremium} className="cursor-pointer group relative bg-slate-900 rounded-3xl p-8 overflow-hidden text-white shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition duration-700">
          <Crown size={180} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
            Pro Feature
          </div>
          <h3 className="text-3xl font-black mb-2">Upgrade to CloudCert Premium</h3>
          <p className="text-slate-400 max-w-md text-sm font-medium">Unlock 100GB storage, batch validation, and dedicated faculty support for your academic portfolio.</p>
          <div className="mt-8 flex items-center space-x-4">
             <button className="px-8 py-3 bg-white text-slate-900 font-black rounded-2xl hover:bg-indigo-50 transition active:scale-95 shadow-xl">
               Upgrade Now
             </button>
             <span className="text-xs text-slate-500 font-medium">Starting at $9/mo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CertificateManager = ({ documents, setDocuments }: { documents: Document[], setDocuments: React.Dispatch<React.SetStateAction<Document[]>> }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Category 1' });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setIsUploading(true);
    setTimeout(() => {
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name + '.pdf',
        type: DocType.CERTIFICATE,
        status: DocStatus.PENDING,
        uploadDate: new Date().toISOString().split('T')[0],
        points: 25,
        size: (Math.random() * 5).toFixed(1) + ' MB',
        owner: MOCK_STUDENT.name
      };
      setDocuments(prev => [newDoc, ...prev]);
      setIsUploading(false);
      setFormData({ name: '', type: 'Category 1' });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <Card title="Upload New Document" subtitle="Verify achievements to earn academic credits.">
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Document Title</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. AWS Solutions Architect"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition font-medium text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</label>
              <div className="relative">
                <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition appearance-none font-medium text-slate-800"
                >
                    <option value="Category 1">Category 1</option>
                    <option value="Category 2">Category 2</option>
                    <option value="Category 3">Category 3</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
             <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Attach Proof</label>
             <div className="relative group border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer">
                <Cloud size={48} className="text-slate-300 mb-4 group-hover:text-indigo-400 transition" />
                <p className="text-sm font-bold text-slate-600">Select files or drag here</p>
                <p className="text-xs text-slate-400 mt-2">Up to 25MB per file • PDF / JPG</p>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
             </div>
          </div>
          <button 
            type="submit"
            disabled={isUploading}
            className={`w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            {isUploading ? 'Validating Metadata...' : 'Submit for Review'}
          </button>
        </form>
      </Card>

      <Card title="Approval Timeline" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="py-5 px-8">Document</th>
                <th className="py-5 px-8">Points</th>
                <th className="py-5 px-8">Status</th>
                <th className="py-5 px-8">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td className="py-5 px-8">
                    <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{doc.type} • {doc.uploadDate}</p>
                  </td>
                  <td className="py-5 px-8">
                    <span className="text-sm font-black text-indigo-600">+{doc.points}</span>
                  </td>
                  <td className="py-5 px-8">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      doc.status === DocStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' :
                      doc.status === DocStatus.PENDING ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {doc.status}
                    </div>
                  </td>
                  <td className="py-5 px-8 max-w-xs">
                    <p className="text-xs text-slate-500 truncate">{doc.rejectionReason || 'Processing standard verification...'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const TeacherReviewPanel = ({ documents, setDocuments }: { documents: Document[], setDocuments: React.Dispatch<React.SetStateAction<Document[]>> }) => {
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleAction = (id: string, action: DocStatus, reason?: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { 
            ...doc, 
            status: action, 
            rejectionReason: reason, 
            hash: action === DocStatus.APPROVED ? Math.random().toString(36).substr(2, 64) : undefined 
          } 
        : doc
    ));
    setRejectionId(null);
    setRejectionReason('');
  };

  const pendingDocs = documents.filter(d => d.status === DocStatus.PENDING);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <div className="flex justify-between items-center mb-4">
             <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={20} /></div>
             <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Attention Needed</span>
          </div>
          <h4 className="text-3xl font-black text-slate-800">{pendingDocs.length}</h4>
          <p className="text-xs text-slate-500 font-medium">Submissions awaiting review</p>
        </Card>
        <Card>
          <div className="flex justify-between items-center mb-4">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
             <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Approval Rate</span>
          </div>
          <h4 className="text-3xl font-black text-slate-800">92%</h4>
          <p className="text-xs text-slate-500 font-medium">Avg verification success</p>
        </Card>
        <Card>
          <div className="flex justify-between items-center mb-4">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Zap size={20} /></div>
             <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Avg Response</span>
          </div>
          <h4 className="text-3xl font-black text-slate-800">4.2h</h4>
          <p className="text-xs text-slate-500 font-medium">Review response time</p>
        </Card>
      </div>

      <Card title="Pending Validation Queue" subtitle="Verify student claims and assign academic weight." noPadding>
        {pendingDocs.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={40} />
            </div>
            <p className="text-slate-500 font-bold">Queue is Empty</p>
            <p className="text-xs text-slate-400">Great job! All student records are up to date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="py-5 px-8">Student</th>
                  <th className="py-5 px-8">Submission</th>
                  <th className="py-5 px-8">Category</th>
                  <th className="py-5 px-8">Credits</th>
                  <th className="py-5 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingDocs.map(doc => (
                  <React.Fragment key={doc.id}>
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="py-5 px-8">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                            {doc.owner.split(' ').map(n => n[0]).join('')}
                          </div>
                          <p className="text-sm font-bold text-slate-800">{doc.owner}</p>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
                          <ExternalLink size={14} className="mr-2" /> {doc.name}
                        </button>
                      </td>
                      <td className="py-5 px-8">
                        <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-600 uppercase rounded tracking-wider">{doc.type}</span>
                      </td>
                      <td className="py-5 px-8 text-sm font-black text-emerald-600">+{doc.points}</td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleAction(doc.id, DocStatus.APPROVED)}
                            className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition shadow-sm"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => setRejectionId(doc.id)}
                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition shadow-sm"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {rejectionId === doc.id && (
                      <tr>
                        <td colSpan={5} className="py-6 px-8 bg-rose-50/50">
                          <div className="flex flex-col space-y-4 max-w-2xl mx-auto text-center">
                            <h5 className="text-sm font-black text-rose-800 uppercase tracking-widest">Reason for Denial</h5>
                            <textarea 
                              value={rejectionReason}
                              onChange={e => setRejectionReason(e.target.value)}
                              className="w-full p-4 border border-rose-200 rounded-2xl text-sm focus:ring-4 focus:ring-rose-500/10 focus:outline-none bg-white font-medium"
                              placeholder="Describe why this certificate does not meet institutional standards..."
                              rows={3}
                            />
                            <div className="flex justify-center space-x-4">
                              <button onClick={() => setRejectionId(null)} className="px-6 py-2.5 text-xs font-black text-slate-500 hover:text-slate-800 uppercase tracking-widest transition">Cancel</button>
                              <button 
                                onClick={() => handleAction(doc.id, DocStatus.REJECTED, rejectionReason)}
                                disabled={!rejectionReason}
                                className="px-8 py-2.5 bg-rose-600 text-white text-xs font-black rounded-xl hover:bg-rose-700 disabled:opacity-50 transition shadow-lg"
                              >
                                Submit Rejection
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// --- Authentication Screen ---

const Login = ({ onLogin }: { onLogin: (role: Role) => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300 rounded-full blur-[128px]" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-300 rounded-full blur-[128px]" />
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 relative z-10 border border-slate-100"
      >
        <div className="text-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-[32px] mx-auto flex items-center justify-center text-white mb-10 shadow-2xl shadow-indigo-200 rotate-12">
            <Cloud size={48} className="-rotate-12" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">CloudCert</h1>
          <p className="text-slate-400 font-medium text-sm mb-12">Professional Academic Verification System</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => onLogin('student')}
              className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center space-x-5 text-left">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <User size={28} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-lg">Student</p>
                  <p className="text-xs text-slate-500 font-medium">Manage files & credits</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition" />
            </button>
            
            <button 
              onClick={() => onLogin('teacher')}
              className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center space-x-5 text-left">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-lg">Teacher</p>
                  <p className="text-xs text-slate-500 font-medium">Review & Verify records</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition" />
            </button>
          </div>
          <p className="mt-16 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Institutional Access Only</p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeView, setActiveView] = useState('Dashboard');
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Defined pendingDocsCount here to fix scope issues in Teacher Dashboard view
  const pendingDocsCount = documents.filter(d => d.status === DocStatus.PENDING).length;

  const handleLogin = (role: Role) => {
    setUser(role === 'student' ? MOCK_STUDENT : MOCK_TEACHER);
  };

  const handlePersonalUpload = (doc: Partial<Document>) => {
      const newDoc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: doc.name || 'Untitled',
          type: doc.type || DocType.PERSONAL,
          status: DocStatus.APPROVED,
          uploadDate: new Date().toISOString().split('T')[0],
          points: 0,
          size: doc.size || '1.0 MB',
          owner: user?.name || 'Student'
      };
      setDocuments(prev => [newDoc, ...prev]);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const sidebarItems = user.role === 'student' ? [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Document Hub', icon: Cloud },
    { label: 'Certificate Upload', icon: FileCheck },
    { label: 'Settings', icon: Settings },
  ] : [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Review Panel', icon: ShieldCheck, badge: pendingDocsCount },
    { label: 'Document Hub', icon: Cloud },
    { label: 'Settings', icon: Settings },
  ];

  // Calculate storage percentage for sidebar widget
  const storageUsedPercent = (user.storageUsed / user.storageLimit) * 100;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      <PersonalUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handlePersonalUpload} />

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3 text-indigo-600">
              <Cloud size={32} />
              <span className="text-2xl font-black tracking-tighter text-slate-900">CloudCert</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-1 mb-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-3">Main Navigation</p>
            {sidebarItems.map((item) => (
              <SidebarItem 
                key={item.label}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                active={activeView === item.label}
                onClick={() => {
                  setActiveView(item.label);
                  if (item.label === 'Document Hub') setActiveFilter('All');
                }}
              />
            ))}
          </div>

          <div className="space-y-1">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-3">Quick Filters</p>
             {[
               { label: 'Fee Receipts', icon: CreditCard, type: DocType.FEE_RECEIPT },
               { label: 'Hall Tickets', icon: FileCheck, type: DocType.HALL_TICKET },
               { label: 'Results', icon: Zap, type: DocType.RESULT },
               { label: 'Certificates', icon: Crown, type: DocType.CERTIFICATE },
             ].map(cat => (
               <SidebarItem 
                 key={cat.label} 
                 icon={cat.icon} 
                 label={cat.label} 
                 active={activeView === 'Document Hub' && activeFilter === cat.type} 
                 onClick={() => { 
                    setActiveView('Document Hub'); 
                    setActiveFilter(cat.type);
                 }} 
               />
             ))}
          </div>

          <div className="mt-auto pt-8 border-t border-slate-50">
            <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full mb-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
            >
                <Cloud size={18} />
                <span>Upload Personal File</span>
            </button>
            <div className="p-5 bg-indigo-50 rounded-2xl mb-6">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase">Storage</span>
                  <span className="text-[10px] font-bold text-indigo-400">{storageUsedPercent.toFixed(0)}% Used</span>
               </div>
               <div className="w-full h-1.5 bg-indigo-200/30 rounded-full overflow-hidden">
                  <div style={{ width: `${storageUsedPercent}%` }} className="h-full bg-indigo-600 rounded-full shadow-sm shadow-indigo-200" />
               </div>
               <button onClick={() => setIsPremiumModalOpen(true)} className="w-full mt-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-600 hover:text-white transition">
                 Get More Space
               </button>
            </div>
            <button 
              onClick={() => setUser(null)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors font-bold text-sm"
            >
              <div className="flex items-center space-x-3">
                <LogOut size={18} />
                <span>Sign Out</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-24 bg-white/80 backdrop-blur-md px-10 flex items-center justify-between sticky top-0 z-40 border-b border-slate-100">
          <div className="flex items-center space-x-6 flex-1">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
              <Menu size={20} />
            </button>
            <div className="relative max-w-md w-full hidden md:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition" size={18} />
              <input 
                type="text" 
                placeholder="Search your cloud drive..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <button className="relative p-3 text-slate-400 hover:text-indigo-600 transition">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center space-x-4 pl-8 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800">{user.name}</p>
                <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{user.role}</p>
              </div>
              <div className="relative group cursor-pointer">
                <img src={user.avatar} className="w-12 h-12 rounded-[20px] object-cover ring-4 ring-indigo-50 group-hover:ring-indigo-200 transition" alt="Avatar" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-indigo-600 shadow-lg">
                  <ShieldCheck size={12} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-10">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">{activeView}</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1">
                    {activeView === 'Dashboard' && 'At a glance overview of your academic records.'}
                    {activeView === 'Document Hub' && 'Manage and access your stored academic files.'}
                    {activeView === 'Certificate Upload' && 'Earn points by verifying your external achievements.'}
                    {activeView === 'Review Panel' && 'Approve or reject student submission requests.'}
                  </p>
               </div>
               {activeView === 'Dashboard' && (
                  <button onClick={() => setIsPremiumModalOpen(true)} className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100 hover:shadow-indigo-100 hover:border-indigo-100 transition-all text-sm font-bold text-slate-700">
                    <Crown size={16} className="text-amber-500" />
                    <span>Go Premium</span>
                  </button>
               )}
            </div>

            {activeView === 'Dashboard' && user.role === 'student' && (
              <StudentDashboard user={user} documents={documents} onAction={setActiveView} onUploadPersonal={() => setIsUploadModalOpen(true)} />
            )}
            
            {activeView === 'Dashboard' && user.role === 'teacher' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <Card title="Quick Tasks" subtitle="Items requiring your signature">
                    <div className="space-y-4">
                       <button onClick={() => setActiveView('Review Panel')} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition group">
                          <div className="flex items-center space-x-3">
                             <div className="p-2 bg-white rounded-lg text-indigo-600"><ShieldCheck size={18} /></div>
                             <div className="text-left">
                                <p className="text-sm font-bold text-slate-800">Pending Reviews</p>
                                <p className="text-xs text-slate-500">Validate {pendingDocsCount} submissions</p>
                             </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                       </button>
                       <div className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl opacity-50 cursor-not-allowed">
                          <div className="flex items-center space-x-3">
                             <div className="p-2 bg-white rounded-lg text-emerald-600"><CheckCircle2 size={18} /></div>
                             <div className="text-left">
                                <p className="text-sm font-bold text-slate-800">Transcript Requests</p>
                                <p className="text-xs text-slate-500">0 requests today</p>
                             </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300" />
                       </div>
                    </div>
                 </Card>
                 <Card title="Approval Analytics" subtitle="Monthly validation overview">
                    <div className="h-32 flex items-end justify-between px-2 gap-2 mt-4">
                       {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                         <div key={i} className="flex-1 bg-indigo-50 rounded-t-lg relative group">
                            <div style={{ height: `${h}%` }} className="absolute bottom-0 left-0 w-full bg-indigo-600 rounded-t-lg group-hover:bg-indigo-500 transition" />
                         </div>
                       ))}
                    </div>
                    <div className="flex justify-between mt-2 px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
                    </div>
                 </Card>
               </div>
            )}
            {activeView === 'Document Hub' && (
              <DocumentHub documents={documents} searchQuery={searchQuery} onOpenPremium={() => setIsPremiumModalOpen(true)} activeFilter={activeFilter} />
            )}
            {activeView === 'Certificate Upload' && (
              <CertificateManager documents={documents} setDocuments={setDocuments} />
            )}
            {activeView === 'Review Panel' && (
              <TeacherReviewPanel documents={documents} setDocuments={setDocuments} />
            )}
            {activeView === 'Settings' && (
              <Card title="Security & Preferences" subtitle="Configure your institutional profile.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Display Name</label>
                       <input type="text" defaultValue={user.name} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email Address</label>
                       <input type="email" defaultValue={user.email} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                       <div>
                          <p className="text-sm font-bold text-slate-800">Email Notifications</p>
                          <p className="text-xs text-slate-500">Receive alerts for document approvals.</p>
                       </div>
                       <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-lg shadow-indigo-100">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between opacity-50">
                       <div>
                          <p className="text-sm font-bold text-slate-800">SMS Verification</p>
                          <p className="text-xs text-slate-500">Two-factor login via mobile device.</p>
                       </div>
                       <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-pointer">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                       </div>
                    </div>
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-slate-50 flex justify-end">
                   <button className="px-10 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">
                      Save Changes
                   </button>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}