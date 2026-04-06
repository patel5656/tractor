import { useState, useEffect } from 'react';
import { Navigation2, Search, Crosshair, Map as MapIcon, Compass, MapPin, Flag, Zap, Clock, AlertTriangle, RefreshCcw, Power, Play, X, ChevronRight, Tractor, ShieldCheck, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

export default function Navigation() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [eta, setEta] = useState(15);
  const [distance, setDistance] = useState(8.5);
  const [progress, setProgress] = useState(0);

  // Simulated movement animation
  useEffect(() => {
    let interval;
    if (isNavigating) {
      interval = setInterval(() => {
        setProgress(prev => (prev < 100 ? prev + 0.2 : 0));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isNavigating]);

  const steps = [
    { title: 'Job Started', time: '09:00 AM', status: 'done', desc: 'Heading to Punjab Farm, Plot 42' },
    { title: 'En Route', time: '12 Mins', status: isNavigating ? 'active' : 'pending', desc: 'Current Stage: Tractor approaching plot area' },
    { title: 'In Progress', time: 'Pending', status: 'pending', desc: 'Awaiting milestone trigger' },
    { title: 'Completed', time: 'Pending', status: 'pending', desc: 'Final verification' },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-2rem)] bg-earth-main overflow-hidden lg:rounded-3xl border border-earth-dark/10 shadow-2xl relative">
      
      {/* --- MAP VIEW (Refined Pro Navigation) --- */}
      <div className="h-[45vh] lg:h-full flex-1 bg-earth-card overflow-hidden relative border-b lg:border-b-0 lg:border-r border-earth-dark/10 order-1">
        {/* Subtle Map Grid */}
        <div className="absolute inset-0 opacity-[0.15]" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(45,50,30,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(45,50,30,0.1) 1px, transparent 1px)', 
               backgroundSize: '60px 60px'
             }}>
        </div>

        {/* Road Labels & Terrain */}
        <div className="absolute top-[20%] left-[30%] opacity-20 select-none">
           <span className="text-[10px] font-black text-earth-sub uppercase tracking-[0.3em] rotate-12">Sector 4 Track</span>
        </div>
        <div className="absolute bottom-[40%] right-[10%] opacity-20 select-none">
           <span className="text-[10px] font-black text-earth-sub uppercase tracking-[0.3em] -rotate-45">Main Junction</span>
        </div>

        {/* Simulated Road Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
           <path 
            d="M 120 120 C 350 150, 400 450, 600 500 S 800 700, 900 800" 
            fill="none" 
            stroke="#2d321e" 
            strokeWidth="12" 
            strokeLinecap="round"
           />
           <path 
            d="M 120 120 C 350 150, 400 450, 600 500 S 800 700, 900 800" 
            fill="none" 
            stroke="#301e10" 
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
            className={cn(isNavigating && "animate-[dash_40s_linear_infinite]")}
           />
        </svg>

        {/* Destination Marker */}
        <div className="absolute top-[70%] left-[75%] lg:bottom-[20%] lg:right-[20%] flex flex-col items-center">
           <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 relative">
             <MapPin size={24} />
             <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
           </div>
           <span className="mt-2 px-3 py-1 bg-earth-card-alt shadow-xl rounded text-[9px] font-black text-earth-brown uppercase border border-earth-dark/15 tracking-wider">Punjab Farm</span>
        </div>

        {/* Animated Unit Marker */}
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
                <Navigation2 size={22} fill="currentColor" />
             </div>
             <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-earth-main/90 backdrop-blur-md text-earth-brown text-[9px] font-black rounded-lg border border-earth-dark/10 shadow-xl">
               Op. Raju | #T24
             </div>
          </div>
        </div>

        {/* Map Overlays */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
           <div className="bg-earth-main/40 backdrop-blur-md border border-earth-dark/10/50 p-3 rounded-2xl flex items-center gap-3 pointer-events-auto">
             <div className="bg-earth-primary p-1.5 rounded-lg text-black">
               <Clock size={14} />
             </div>
             <div>
               <p className="text-[8px] font-black text-earth-mut uppercase tracking-widest leading-none">Arrival ETA</p>
               <p className="text-xs font-black text-earth-brown mt-1 leading-none tabular-nums">{eta} Mins • {distance} km</p>
             </div>
           </div>
           
           <div className="bg-earth-primary/10 backdrop-blur-md border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center gap-2 pointer-events-auto">
             <ShieldCheck size={14} className="text-earth-green" />
             <span className="text-[10px] font-black text-earth-green uppercase tracking-widest">Live GPS Secured</span>
           </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto">
           <button className="w-10 h-10 bg-earth-card-alt/80 backdrop-blur-md border border-earth-dark/15 rounded-xl flex items-center justify-center text-earth-brown hover:bg-neutral-700 transition-all">
             <Crosshair size={18} />
           </button>
        </div>
      </div>

      {/* --- MISSION CONTROL SIDEBAR --- */}
      <div className="flex-1 lg:flex-none lg:w-[420px] bg-earth-card flex flex-col overflow-y-auto lg:overflow-hidden scrollbar-hide order-2">
        
        {/* Header */}
        <div className="p-6 border-b border-earth-dark/10 bg-earth-card/50 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1.5">
             <span className="px-2 py-0.5 bg-earth-primary/10 text-earth-primary rounded text-[9px] font-black uppercase tracking-widest border border-earth-primary/20">Mission Active</span>
             <ChevronRight size={14} className="text-earth-mut" />
             <span className="text-[10px] font-black text-earth-mut uppercase tracking-widest">Target: Plot 42</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-earth-brown tracking-tight">Real-time Navigation</h2>
        </div>

        <div className="flex-1 p-6 space-y-6 lg:overflow-y-auto scrollbar-hide">
          
          {/* Target Details */}
          <div className="bg-earth-card border border-earth-dark/10 p-4 rounded-2xl space-y-4 shadow-inner">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-earth-card rounded-xl flex items-center justify-center text-earth-primary font-black text-xl border border-earth-dark/10 shadow-sm">
                     <Search size={20} />
                   </div>
                   <div>
                     <p className="text-[9px] font-black text-earth-mut uppercase tracking-widest">Destination</p>
                     <p className="text-base font-black text-earth-brown leading-none mt-1">Punjab Farm, Plot 42</p>
                     <p className="text-[11px] font-bold text-earth-sub mt-1.5 flex items-center gap-1.5 italic">
                       <Compass size={12} className="text-earth-primary" /> Guidance Mode: Active
                     </p>
                   </div>
                </div>
             </div>
          </div>

          {/* Timeline / Steps */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-earth-mut uppercase tracking-widest px-1">Mission Milestones</h3>
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
                        {step.desc}
                      </p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-earth-main/40 border-t border-earth-dark/10 lg:sticky lg:bottom-0 space-y-3">
           <Button 
             onClick={() => setIsNavigating(!isNavigating)}
             variant="default" 
             className={cn(
               "w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
               isNavigating ? "bg-earth-brown text-earth-main hover:bg-earth-dark" : "bg-earth-primary hover:bg-earth-primary-hover text-earth-brown"
             )}
           >
             {isNavigating ? <><X size={16} className="mr-2" /> End Mission</> : <><Play size={16} className="mr-2" /> Start Navigation</>}
           </Button>
           
           <div className="grid grid-cols-2 gap-3">
              <button onClick={() => {}} className="bg-earth-card-alt hover:bg-earth-card border border-earth-dark/15 p-2 rounded-xl text-[8px] font-black uppercase tracking-widest text-earth-sub flex items-center justify-center gap-2">
                 <RefreshCcw size={12} /> Recalculate
              </button>
              <button onClick={() => {}} className="bg-earth-card-alt hover:bg-earth-card border border-earth-dark/15 p-2 rounded-xl text-[8px] font-black uppercase tracking-widest text-red-500 flex items-center justify-center gap-2">
                 <AlertTriangle size={12} /> Obstruction
              </button>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -2000;
          }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}
