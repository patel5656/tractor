import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tractor, User, Mail, Shield, Briefcase, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [role, setRole] = useState('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await register({ name, email, password, role });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } else {
      setError(result.message || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  const roles = [
    { id: 'farmer', icon: User, label: 'Farmer' }
  ];

  return (
    <div className="min-h-screen bg-earth-main flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-earth-card rounded-[2rem] shadow-2xl shadow-black/50 overflow-hidden flex flex-col md:flex-row border border-earth-dark/10">
        
        {/* Left Branding */}
        <div className="w-full md:w-5/12 bg-earth-dark border-r border-earth-dark/10 p-8 md:p-12 text-earth-main flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-earth-primary via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <img src="/tractorlink-logo.png" alt="TractorLink Logo" className="w-20 h-20 object-contain" />
              <h2 className="text-3xl font-black tracking-tight text-earth-main">TractorLink</h2>
            </div>
            <p className="text-earth-main/80 font-bold leading-relaxed">Join the leading smart agriculture network today.</p>

            <div className="space-y-4 mt-12 hidden md:block">
              <div className="flex items-center gap-4 bg-earth-main/5 p-4 rounded-2xl border border-earth-main/10 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-earth-primary text-earth-brown flex items-center justify-center font-black">1</div>
                <p className="text-sm font-bold text-earth-main">Create a secure account</p>
              </div>
              <div className="flex items-center gap-4 bg-earth-main/5 p-4 rounded-2xl border border-earth-main/10 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-earth-primary text-earth-brown flex items-center justify-center font-black">2</div>
                <p className="text-sm font-bold text-earth-main">Select your organization role</p>
              </div>
              <div className="flex items-center gap-4 bg-earth-card/80 p-4 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-earth-primary text-earth-brown flex items-center justify-center font-black shadow-[0_0_10px_rgba(16,185,129,0.5)]">3</div>
                <p className="text-sm font-bold text-earth-green">Access your dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12">
          <h1 className="text-3xl font-black text-earth-brown mb-2 tracking-tight">Create Account</h1>
          <p className="text-earth-sub font-bold mb-8">Fill in the details below to register your tech portal.</p>

          <form onSubmit={handleRegister} className="space-y-6">
            
            {success ? (
              <div className="bg-earth-primary/10 border border-emerald-500/20 p-8 rounded-3xl text-center space-y-4">
                <div className="w-16 h-16 bg-earth-primary rounded-full flex items-center justify-center text-earth-brown mx-auto shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  <Shield size={32} />
                </div>
                <h3 className="text-xl font-black text-earth-brown">Registration Successful!</h3>
                <p className="text-earth-sub font-bold italic">Redirecting you to the login portal...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm font-bold">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-earth-mut uppercase tracking-widest pl-1">1. Select Account Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {roles.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={cn(
                          "flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all",
                          role === r.id 
                            ? 'border-earth-primary bg-earth-card-alt shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                            : 'border-earth-dark/10 bg-earth-card/50 hover:bg-earth-card-alt hover:border-earth-dark/15 text-earth-mut'
                        )}
                      >
                        <div className={cn("p-2 rounded-xl mb-2 transition-colors border shadow-inner", role === r.id ? "bg-earth-primary/10 text-earth-primary border-earth-primary/50" : "bg-earth-card-alt text-earth-mut border-earth-dark/15")}>
                          <r.icon size={20} />
                        </div>
                        <span className={cn("text-xs font-black uppercase tracking-widest", role === r.id ? "text-earth-brown" : "text-earth-sub")}>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-earth-dark/10">
                  <label className="text-[10px] font-black text-earth-mut uppercase tracking-widest pl-1">2. Personal Details</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-earth-mut">
                        <User size={18} />
                      </div>
                      <input 
                        required 
                        type="text" 
                        placeholder="Full Name" 
                        className="w-full pl-11 pr-4 py-3.5 bg-earth-card-alt border border-earth-dark/15 rounded-2xl text-earth-brown font-bold focus:outline-none focus:border-earth-primary focus:bg-earth-card transition-colors shadow-inner" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-earth-mut">
                        <Mail size={18} />
                      </div>
                      <input 
                        required 
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full pl-11 pr-4 py-3.5 bg-earth-card-alt border border-earth-dark/15 rounded-2xl text-earth-brown font-bold focus:outline-none focus:border-earth-primary focus:bg-earth-card transition-colors shadow-inner" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-earth-mut">
                        <Lock size={18} />
                      </div>
                      <input 
                        required 
                        type="password" 
                        placeholder="Secure Password" 
                        className="w-full pl-11 pr-4 py-3.5 bg-earth-card-alt border border-earth-dark/15 rounded-2xl text-earth-brown font-bold focus:outline-none focus:border-earth-primary focus:bg-earth-card transition-colors shadow-inner" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={cn(
                    "w-full h-14 text-base md:text-lg font-black uppercase tracking-widest bg-earth-primary hover:bg-earth-primary-hover text-earth-brown rounded-2xl transition-all transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] mt-8",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? 'Processing...' : 'Complete Registration'}
                </button>

                <div className="text-center pt-2">
                  <Link to="/login" className="text-xs font-black uppercase tracking-wide text-earth-sub hover:text-earth-brown transition-colors">
                    &larr; Back to Login
                  </Link>
                </div>
              </>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
