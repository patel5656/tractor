import { useState, useEffect } from 'react';
import { 
  Users, Tractor, Banknote, Navigation, ArrowUpRight, ArrowDownRight, 
  Activity, Clock, MapPin, CheckCircle, AlertCircle, Fuel, Battery,
  MoreVertical, ShieldCheck, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export default function Dashboard() {
  const [dispatchStatus, setDispatchStatus] = useState(null);
  
  // Dashboard state variables mapped to backend
  const [metrics, setMetrics] = useState({ active_jobs: 0, pending_dispatch: 0, fleet_ready: 0, total_revenue: 0 });
  const [dispatchQueue, setDispatchQueue] = useState([]);
  const [revenueChart, setRevenueChart] = useState({ labels: [], data: [] });
  const [fleetData, setFleetData] = useState([]);
  const [timeframe, setTimeframe] = useState('daily');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [metricsRes, queueRes, fleetRes] = await Promise.all([
          api.admin.getDashboardMetrics(),
          api.admin.getDispatchQueue(),
          api.admin.getDashboardFleet()
        ]);
        
        if (metricsRes?.success) setMetrics(metricsRes.data);
        if (queueRes?.success) setDispatchQueue(queueRes.data);
        if (fleetRes?.success) setFleetData(fleetRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setIsChartLoading(true);
        const revenueRes = await api.admin.getDashboardRevenue(timeframe);
        if (revenueRes?.success) setRevenueChart(revenueRes.data);
      } catch (error) {
        console.error('Failed to fetch revenue:', error);
      } finally {
        setIsChartLoading(false);
      }
    };
    fetchRevenueData();
  }, [timeframe]);
  
  const stats = [
    { title: 'Active Jobs', value: metrics.active_jobs, icon: Activity, trend: '+2', up: true },
    { title: 'Pending Dispatch', value: metrics.pending_dispatch, icon: Clock, trend: `${metrics.pending_dispatch} New`, up: true, highlight: metrics.pending_dispatch > 0 },
    { title: 'Fleet Ready', value: metrics.fleet_ready, icon: Tractor, trend: 'Optimal', up: true },
    { title: 'Total Revenue', value: `₦${metrics.total_revenue.toLocaleString()}`, icon: Banknote, trend: '+18%', up: true },
  ];

  const handleAssign = (bookingId) => {
    window.location.hash = `#/admin/dispatch?bookingId=${bookingId}`;
  };

  const chartMax = Math.max(...(revenueChart.data?.length ? revenueChart.data : [1000]));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((stat, i) => (
          <Card key={i} className={cn(
            "bg-earth-card-alt border-earth-dark/15/50 shadow-sm relative overflow-hidden group transition-all rounded-[1.5rem]",
            stat.highlight && "border-earth-primary/50 bg-earth-primary/[0.02]"
          )}>
            <CardContent className="p-5 md:p-6 relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-earth-mut mb-1">{stat.title}</p>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight text-earth-brown mb-1 group-hover:text-earth-primary transition-colors">{stat.value}</h3>
                </div>
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-earth-card flex items-center justify-center text-earth-primary border border-earth-dark/15 shadow-inner shrink-0",
                  stat.highlight && "text-earth-primary border-earth-primary/30"
                )}>
                  <stat.icon size={22} className={stat.highlight ? 'animate-pulse' : ''} />
                </div>
              </div>
              <div className="mt-auto flex items-center gap-2 pt-2 border-t border-earth-dark/15/50">
                <span className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-md border ${
                  stat.up ? 'bg-earth-primary/10 text-earth-green border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {stat.up && stat.trend.includes('%') ? <ArrowUpRight size={12} className="mr-0.5" /> : null}
                  {stat.trend}
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-earth-mut">Performance</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* DISPATCH QUEUE */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="bg-earth-card-alt border-earth-dark/15/50 shadow-sm rounded-[1.5rem] overflow-hidden">
            <CardHeader className="border-b border-earth-dark/15/50 pb-5 pt-6 px-6 flex flex-row items-center justify-between bg-earth-card-alt/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-earth-primary/10 rounded-lg flex items-center justify-center text-earth-primary border border-earth-primary/20">
                  <Zap size={16} />
                </div>
                <CardTitle className="text-base font-black text-earth-brown uppercase tracking-wide">Dispatch Queue</CardTitle>
              </div>
              <Badge className="bg-earth-card border-earth-dark/15 text-earth-sub text-[10px] uppercase font-black tracking-widest px-3 py-1">
                {metrics.pending_dispatch} Awaiting Assignment
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-earth-dark text-earth-main text-[10px] font-black uppercase tracking-[0.2em] border-b border-earth-dark/10">
                    <tr>
                      <th className="px-6 py-4">Farmer / ID</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Land / Location</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-dark/10">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <Clock className="animate-spin mx-auto text-earth-primary mb-4" size={24} />
                          <p className="text-[10px] font-black uppercase text-earth-mut">Syncing Dispatch Queue...</p>
                        </td>
                      </tr>
                    ) : dispatchQueue.length > 0 ? dispatchQueue.map((booking) => {
                      return (
                        <tr key={booking.id} className="group hover:bg-earth-card transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="px-2 py-1 rounded-md bg-earth-card border border-earth-dark/10 flex items-center justify-center text-[9px] uppercase tracking-widest font-black text-earth-mut">
                                {booking.id}
                              </div>
                              <span className="font-bold text-earth-brown text-sm">{booking.farmer_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-earth-dark/15 bg-earth-card/50 text-earth-brown">
                              {booking.service_type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-earth-sub">
                            <div>{booking.land_size} Hectares</div>
                            <div className="text-[10px] opacity-60 flex items-center gap-1"><MapPin size={10} /> {booking.location || 'Standard Zone'}</div>
                          </td>
                          <td className="px-6 py-4 text-xs font-black text-earth-green">
                            ₦{booking.total_price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                onClick={() => handleAssign(booking.id)}
                                disabled={dispatchStatus === booking.id}
                                variant="primary" 
                                className="bg-earth-primary hover:bg-earth-primary-hover text-earth-brown h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-earth-primary/20"
                              >
                                {dispatchStatus === booking.id ? "Assigning..." : "Assign"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-earth-mut font-bold uppercase text-[10px] tracking-widest">
                           All jobs assigned
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart Refinement */}
          <Card className="bg-earth-card-alt border border-earth-dark/10 rounded-[1.5rem] overflow-hidden">
             <div className="p-6 border-b border-earth-dark/10 flex justify-between items-center">
                <h3 className="text-sm font-black text-earth-brown uppercase tracking-widest">Revenue Analytics</h3>
                <div className="flex gap-2">
                   {['Hourly', 'Daily', 'Weekly'].map(t => {
                     const isActive = t.toLowerCase() === timeframe;
                     return (
                       <button 
                         key={t} 
                         onClick={() => setTimeframe(t.toLowerCase())}
                         className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md border transition-all", isActive ? "bg-earth-primary text-earth-brown border-earth-primary shadow-[0_0_10px_rgba(234,179,8,0.3)]" : "bg-earth-card text-earth-mut border-earth-dark/10 hover:text-earth-brown")}
                       >
                         {t}
                       </button>
                     );
                   })}
                </div>
             </div>
             <div className="p-6 h-64 relative bg-earth-card/20 flex items-end justify-around gap-2">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, #404040 1px, transparent 1px), linear-gradient(to bottom, #404040 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                
                {/* Dynamic Bar Chart Implementation based on API Data */}
                {revenueChart?.labels?.map((label, index) => {
                  const val = revenueChart.data[index] || 0;
                  const heightPercentage = Math.max((val / chartMax) * 100, 5); // Minimum 5% height

                  return (
                    <div key={index} className="flex flex-col items-center justify-end h-full z-10 w-full max-w-[40px] group">
                      <div className="text-[10px] font-black text-earth-green opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-earth-card px-2 py-1 rounded-md border border-earth-dark/15 whitespace-nowrap">₦{val.toLocaleString()}</div>
                      <div 
                        className="w-full bg-earth-primary/10 hover:bg-earth-primary/30 rounded-t-sm transition-all relative overflow-hidden border border-earth-primary/20"
                        style={{ height: `${heightPercentage}%` }}
                      >
                         <div className="absolute bottom-0 left-0 w-full bg-earth-primary opacity-50" style={{ height: '30%' }}></div>
                      </div>
                      <div className="text-[9px] uppercase font-black text-earth-mut mt-3 tracking-widest">{label}</div>
                    </div>
                  );
                })}
                {/* Empty State mapping */}
                {isChartLoading ? (
                   <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-earth-mut gap-2">
                      <Clock className="animate-spin text-earth-primary" size={14} /> Loading Data...
                   </div>
                ) : revenueChart?.labels?.length === 0 ? (
                   <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-earth-mut">
                      No recent revenue data
                   </div>
                ) : null}
             </div>
          </Card>
        </div>

        {/* FLEET MONITORING */}
        <div className="lg:col-span-4 space-y-5">
           <Card className="bg-earth-card-alt border-earth-dark/15/50 shadow-sm rounded-[1.5rem] overflow-hidden flex flex-col h-full">
            <CardHeader className="border-b border-earth-dark/15/50 pb-5 pt-6 px-6 shrink-0 bg-earth-card-alt/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-earth-primary shadow-[0_0_8px_rgba(234,179,8,0.5)] animate-pulse"></div>
                   <CardTitle className="text-base font-black text-earth-brown uppercase tracking-wide">Live Fleet</CardTitle>
                </div>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] border-emerald-500/20 text-earth-green bg-earth-primary/5 px-2">
                  Live GPS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              {/* GPS UI remains */}
              <div className="h-[200px] bg-earth-main relative flex items-center justify-center border-b border-earth-dark/10 shrink-0 group">
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #fbbf24 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                 
                 <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-earth-dark/10 rounded-full opacity-20 animate-spin-slow"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-earth-dark/10 rounded-full opacity-40"></div>
                 </div>

                 <p className="text-earth-mut font-black text-[10px] tracking-widest z-10 uppercase bg-earth-main px-4 py-1 border border-earth-dark/10 rounded-full">HQ Range: 50km</p>
                 
                 <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-earth-primary rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"><div className="absolute inset-0 bg-earth-primary rounded-full animate-ping opacity-75"></div></div>
                 <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-earth-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"><div className="absolute inset-0 bg-earth-primary rounded-full animate-ping opacity-75"></div></div>
              </div>

              <div className="p-5 space-y-3 flex-1 overflow-y-auto bg-earth-card/30 scrollbar-hide max-h-[400px]">
                 <h4 className="text-[10px] font-black text-earth-mut uppercase tracking-widest mb-1 pl-1">Operational Fleet</h4>
                 {isLoading ? (
                    <div className="py-10 text-center"><Clock className="animate-spin mx-auto text-earth-mut" size={16} /></div>
                 ) : fleetData.length === 0 ? (
                    <p className="text-[10px] font-black text-earth-mut uppercase tracking-widest text-center mt-5">No tractors found</p>
                 ) : fleetData.map((t, index) => (
                   <div key={index} className="p-4 rounded-[1.25rem] bg-earth-card-alt border border-earth-dark/15/50 hover:border-earth-primary/30 transition-all group overflow-hidden relative">
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-colors",
                            t.status === 'available' ? 'bg-earth-primary/10 text-earth-green border-emerald-500/20' : 
                            t.status === 'busy' ? 'bg-earth-primary/10 text-earth-primary border-earth-primary/20' : 
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          )}>
                             <Tractor size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-earth-brown text-sm tracking-tight">{t.operator_name}</p>
                            <p className="text-[9px] text-earth-mut font-black uppercase tracking-widest">{t.tractor_model}</p>
                          </div>
                        </div>
                        <Badge className={cn(
                          "text-[9px] px-2 py-0.5 font-black uppercase tracking-widest rounded-md",
                          t.status === 'available' ? 'bg-earth-primary/10 text-earth-green' : 
                          t.status === 'busy' ? 'bg-earth-primary/10 text-earth-primary' : 
                          'bg-red-500/10 text-red-500'
                        )}>
                          {t.status}
                        </Badge>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3 pt-3 border-t border-earth-dark/15/30">
                        <div className="flex items-center gap-2">
                           <Fuel size={12} className="text-earth-mut" />
                           <div className="flex-1 h-1 bg-earth-card rounded-full overflow-hidden">
                              <div className="h-full bg-earth-primary w-[85%] rounded-full"></div>
                           </div>
                           <span className="text-[9px] font-black text-earth-sub uppercase">85%</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Battery size={12} className="text-earth-mut" />
                           <div className="flex-1 h-1 bg-earth-card rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 w-[92%] rounded-full"></div>
                           </div>
                           <span className="text-[9px] font-black text-earth-sub uppercase">92%</span>
                        </div>
                     </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
      `}} />

      {/* SUCCESS OVERLAY FOR ASSIGNMENT */}
      {dispatchStatus && (
        <div className="fixed bottom-10 right-10 bg-emerald-600 text-earth-brown px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 duration-300 z-[100] border border-emerald-500">
           <div className="bg-earth-primary p-2 rounded-xl"><ShieldCheck size={24} /></div>
           <div>
              <p className="text-xs font-black uppercase tracking-widest">Operator Dispatched</p>
              <p className="text-[10px] font-bold opacity-80">Raju assigned to Booking {dispatchStatus}</p>
           </div>
        </div>
      )}
    </div>
  );
}
