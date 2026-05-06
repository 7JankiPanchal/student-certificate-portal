import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Lock, Briefcase, Loader2, ArrowRight, Sparkles, GraduationCap, Eye, EyeOff } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/register', { name, email, password, role });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-login relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-indigo-200/40 dark:bg-accent-purple/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-sky-200/40 dark:bg-accent-cyan/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05]" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>

      <div className="w-full max-w-[1100px] flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20 relative z-10">
        
        {/* Branding Content */}
        <div className="hidden lg:block lg:w-1/2 animate-slide-up">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md mb-8">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[11px] font-bold text-slate-600 dark:text-white/60 uppercase tracking-widest">Join 10,000+ Verified Students</span>
          </div>
          
          <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
            Start Your <br/>
            <span className="text-gradient">Verified Journey.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-white/40 font-medium max-w-md leading-relaxed mb-10">
            Build a portable, cryptographically signed academic profile that employers trust.
          </p>
          
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-white/10">
            {[
              { val: '100%', label: 'Secure' },
              { val: 'Free', label: 'Starter' },
              { val: 'Instant', label: 'Verify' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{s.val}</p>
                <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md lg:w-1/2 animate-scale-in">
          <div className="glass-strong p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-cyan/10 rounded-full blur-[60px]" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10 lg:hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-accent-cyan flex items-center justify-center shadow-glow-cyan">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">CloudCert</h1>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Create account</h2>
                <p className="text-slate-500 dark:text-white/40 font-medium">Join the secure academic portal</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-neon-rose/10 border border-neon-rose/20 text-neon-rose text-sm font-medium rounded-xl animate-scale-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em]">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="glass-input w-full pl-12"
                      placeholder="Alex Johnson"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em]">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="glass-input w-full pl-12"
                      placeholder="you@college.edu"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em]">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="glass-input w-full pl-12 pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20 hover:text-slate-600 dark:hover:text-white/50 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pb-1">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em]">I am a</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('STUDENT')}
                      className={`py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 border ${
                        role === 'STUDENT'
                          ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/30 shadow-glow-purple'
                          : 'bg-slate-200 dark:bg-white/[0.03] text-slate-500 dark:text-white/40 border-slate-300 dark:border-white/[0.08] hover:border-slate-400 dark:hover:border-white/[0.15]'
                      }`}
                    >
                      <GraduationCap size={18} />
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('TEACHER')}
                      className={`py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 border ${
                        role === 'TEACHER'
                          ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30 shadow-glow-cyan'
                          : 'bg-slate-200 dark:bg-white/[0.03] text-slate-500 dark:text-white/40 border-slate-300 dark:border-white/[0.08] hover:border-slate-400 dark:hover:border-white/[0.15]'
                      }`}
                    >
                      <Briefcase size={18} />
                      Teacher
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 mt-2 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={22} />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center mt-8 text-sm text-slate-500 dark:text-white/30 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-accent-cyan font-bold hover:text-accent-cyan/80 transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
