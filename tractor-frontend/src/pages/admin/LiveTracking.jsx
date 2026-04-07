import { useState, useEffect, useRef } from 'react';
import { Search, Map, List, Navigation, Info, Activity, Fuel, Battery, Gauge, Wind, AlertCircle, X, Maximize2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { dummyTractors } from '../../data/dummyData';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

export default function LiveTracking() {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [positions, setPositions] = useState(
    dummyTractors.reduce((acc, t, i) => ({
      ...acc,
      [t.id]: { top: 30 + i * 12, left: 25 + i * 15 }
    }), {})
  );

  // Simulate Live Movement
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          // Change position slightly (-0.2% to +0.2%)
          next[id] = {
            top: Math.max(10, Math.min(85, next[id].top + (Math.random() - 0.5) * 0.4)),
            left: Math.max(10, Math.min(85, next[id].left + (Math.random() - 0.5) * 0.4)),
          };
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 h-full lg:h-[calc(100vh-8rem)] relative overflow-hidden">
      
      {/* SIDEBAR: FLEET TERMINAL */}
      <Card className="lg:col-span-1 border-earth-dark/15/50 bg-earth-card-alt shadow-xl flex flex-col rounded-[1.5rem] h-[350px] lg:h-full order-2 lg:order-1 z-20">
        <div className="p-5 border-b border-earth-dark/15/50 bg-earth-card/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-earth-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-earth-brown">Fleet Terminal</CardTitle>
          </div>
          <Badge className="bg-earth-main border border-earth-dark/10 text-earth-sub text-[9px] font-black">{dummyTractors.length} Online</Badge>
        </div>
        <div className="p-4 border-b border-earth-dark/15/50 bg-earth-card/20">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-mut group-hover:text-earth-primary transition-colors" size={14} />
            <Input placeholder="Filter Unit ID..." className="h-10 pl-9 bg-earth-card border-earth-dark/15/50 text-xs font-bold text-earth-brown placeholder:text-earth-mut focus:border-earth-primary/50 transition-all" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide bg-earth-card/10">
          {dummyTractors.map(tractor => {
            const isSelected = selectedUnit?.id === tractor.id;
            return (
              <div 
                key={tractor.id} 
                onClick={() => setSelectedUnit(isSelected ? null : tractor)}
                className={cn(
                  "p-4 rounded-2xl transition-all cursor-pointer group border flex flex-col gap-3",
                  isSelected 
                    ? "bg-accent border-accent shadow-lg shadow-accent/20" 
                    : "bg-earth-card/50 border-earth-dark/10 hover:border-earth-dark/15"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className={cn("font-black text-xs uppercase tracking-tight", isSelected ? "text-earth-brown" : "text-earth-brown group-hover:text-earth-primary")}>{tractor.operator}</span>
                    <span className={cn("text-[8px] font-black uppercase tracking-[0.2em]", isSelected ? "text-earth-brown/60" : "text-earth-mut")}>{tractor.id}</span>
                  </div>
                  <Badge className={cn(
                    "text-[8px] px-1.5 py-0.5 font-black uppercase border",
                    isSelected 
                      ? "bg-earth-main/20 border-earth-dark/20 text-earth-brown" 
                      : tractor.status === 'available' ? 'bg-earth-primary/10 text-earth-green border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                  )}>
                    {tractor.status}
                  </Badge>
                </div>
                
                {isSelected && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-earth-dark/10 animate-in slide-in-from-top-1">
                    <div className="flex items-center gap-2 text-[10px] font-black text-earth-brown uppercase">
                       <Fuel size={12} /> 84%
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-earth-brown uppercase">
                       <Activity size={12} /> 12km/h
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* MAIN RADAR VIEW */}
      <Card className="flex-1 lg:col-span-3 border-earth-dark/15/50 shadow-2xl relative overflow-hidden bg-earth-main flex flex-col rounded-[1.5rem] min-h-[500px] order-1 lg:order-2 group">
        
        {/* Radar Background grid */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #2d321e 1px, transparent 1px), linear-gradient(to bottom, #2d321e 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
          {/* Distance Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-earth-dark/10 rounded-full opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-earth-dark/10 rounded-full opacity-60"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] border border-earth-dark/10 rounded-full opacity-80"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] border border-earth-primary/10 rounded-full"></div>
          
          {/* Radar Scanline */}
          <div className="absolute top-1/2 left-1/2 w-[50%] h-[50%] -translate-y-full origin-bottom-left animate-radar-sweep pointer-events-none opacity-40" style={{ background: 'linear-gradient(45deg, rgba(234,179,8,0.2) 0%, transparent 50%)' }}></div>
        </div>

        {/* Map Header Status */}
        <div className="absolute top-6 left-6 z-10 flex gap-4 pointer-events-none">
           <div className="bg-earth-card/80 backdrop-blur-md border border-earth-dark/15/50 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl">
              <div className="w-10 h-10 bg-earth-primary/10 rounded-xl flex items-center justify-center text-earth-primary border border-earth-primary/20">
                 <Wind size={20} className="animate-pulse" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-earth-mut uppercase tracking-widest">Active Radar</p>
                 <p className="text-sm font-black text-earth-brown uppercase tracking-tight">Sector: Punjab North</p>
              </div>
           </div>
        </div>

        <div className="absolute top-6 right-6 z-10 flex gap-2">
           <Button variant="outline" className="h-10 w-10 p-0 bg-earth-card/80 backdrop-blur-md border-earth-dark/15/50 hover:bg-earth-card-alt rounded-xl">
              <Maximize2 size={16} className="text-earth-sub" />
           </Button>
        </div>

        {/* Legend / Status Overlay */}
        <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
           <div className="bg-earth-card/80 backdrop-blur-md border border-earth-dark/10 p-4 rounded-2xl shadow-2xl">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-earth-mut mb-3">Live Fleet Status</h5>
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-earth-primary"></div>
                    <span className="text-[9px] font-black text-earth-brown uppercase tracking-widest">Available Units</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-earth-primary"></div>
                    <span className="text-[9px] font-black text-earth-brown uppercase tracking-widest">In-Progress Tasks</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-[9px] font-black text-earth-brown uppercase tracking-widest">Alerts / Hazards</span>
                 </div>
              </div>
           </div>
        </div>

        {/* UNIT MARKERS */}
        <div className="relative flex-1">
          {dummyTractors.map((tractor) => {
            const pos = positions[tractor.id];
            const isSelected = selectedUnit?.id === tractor.id;
            return (
              <div 
                key={tractor.id} 
                onClick={() => setSelectedUnit(tractor)}
                className="absolute transition-all duration-3000 ease-linear cursor-pointer group z-10"
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
              >
                {/* Marker Core */}
                <div className={cn(
                  "w-10 h-10 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover:scale-125 shadow-2xl",
                  isSelected 
                    ? "bg-earth-card-alt border-accent text-earth-brown scale-125 z-50 ring-4 ring-accent/20" 
                    : tractor.status === 'available' 
                      ? "bg-earth-card/90 border-emerald-500/50 text-earth-green" 
                      : "bg-earth-card/90 border-earth-primary/50 text-earth-primary"
                )}>
                  <Navigation size={isSelected ? 24 : 20} className={cn("transition-transform duration-[3s] rotate-45", isSelected && "text-earth-primary")} />
                  {/* Status Ring */}
                  {tractor.status === 'busy' && !isSelected && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-earth-primary animate-ping opacity-20"></div>
                  )}
                </div>

                {/* Floating Info Tag */}
                <div className={cn(
                  "absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-earth-card border border-earth-dark/15 shadow-2xl transition-all duration-300 backdrop-blur-md flex items-center gap-2 whitespace-nowrap",
                  isSelected ? "opacity-100 -translate-y-2 scale-110" : "opacity-0 scale-75 group-hover:opacity-100 group-hover:-translate-y-1"
                )}>
                   <span className="text-[9px] font-black text-earth-brown uppercase tracking-widest">{tractor.id}</span>
                   <div className="w-px h-3 bg-earth-dark/30"></div>
                   <span className="text-[9px] font-black text-earth-sub uppercase tracking-widest">{tractor.operator}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM TELEMETRY OVERLAY (Appears on selection) */}
        {selectedUnit && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-[600px] z-[60] animate-in slide-in-from-bottom-10 duration-500">
             <Card className="bg-earth-card/95 backdrop-blur-xl border border-accent/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
                            <Navigation size={32} />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-earth-brown uppercase tracking-tight leading-none mb-1">{selectedUnit.operator}</h3>
                            <div className="flex items-center gap-3">
                               <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] uppercase font-black px-2 py-0.5">{selectedUnit.id}</Badge>
                               <span className="text-[10px] font-bold text-earth-mut uppercase tracking-widest flex items-center gap-1">
                                  <MapPin size={10} /> Sector-L5, Northern Grid
                               </span>
                            </div>
                         </div>
                      </div>
                      <Button onClick={() => setSelectedUnit(null)} variant="ghost" className="h-10 w-10 p-0 text-earth-mut hover:text-earth-brown hover:bg-earth-card-alt rounded-full">
                         <X size={20} />
                      </Button>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Speed', value: '14 km/h', icon: Gauge, color: 'text-blue-400' },
                        { label: 'Fuel Left', value: '82%', icon: Fuel, color: 'text-earth-green' },
                        { label: 'Engine', value: 'Stable', icon: Activity, color: 'text-earth-primary' },
                        { label: 'Battery', value: '96%', icon: Battery, color: 'text-purple-400' }
                      ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-earth-main border border-earth-dark/10 shadow-inner flex flex-col items-center">
                           <stat.icon size={18} className={cn("mb-2", stat.color)} />
                           <span className="text-[8px] font-black text-earth-mut uppercase tracking-widest mb-1">{stat.label}</span>
                           <span className="text-xs font-black text-earth-brown uppercase whitespace-nowrap">{stat.value}</span>
                        </div>
                      ))}
                   </div>
                   
                   <div className="mt-6 pt-6 border-t border-earth-dark/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-2 text-earth-green bg-earth-primary/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                         <div className="w-1.5 h-1.5 bg-earth-primary rounded-full animate-pulse"></div> Secure Satellite Link Active
                      </div>
                      <div className="text-earth-mut group-hover:text-earth-brown transition-colors cursor-pointer flex items-center gap-1">
                         View Detailed Log <ArrowRight size={12} />
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>
        )}

      </Card>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radar-sweep {
          from { transform: translate(-50%, 0) rotate(0deg); }
          to { transform: translate(-50%, 0) rotate(360deg); }
        }
        .animate-radar-sweep {
          animation: radar-sweep 6s linear infinite;
        }
        .duration-3000 {
          transition-duration: 3000ms;
        }
      `}} />

    </div>
  );
}

function ArrowRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  );
}
