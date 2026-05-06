import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, Loader2, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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

      <div className="w-full max-w-[1000px] flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
        
        {/* Left Branding Content */}
        <div className="hidden lg:block lg:w-1/2 animate-slide-up">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md mb-8">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-[11px] font-bold text-slate-600 dark:text-white/60 uppercase tracking-widest">v2.0 Verified Architecture</span>
          </div>
          
          <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
            The Future of <br/>
            <span className="text-gradient">Academic Trust.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-white/40 font-medium max-w-md leading-relaxed mb-10">
            Secure your credentials with military-grade encryption and instant verification.
          </p>
          
          <div className="flex items-center gap-8">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-dark-900 bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-dark-900 bg-accent-purple text-white text-[10px] font-bold flex items-center justify-center">
                +2k
              </div>
            </div>
            <p className="text-sm text-slate-400 dark:text-white/20 font-bold">Joined by students worldwide</p>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="w-full max-w-md lg:w-1/2 animate-scale-in">
          <div className="glass-strong p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-purple/10 rounded-full blur-[60px]" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10 lg:hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center shadow-glow-purple">
                  <Sparkles size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">CloudCert</h1>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Welcome back</h2>
                <p className="text-slate-500 dark:text-white/40 font-medium">Sign in to your academic vault</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-neon-rose/10 border border-neon-rose/20 text-neon-rose text-sm font-medium rounded-xl animate-scale-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 mt-2 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={22} />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center mt-8 text-sm text-slate-500 dark:text-white/30 font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-accent-cyan font-bold hover:text-accent-cyan/80 transition">
                  Create one
                </Link>
              </p>

              {/* Presentation Mode / Demo Section */}
              <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-amber-500" />
                  <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">Presentation Mode</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const res = await api.post('/seed-demo');
                        alert(res.data.message + "\n\nCredentials:\nEmail: demo@student.com\nPassword: password123");
                      } catch (e) {
                        alert("Failed to seed demo data. It might already exist or the server is busy.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-white/60 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2 group"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Seed Demo Database
                  </button>
                  
                  <div className="flex gap-3 mt-1">
                    <button 
                      onClick={() => { setEmail('demo@student.com'); setPassword('password123'); }}
                      className="flex-1 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition"
                    >
                      Demo Student
                    </button>
                    <button 
                      onClick={() => { setEmail('demo@teacher.com'); setPassword('password123'); }}
                      className="flex-1 py-2.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition"
                    >
                      Demo Faculty
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
