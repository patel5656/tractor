import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Tractor, UserCircle, Shield, Briefcase, Lock, Mail, ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { BookingProvider } from './context/BookingContext';
import { Button } from './components/ui/Button';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';

import FarmerLayout from './layouts/FarmerLayout';
import AdminLayout from './layouts/AdminLayout';
import OperatorLayout from './layouts/OperatorLayout';

// Farmer Pages
import FarmerHome from './pages/farmer/Home';
import BookTractor from './pages/farmer/BookTractor';
import TrackJob from './pages/farmer/TrackJob';
import History from './pages/farmer/History';
import Payments from './pages/farmer/Payments';
import Profile from './pages/farmer/Profile';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Dispatch from './pages/admin/Dispatch';
import LiveTracking from './pages/admin/LiveTracking';
import Bookings from './pages/admin/Bookings';
import Farmers from './pages/admin/Farmers';
import AdminPayments from './pages/admin/Payments';
import Reports from './pages/admin/Reports';
import Operators from './pages/admin/Operators';
import Tractors from './pages/admin/Tractors';
import Settings from './pages/admin/Settings';

// Operator Pages
import Jobs from './pages/operator/Jobs';
import Navigation from './pages/operator/Navigation';
import Status from './pages/operator/Status';
import Fuel from './pages/operator/Fuel';
import OperatorProfile from './pages/operator/Profile';
import { cn } from './lib/utils';

// --- Auth Protection Components ---
function ProtectedRoute({ children, allowedRole }) {
  const auth = useAuth();
  const { isAuthenticated, role, user } = auth || {};
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (role !== allowedRole) {
    // Redirect wrong roles to their correct dashboard
    if (role === 'farmer') return <Navigate to="/farmer" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'operator') return <Navigate to="/operator" replace />;
  }
  
  return children;
}

