import { useState, useEffect } from 'react';
import { MapPin, Navigation, Mail, MessageSquare, CheckCircle, Clock, ChevronRight, Tractor, Map as MapIcon, ShieldCheck, ShieldAlert, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { dummyTractors } from '../../data/dummyData';
import { useBookings } from '../../context/BookingContext';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function TrackJob() {
  const { bookings } = useBookings();
  const farmerId = 'f1';
  
  // Find first active booking
  const activeBooking = bookings.find(b => b.farmerId === farmerId && (b.status === 'In Progress' || b.status === 'Scheduled'));
  
  // If no active booking, we don't need a tractor
  const tractor = activeBooking && activeBooking.tractorId 
    ? dummyTractors.find(t => t.id === activeBooking.tractorId) 
    : { operator: 'Pending Assignment', id: 'TBD', email: '', model: 'Pending' };

  const [progress, setProgress] = useState(0);
  const [activeAction, setActiveAction] = useState(null); // 'message', 'emergency', null

  // Auto-hide actions after 3s
  useEffect(() => {
    if (activeAction) {
      const timer = setTimeout(() => setActiveAction(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [activeAction]);

  // Simulated movement animation - slower and smoother
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 0.2 : 0));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { title: 'Scheduled', time: activeBooking ? new Date(activeBooking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Pending', status: activeBooking ? 'done' : 'pending' },
    { title: 'En Route', time: 'Pending', status: activeBooking?.status === 'Scheduled' ? 'active' : activeBooking?.status === 'In Progress' ? 'done' : 'pending' },
    { title: 'In Progress', time: 'Pending', status: activeBooking?.status === 'In Progress' ? 'active' : 'pending' },
    { title: 'Completed', time: 'Pending', status: 'pending' },
  ];

  if (!activeBooking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen lg:h-[calc(100vh-2rem)] bg-earth-main border border-earth-dark/10 lg:rounded-3xl shadow-2xl p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-earth-card rounded-full flex items-center justify-center text-earth-mut border border-earth-dark/10 shadow-inner">
           <MapIcon size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-earth-brown tracking-tight mb-2">No Active Operations</h2>
          <p className="text-sm font-bold text-earth-mut max-w-sm">You currently have no scheduled or ongoing jobs to track. Book a new service to monitor it here.</p>
        </div>
        <Link to="/farmer/book" className="px-6 py-3 bg-earth-primary text-earth-brown hover:bg-earth-primary-hover font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all">
          Book a Tractor
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-2rem)] bg-earth-main overflow-hidden lg:rounded-3xl border border-earth-dark/10 shadow-2xl relative">
      
      {/* --- MAP VIEW (Refined Pro Navigation) --- */}
      <div className="h-[45vh] lg:h-full flex-1 bg-earth-main overflow-hidden relative border-b lg:border-b-0 lg:border-r border-earth-dark/10">
        {/* Subtle Map Grid */}
        <div className="absolute inset-0 opacity-[0.15]" 
             style={{ 
               backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)', 
               backgroundSize: '60px 60px'
             }}>
        </div>

        {/* Road Labels & Terrain (Fake but pro-looking) */}
        <div className="absolute top-[20%] left-[30%] opacity-20 select-none">
           <span className="text-[10px] font-black text-earth-sub uppercase tracking-[0.3em] rotate-12">NH-44 Bypass</span>
        </div>
        <div className="absolute bottom-[40%] right-[10%] opacity-20 select-none">
           <span className="text-[10px] font-black text-earth-sub uppercase tracking-[0.3em] -rotate-45">Field Road 7</span>
        </div>

        {/* Simulated Road Path - Darker, more integrated */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
           <path 
            d="M 120 120 C 350 150, 400 450, 600 500 S 800 700, 900 800" 
            fill="none" 
            stroke="#1a1a1a" 
            strokeWidth="12" 
            strokeLinecap="round"
           />
           <path 
            d="M 120 120 C 350 150, 400 450, 600 500 S 800 700, 900 800" 
            fill="none" 
            stroke="#262626" 
            strokeWidth="4" 
            strokeLinecap="round"
            strokeDasharray="8 12"
           />
           <path 
            id="track-path"
            d="M 120 120 C 350 150, 400 450, 600 500 S 800 700, 900 800" 
            fill="none" 
            stroke="#eab308" 
            strokeWidth="3" 
            strokeLinecap="round"
            strokeDasharray="1 10"
            className="animate-[dash_40s_linear_infinite]"
           />
        </svg>

        {/* Farm (Destination) */}
        <div className="absolute top-[70%] left-[75%] lg:bottom-[20%] lg:right-[20%] flex flex-col items-center">
           <div className="w-12 h-12 bg-earth-primary/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-earth-green relative">
             <MapPin size={24} />
             <div className="absolute inset-0 bg-earth-primary rounded-full animate-ping opacity-20"></div>
           </div>
           <span className="mt-2 px-3 py-1 bg-earth-card-alt shadow-xl rounded text-[9px] font-black text-earth-brown uppercase border border-earth-dark/15 tracking-wider">Ludhiana Farm</span>
        </div>

        {/* Animated Tractor Marker */}
        <div 
          className="absolute transition-all duration-500 ease-linear"
          style={{ 
            left: `${10 + (progress * 0.7)}%`, 
            top: `${10 + (progress * 0.6)}%`,
            transform: `translate(-50%, -50%) rotate(${35 + Math.sin(progress/4)*8}deg)`
          }}
        >
          <div className="relative group">
             <div className="bg-earth-primary p-2.5 rounded-2xl text-black border-2 border-earth-dark/20 shadow-[0_0_25px_rgba(234,179,8,0.5)]">
                <Navigation size={22} fill="currentColor" />
             </div>
             <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-earth-main/90 backdrop-blur-md text-earth-brown text-[9px] font-black rounded-lg border border-earth-dark/10 shadow-xl">
               Operator: {tractor.operator}
             </div>
          </div>
        </div>

        {/* Map Overlays */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
           <div className="bg-earth-card-alt/80 backdrop-blur-md border border-earth-dark/15 p-3 rounded-2xl flex items-center gap-3 pointer-events-auto">
             <div className="bg-earth-primary p-1.5 rounded-lg text-black">
               <Clock size={14} />
             </div>
             <div>
               <p className="text-[8px] font-black text-earth-mut uppercase tracking-widest leading-none">Arrival ETA</p>
               <p className="text-xs font-black text-earth-brown mt-1 leading-none tabular-nums">12 Mins • 3.8 km</p>
             </div>
           </div>
           
           <div className="bg-earth-primary/10 backdrop-blur-md border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center gap-2 pointer-events-auto">
             <ShieldCheck size={14} className="text-earth-green" />
             <span className="text-[10px] font-black text-earth-green uppercase tracking-widest">Live GPS Secured</span>
           </div>
        </div>
      </div>

      {/* --- TRACKING SIDEBAR (Scrollable on mobile) --- */}
      <div className="flex-1 lg:flex-none lg:w-[420px] bg-earth-card flex flex-col overflow-y-auto lg:overflow-hidden scrollbar-hide">
        
        {/* Fixed Header on Desktop, Scrolled on Mobile */}
        <div className="p-6 border-b border-earth-dark/10 bg-earth-card/50 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1.5">
             <span className="px-2 py-0.5 bg-earth-primary/10 text-earth-green rounded text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Task Active</span>
             <ChevronRight size={14} className="text-earth-mut" />
             <span className="text-[10px] font-black text-earth-mut uppercase tracking-widest">Job ID: {activeBooking.id}</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-earth-brown tracking-tight">Real-time Tracking</h2>
        </div>

        <div className="flex-1 p-6 space-y-6 lg:overflow-y-auto scrollbar-hide">
          
          {/* Operator Details */}
          <div className="bg-earth-card-alt border border-earth-dark/10 p-4 rounded-2xl space-y-4 shadow-inner">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-earth-card rounded-xl flex items-center justify-center text-earth-primary font-black text-xl border border-earth-dark/10 shadow-sm">
                     {tractor.operator.charAt(0)}
                   </div>
                   <div>
                     <p className="text-[9px] font-black text-earth-mut uppercase tracking-widest">Operator on Duty</p>
                     <p className="text-base font-black text-earth-brown leading-none mt-1">{tractor.operator}</p>
                     <p className="text-[11px] font-bold text-earth-sub mt-1.5 flex items-center gap-1.5">
                       <Tractor size={12} className="text-earth-primary" /> {tractor.model}
                     </p>
                   </div>
                </div>
                <div className="flex gap-2">
                   {tractor.email && (
                     <a 
                      href={`mailto:${tractor.email}`} 
                      className="w-10 h-10 bg-earth-card hover:bg-earth-card-alt border border-earth-dark/15 rounded-xl flex items-center justify-center text-earth-green transition-all active:scale-95 shadow-lg"
                      title="Email Operator"
                     >
                       <Mail size={18} />
                     </a>
                   )}
                   <button 
                    onClick={() => setActiveAction('message')}
                    className="w-10 h-10 bg-earth-card hover:bg-earth-card-alt border border-earth-dark/15 rounded-xl flex items-center justify-center text-blue-400 transition-all active:scale-95 shadow-lg"
                    title="Send Message"
                   >
                     <MessageSquare size={18} />
                   </button>
                </div>
             </div>
          </div>

          {/* Detailed Timeline */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-earth-mut uppercase tracking-widest px-1">Milestone Timeline</h3>
            <div className="space-y-1">
              {steps.map((step, idx) => (
                <div key={idx} className="relative pl-9 pb-7 last:pb-2">
                   {/* Vertical Line */}
                   {idx !== steps.length - 1 && (
                     <div className={cn(
                       "absolute left-[13px] top-6 bottom-0 w-[1.5px]",
                       step.status === 'done' ? "bg-earth-primary" : "bg-earth-card-alt"
                     )}></div>
                   )}

                   {/* Status Node */}
                   <div className={cn(
                     "absolute left-0 w-[28px] h-[28px] rounded-full flex items-center justify-center z-10 transition-all duration-500",
                     step.status === 'done' ? "bg-earth-primary text-earth-brown shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
                     step.status === 'active' ? "bg-earth-main border-2 border-earth-primary shadow-[0_0_20px_rgba(234,179,8,0.2)]" : 
                     "bg-earth-card-alt border border-earth-dark/15"
                   )}>
                     {step.status === 'done' ? <CheckCircle size={16} /> : 
                      step.status === 'active' ? <div className="w-2.5 h-2.5 bg-earth-primary rounded-full animate-pulse shadow-[0_0_8px_white]"></div> : null}
                   </div>

                   {/* Milestone Card */}
                   <div className={cn(
                     "p-3 rounded-xl border transition-all duration-300",
                     step.status === 'active' ? "bg-earth-card-alt/60 border-earth-dark/15" : "bg-transparent border-transparent"
                   )}>
                      <div className="flex justify-between items-baseline mb-1">
                         <h4 className={cn("text-xs font-black uppercase tracking-wider", 
                           step.status === 'done' ? "text-earth-green" : 
                           step.status === 'active' ? "text-earth-brown" : 
                           "text-earth-mut")}>
                           {step.title}
                         </h4>
                         <span className="text-[9px] font-black text-earth-mut tabular-nums">{step.time}</span>
                      </div>
                      <p className="text-[10px] font-bold text-earth-mut leading-tight">
                        {step.status === 'active' ? "Current Stage: Tractor approaching plot area" : 
                         step.status === 'done' ? "Verified & Logged Successfully" : 
                         "Awaiting milestone trigger"}
                      </p>
                   </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Help */}
        <div className="p-6 bg-earth-main/40 border-t border-earth-dark/10 lg:sticky lg:bottom-0">
           <Button 
            onClick={() => setActiveAction('emergency')}
            variant="outline" 
            className="w-full border-red-500/20 hover:bg-red-500/5 text-red-500 h-11 rounded-xl font-black uppercase tracking-widest text-[9px]"
           >
             Emergency Assistance
           </Button>
        </div>

        {/* --- SIMULATED ACTION OVERLAYS --- */}
        {activeAction === 'message' && (
          <div className="absolute bottom-24 left-6 right-6 lg:left-auto lg:right-6 lg:w-80 bg-earth-dark text-earth-main p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 z-50 border border-earth-primary/30">
             <div className="bg-earth-primary/20 p-2 rounded-lg text-earth-primary"><MessageSquare size={20} /></div>
             <div>
               <p className="text-xs font-black uppercase tracking-wider">Message Sent</p>
               <p className="text-[10px] font-bold opacity-80">Raju will respond shortly</p>
             </div>
          </div>
        )}

        {activeAction === 'emergency' && (
          <div className="absolute inset-x-6 bottom-24 lg:inset-auto lg:bottom-24 lg:right-6 lg:w-80 bg-red-600 text-earth-brown p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 z-50">
             <div className="bg-white/20 p-2 rounded-lg animate-pulse"><ShieldAlert size={20} /></div>
             <div className="flex-1">
               <p className="text-xs font-black uppercase tracking-wider">Emergency Alerted</p>
               <p className="text-[10px] font-bold opacity-80">Hub support team is on standby</p>
             </div>
             <button onClick={() => setActiveAction(null)} className="p-1 hover:bg-white/10 rounded-lg"><X size={16} /></button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -2000;
          }
        }
      `}} />
    </div>
  );
}
