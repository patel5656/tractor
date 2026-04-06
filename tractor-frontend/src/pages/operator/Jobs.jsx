import { MapPin, ArrowRight, Play, CheckCircle2, Navigation2, Clock, Map as MapIcon, Zap, Droplets, Thermometer, Wind, Activity, Timer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../../components/ui/Card';

export default function Jobs() {
  const [jobData, setJobData] = useState({ current_job: null, queue: [] });
  const [statsData, setStatsData] = useState({ hectares_done: 0, fuel_efficiency: 0, shift_time: '00:00', unit_health: 0 });
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, statsRes] = await Promise.all([
        api.operator.getJobs(),
        api.operator.getStats()
      ]);
      if (jobsRes.success) setJobData(jobsRes.data);
      if (statsRes.success) setStatsData(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch operator data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeJob = jobData.current_job;
  const upcomingJobs = jobData.queue;

  const stats = [
    { label: 'Hectares Done', value: statsData.hectares_done.toFixed(1), unit: 'HA', icon: MapIcon, color: 'text-earth-green' },
    { label: 'Fuel Efficiency', value: statsData.fuel_efficiency.toFixed(1), unit: 'L/HA', icon: Zap, color: 'text-amber-400' },
    { label: 'Shift Time', value: statsData.shift_time, unit: 'HRS', icon: Timer, color: 'text-blue-400' },
    { label: 'Unit Health', value: statsData.unit_health, unit: '%', icon: Activity, color: 'text-earth-primary' },
  ];

  const weather = [
    { label: 'Temp', value: '28°C', icon: Thermometer },
    { label: 'Humidity', value: '45%', icon: Droplets },
    { label: 'Wind', value: '12km/h', icon: Wind },
  ];

  const getStatusAction = (status) => {
    switch (status) {
      case 'dispatched':
        return { label: 'Start En Route', next: 'en_route', color: 'bg-earth-primary/20 hover:bg-earth-primary/30 text-earth-brown border border-earth-primary/30' };
      case 'en_route':
        return { label: 'Start Work', next: 'in_progress', color: 'bg-earth-primary/40 hover:bg-earth-primary/50 text-earth-brown border border-earth-primary/40' };
      case 'in_progress':
        return { label: 'Mark Completed', next: 'completed', color: 'bg-earth-primary hover:bg-earth-primary-hover text-earth-brown' };
      default:
        return null;
    }
  };

  const currentAction = activeJob ? getStatusAction(activeJob.status) : null;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto pb-24 md:pb-8">
      
      {/* Header with Weather integration */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-earth-dark/10 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-earth-brown tracking-tight uppercase italic">Active Mission Control</h1>
          <p className="text-[9px] uppercase font-black tracking-[0.2em] text-earth-mut mt-1.5">Fleet Unit #T24 Deployment Dashboard</p>
        </div>
        
        <div className="flex items-center gap-4 bg-earth-card/50 border border-earth-dark/10/50 px-4 py-2.5 rounded-2xl shadow-inner divide-x divide-earth-dark/10">
           {weather.map((w, i) => (
             <div key={i} className={cn("flex items-center gap-2.5 px-3", i === 0 && "pl-0")}>
                <w.icon size={14} className="text-earth-mut" />
                <span className="text-[10px] font-black text-earth-brown uppercase tracking-widest">{w.value}</span>
             </div>
           ))}
        </div>
      </header>

      {/* Real-time Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {stats.map((s, i) => (
           <motion.div 
             key={i} 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="bg-earth-card border border-earth-dark/10/50 p-4 rounded-2xl relative overflow-hidden group hover:border-earth-dark/15 transition-all"
           >
              <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                 <s.icon size={50} />
              </div>
              <p className="text-[8px] font-black text-earth-mut uppercase tracking-widest mb-1.5">{s.label}</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-lg font-black text-earth-brown tabular-nums">{loading ? '---' : s.value}</span>
                 <span className={cn("text-[9px] font-black uppercase tracking-widest", s.color)}>{s.unit}</span>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Column: Active Job */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-earth-primary font-black uppercase tracking-widest text-[9px] mb-1 pl-1">
            <div className="w-1.5 h-1.5 bg-earth-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div> Primary Objective
          </div>
          
          <div className="bg-earth-card border border-earth-dark/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group hover:border-earth-primary/30 transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000">
              <Play size={200} />
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl md:text-3xl font-black text-earth-brown tracking-tighter italic leading-none truncate">
                  {activeJob?.service?.name?.toUpperCase() || 'STANDBY'}
                </h2>
                <div className="flex items-center gap-2.5 mt-4">
                   <div className="bg-earth-primary/5 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-earth-green font-black text-[9px] uppercase tracking-widest shadow-inner">
                      {activeJob?.landSize || 0} Hectares
                   </div>
                   <div className="bg-earth-card-alt px-2.5 py-1 rounded-lg text-earth-mut font-black text-[9px] uppercase tracking-widest">
                      ID: #{activeJob?.id || '---'}
                   </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="bg-earth-primary text-earth-brown px-3 py-1.5 rounded-lg text-[9px] font-black tracking-[0.15em] shadow-[0_4px_15px_rgba(234,179,8,0.2)] uppercase italic">
                   {activeJob?.status?.replace('_', ' ').toUpperCase() || 'AWAITING'}
                </span>
              </div>
            </div>

            <div className="bg-earth-main border border-earth-dark/10/50 p-4 md:p-5 rounded-2xl mb-8 flex gap-4 items-center shadow-inner group-hover:bg-earth-card transition-colors">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-earth-card rounded-xl flex items-center justify-center text-earth-primary border border-earth-dark/10 shadow-sm shrink-0">
                 <MapPin size={20} />
               </div>
               <div className="min-w-0">
                 <p className="text-[8px] text-earth-mut font-black uppercase tracking-widest mb-1 leading-none">Vector Coordinates</p>
                 <p className="text-sm md:text-base text-earth-brown font-black tracking-tight truncate">
                   {activeJob?.location?.toUpperCase() || 'TARGET SECTOR UNAVAILABLE'}
                 </p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {currentAction ? (
                <Link 
                  to="/operator/status"
                  className={cn(
                    "flex-1 text-earth-brown font-black px-6 py-4 rounded-xl flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.98] text-sm uppercase tracking-widest border-none",
                    currentAction.color
                  )}
                >
                  {currentAction.label} <ArrowRight size={18} />
                </Link>
              ) : (
                <div className="flex-1 bg-earth-card-alt text-earth-mut font-black px-6 py-4 rounded-xl flex items-center justify-center gap-2.5 text-sm uppercase tracking-widest border border-earth-dark/15">
                  No Active Actions
                </div>
              )}
              <Link to="/operator/navigation" className="sm:w-[40%] bg-earth-card-alt text-earth-sub font-black px-4 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-earth-card hover:text-earth-brown transition-all border border-earth-dark/15 uppercase tracking-widest text-xs">
                <Navigation2 size={16} /> Scan Radar
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Queue & Unit Health */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-earth-dark/10 pb-4">
              <h3 className="text-[10px] font-black text-earth-mut uppercase tracking-widest">Awaiting Deployment</h3>
              <span className="bg-earth-card border border-earth-dark/10 text-earth-primary px-2 py-0.5 rounded-lg text-[9px] font-black shadow-inner tabular-nums">{loading ? '...' : upcomingJobs.length}</span>
            </div>
            
            <div className="space-y-3">
              {upcomingJobs.length > 0 ? upcomingJobs.map(job => (
                <motion.div 
                  whileHover={{ x: 4 }}
                  key={job.id} 
                  className="bg-earth-card/80 border border-earth-dark/10 rounded-2xl p-4 flex gap-4 hover:border-earth-primary/20 hover:bg-earth-card transition-all group cursor-pointer shadow-sm relative overflow-hidden"
                >
                  <div className="bg-earth-main border border-earth-dark/30 text-earth-sub w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-[9px] shrink-0 shadow-inner group-hover:text-earth-primary group-hover:border-earth-primary/30 transition-colors">
                    <span className="text-[7px] text-earth-mut uppercase tracking-tighter mb-0.5 font-bold">UNIT</span>
                    #{job.id}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h4 className="font-black text-earth-brown text-sm tracking-tight group-hover:text-earth-primary transition-colors italic truncate">
                      {job.farmer?.name || 'Unknown Client'}
                    </h4>
                    <p className="text-[9px] uppercase font-black text-earth-mut tracking-widest mt-1 truncate">{job.service?.name} • {job.landSize} ha</p>
                  </div>
                  <div className="flex items-center text-earth-sub group-hover:text-earth-primary transition-all pr-1">
                    <ArrowRight size={16} />
                  </div>
                </motion.div>
              )) : (
                <div className="bg-earth-card/30 border-2 border-dashed border-earth-dark/10/50 rounded-[2rem] p-10 text-center">
                  <MapIcon className="w-8 h-8 text-earth-mut mx-auto mb-3 opacity-20" />
                  <p className="font-black uppercase tracking-[0.2em] text-[8px] text-earth-mut">Queue Terminal Clear</p>
                </div>
              )}
            </div>
          </div>

          {/* Unit Diagnostics Card */}
          <div className="bg-earth-card/50 border border-earth-dark/10 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
             <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-earth-primary/5 blur-3xl rounded-full" />
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-earth-brown uppercase tracking-widest">Diagnostics</h3>
                <Badge className="bg-earth-primary/10 text-earth-green border-none font-black text-[8px] uppercase">All Systems Nominal</Badge>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 px-3 py-2 bg-earth-main/50 rounded-xl border border-earth-dark/10">
                   <p className="text-[7px] font-black text-earth-mut uppercase">Engine Temp</p>
                   <p className="text-xs font-black text-earth-brown">82°C <span className="text-[8px] text-earth-green ml-1">NORMAL</span></p>
                </div>
                <div className="space-y-1.5 px-3 py-2 bg-earth-main/50 rounded-xl border border-earth-dark/10">
                   <p className="text-[7px] font-black text-earth-mut uppercase">Oil Pressure</p>
                   <p className="text-xs font-black text-earth-brown">45 PSI <span className="text-[8px] text-earth-green ml-1">NORMAL</span></p>
                </div>
                <div className="space-y-1.5 px-3 py-2 bg-earth-main/50 rounded-xl border border-earth-dark/10">
                   <p className="text-[7px] font-black text-earth-mut uppercase">Hydraulics</p>
                   <p className="text-xs font-black text-earth-brown">OPTIMAL <span className="text-[8px] text-earth-green ml-1">100%</span></p>
                </div>
                <div className="space-y-1.5 px-3 py-2 bg-earth-main/50 rounded-xl border border-earth-dark/10">
                   <p className="text-[7px] font-black text-earth-mut uppercase">Signal</p>
                   <p className="text-xs font-black text-earth-brown">5G HUB <span className="text-[8px] text-earth-primary ml-1">HIGH</span></p>
                </div>
             </div>
          </div>
          
          <div className="pt-2 text-center">
            <button className="text-[9px] font-black text-earth-mut hover:text-earth-brown underline uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
              <Activity size={12} /> View Mission Logs
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

// Simple Badge component utility
function Badge({ children, className }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-lg font-black tracking-widest", className)}>
      {children}
    </span>
  );
}