// --- Modern Dark Theme Login Page ---
function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fillDemoCredentials = (role) => {
    const roles = {
      admin: { email: 'admin@tractorlink.com', password: 'admin123' },
      farmer: { email: 'farmer@tractorlink.com', password: 'farmer123' },
      operator: { email: 'operator@tractorlink.com', password: 'operator123' }
    };
    setEmail(roles[role].email);
    setPassword(roles[role].password);
  };

  // If already logged in, redirect them out of the login page
  if (isAuthenticated && user?.role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      // AuthContext will update, leading to re-render and Navigate (if added in useEffect or similar)
      // but here we can just wait for re-render or navigate manually if needed.
      // Since user is set, the above Navigate will catch it on next render.
    } else {
      setError(result.message || 'Login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-main flex font-sans">
      
      {/* Left Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 bg-white border-r border-gray-100 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #2E7D32 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 p-24 opacity-5 transform translate-x-20 -translate-y-10">
          <Tractor size={400} className="text-earth-primary" />
        </div>
        
        <div className="relative z-10 max-w-lg text-earth-dark">
          <h1 className="text-5xl font-black mb-6 flex items-center gap-4 text-earth-dark uppercase">
            <img src="/tractorlink-logo.png" alt="TractorLink Logo" className="w-24 h-24 object-contain" />
            TractorLink
          </h1>
          <p className="text-xl text-earth-sub font-bold leading-relaxed">
            The leading smart agriculture network connecting farm owners with machinery and professional operators seamlessly.
          </p>
          
          <div className="mt-12 space-y-4">
               <div className="flex items-center gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-200 shadow-inner backdrop-blur-sm">
                 <div className="w-10 h-10 bg-earth-primary rounded-xl flex items-center justify-center text-white font-black shrink-0">1</div>
                 <p className="font-bold text-earth-dark">Verify your email address securely</p>
               </div>
             <div className="flex items-center gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-200 shadow-inner backdrop-blur-sm">
               <div className="w-10 h-10 bg-earth-primary rounded-xl flex items-center justify-center text-white font-black shrink-0">2</div>
               <p className="font-bold text-earth-dark">Select your primary organization role</p>
             </div>
             <div className="flex items-center gap-4 bg-gray-50/80 p-4 rounded-2xl border border-earth-primary/10 shadow-[0_0_15px_rgba(46,125,50,0.05)] backdrop-blur-sm">
               <div className="w-10 h-10 bg-earth-primary rounded-xl flex items-center justify-center text-white font-black shrink-0">3</div>
               <p className="font-bold text-earth-green">Access tailored operational dashboards</p>
             </div>
          </div>
        </div>
      </div>
      
      {/* Right Login Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-earth-main">
        {/* Back to Home Button */}
        <Link to="/" className="absolute top-8 right-8 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-earth-sub hover:text-earth-primary transition-all hover:scale-110 active:scale-95 group flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
           <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
           Home
        </Link>
        <div className="w-full max-w-md">
          
          <div className="lg:hidden flex items-center gap-3 mb-10 text-earth-brown font-black text-3xl">
            <img src="/tractorlink-logo.png" alt="TractorLink Logo" className="w-14 h-14 object-contain" /> TractorLink
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-black text-earth-brown tracking-tight">Welcome back</h2>
            <p className="text-earth-sub font-bold mt-2">Sign in to your secure portal to continue.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm font-bold">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-earth-mut uppercase tracking-widest mb-1.5 block pl-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-earth-mut"><Mail size={18} /></div>
                  <input 
                    type="email" 
                    required 
                    className="w-full pl-11 pr-4 py-3.5 bg-earth-card border border-earth-dark/10 rounded-2xl text-earth-brown font-bold focus:border-earth-primary focus:bg-earth-card-alt outline-none transition-all shadow-inner" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-earth-mut uppercase tracking-widest mb-1.5 block pl-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-earth-mut"><Lock size={18} /></div>
                  <input 
                    type="password" 
                    required 
                    className="w-full pl-11 pr-4 py-3.5 bg-earth-card border border-earth-dark/10 rounded-2xl text-earth-brown font-bold focus:border-earth-primary focus:bg-earth-card-alt outline-none transition-all shadow-inner" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-xs text-earth-primary font-bold mt-2 text-right cursor-pointer hover:underline uppercase tracking-wide">Forgot Password?</p>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={cn(
                "w-full h-14 text-base md:text-lg font-black uppercase tracking-widest rounded-2xl bg-accent hover:opacity-90 text-white shadow-lg shadow-accent/30 transition-all mt-8 border-none",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? 'Authenticating...' : 'Authenticate & Login'}
            </Button>
            
            <div className="pt-8 border-t border-earth-dark/10/50 mt-8">
              <label className="text-[10px] font-bold text-earth-mut uppercase tracking-widest mb-4 block text-center">Quick Demo Access</label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => fillDemoCredentials('admin')}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-earth-card border border-earth-dark/10 hover:border-earth-primary/50 hover:bg-earth-card-alt transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-earth-primary/10 flex items-center justify-center text-earth-primary mb-2 group-hover:scale-110 transition-transform">
                    <Shield size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-earth-sub group-hover:text-earth-brown">Admin</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => fillDemoCredentials('farmer')}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-earth-card border border-earth-dark/10 hover:border-emerald-500/50 hover:bg-earth-card-alt transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-earth-primary/10 flex items-center justify-center text-earth-green mb-2 group-hover:scale-110 transition-transform">
                    <UserCircle size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-earth-sub group-hover:text-earth-brown">Farmer</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => fillDemoCredentials('operator')}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-earth-card border border-earth-dark/10 hover:border-blue-500/50 hover:bg-earth-card-alt transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                    <Briefcase size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-earth-sub group-hover:text-earth-brown">Operator</span>
                </button>
              </div>
            </div>
            
          </form>
          
          <div className="text-center mt-6">
            <Link to="/register" className="text-xs font-black uppercase tracking-wide text-earth-sub hover:text-earth-brown transition-colors">
              Don't have an account? <span className="text-earth-primary">Register now &rarr;</span>
            </Link>
          </div>

        </div>
      </div>
      
    </div>
  );
}

// --- End of Components ---

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <SettingsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Farmer App Routes */}
              <Route path="/farmer" element={<ProtectedRoute allowedRole="farmer"><FarmerLayout /></ProtectedRoute>}>
                <Route index element={<FarmerHome />} />
                <Route path="book" element={<BookTractor />} />
                <Route path="track" element={<TrackJob />} />
                <Route path="history" element={<History />} />
                <Route path="payments" element={<Payments />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Admin Dashboard Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="dispatch" element={<Dispatch />} />
                <Route path="tracking" element={<LiveTracking />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="farmers" element={<Farmers />} />
                <Route path="operators" element={<Operators />} />
                <Route path="fleet" element={<Tractors />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />}>
                  <Route path=":tab" element={<Settings />} />
                </Route>
              </Route>

              {/* Operator Panel Routes */}
              <Route path="/operator" element={<ProtectedRoute allowedRole="operator"><OperatorLayout /></ProtectedRoute>}>
                <Route index element={<Jobs />} />
                <Route path="navigation" element={<Navigation />} />
                <Route path="status" element={<Status />} />
                <Route path="fuel" element={<Fuel />} />
                <Route path="profile" element={<OperatorProfile />} />
              </Route>
              
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </SettingsProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
