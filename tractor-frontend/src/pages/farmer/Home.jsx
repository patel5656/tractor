import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Star, History, Wallet, Cloud, Zap, Droplets, Calendar, Tractor, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export default function Home() {
  const [dashboardData, setDashboardData] = useState({ name: '', location: '', active_jobs: 0, total_bookings: 0, total_paid: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [dashRes, activityRes, jobsRes] = await Promise.all([
          api.farmer.getDashboard(),
          api.farmer.getRecentActivity(),
          api.farmer.getUpcomingJobs()
        ]);
        if (dashRes?.success) setDashboardData(dashRes.data);
        if (activityRes?.success) setRecentActivity(activityRes.data);
        if (jobsRes?.success) setUpcomingJobs(jobsRes.data);
      } catch (error) {
        console.error('Failed to fetch farmer dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = [
    { label: 'Total Paid', value: `₦${dashboardData.total_paid.toLocaleString()}`, icon: Wallet, color: 'text-earth-green', bg: 'bg-earth-primary/10' },
    { label: 'Active Jobs', value: dashboardData.active_jobs.toString(), icon: Zap, color: 'text-earth-primary', bg: 'bg-earth-primary/10' },
    { label: 'Total Bookings', value: dashboardData.total_bookings.toString(), icon: History, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 md:space-y-6 max-w-7xl mx-auto pb-24 md:pb-6">
      
      {/* Dark Theme Header */}
      <header className="relative bg-earth-card-alt border border-earth-dark/15/50 text-earth-brown p-4 md:p-6 rounded-[1.2rem] overflow-hidden shadow-2xl shadow-black/20">
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-earth-primary text-xs md:text-sm font-bold mb-0.5 tracking-wider uppercase">Welcome back,</p>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-earth-brown">{isLoading ? 'Loading...' : dashboardData.name}</h1>
          </div>
          <div className="px-3 py-1.5 bg-earth-card/50 border border-earth-dark/15 rounded-xl flex items-center gap-2 w-fit">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-earth-mut' : 'bg-earth-primary animate-pulse'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-earth-brown">Live Status: {isLoading ? 'Syncing...' : 'Active'}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
        
        {/* Left Column: Main Actions & Insights */}
        <div className="lg:col-span-8 space-y-5 md:space-y-6">
          {/* Stats for Left Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {stats.slice(0, 2).map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="bg-earth-card-alt border-earth-dark/15/50 rounded-[1.2rem] h-full">
                  <CardContent className="p-4 flex items-center justify-between h-full">
                    <div>
                      <p className="text-[10px] font-black text-earth-mut uppercase tracking-widest mb-1">{stat.label}</p>
                      <h3 className="text-xl font-black text-earth-brown">{isLoading ? '-' : stat.value}</h3>
                    </div>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-earth-dark/15 shadow-inner", stat.bg, stat.color)}>
                      <Icon size={20} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Activity & Insight Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-5 md:space-y-6 flex flex-col h-full">
              {/* Main CTA Card */}
              <Card className="bg-earth-primary text-earth-brown border-none shadow-[0_10px_30px_rgba(234,179,8,0.1)] relative overflow-hidden rounded-[1.2rem]">
                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none transform translate-x-2 -translate-y-2">
                  <Tractor size={80} />
                </div>
                <CardContent className="p-4 md:p-5 space-y-2.5 relative z-10">
                  <div>
                    <h2 className="text-lg md:text-xl font-black mb-1 tracking-tight uppercase italic leading-none">Need a Tractor?</h2>
                    <p className="text-earth-brown/80 font-bold text-[10px] md:text-[11px] leading-snug">Book machinery in minutes with estimated wait times.</p>
                  </div>
                  <Link to="/farmer/book" className="inline-block bg-accent text-white hover:opacity-90 px-4 py-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-lg shadow-md transition-transform hover:-translate-y-0.5 mt-1">
                    Book Now <ChevronRight className="inline ml-1" size={12} strokeWidth={3} />
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-bold text-earth-brown tracking-tight text-xs uppercase tracking-widest">Recent Activity</h3>
                  <Link to="/farmer/track" className="text-[10px] font-black text-earth-primary hover:text-earth-primary-hover uppercase tracking-widest">Track</Link>
                </div>
                
                <div className="space-y-3 flex-1">
                  {isLoading ? (
                    <Card className="bg-earth-card-alt/50 border-earth-dark/15/50 border-dashed rounded-xl">
                      <CardContent className="p-4 flex items-center justify-center h-[72px]">
                         <Clock className="animate-spin text-earth-mut" size={16} />
                      </CardContent>
                    </Card>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity, idx) => (
                      <Link key={idx} to="/farmer/track" className="block group">
                        <Card className="bg-earth-card-alt border-earth-dark/15/50 shadow-sm hover:border-earth-primary/50 hover:bg-earth-card-alt/80 transition-all rounded-xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-earth-primary"></div>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="text-[9px] font-black text-earth-primary uppercase tracking-widest leading-none mb-1">
                                {activity.status.replace('_', ' ')} : {new Date(activity.created_at).toLocaleDateString()}
                              </p>
                              <h4 className="font-black text-earth-brown text-sm group-hover:text-earth-primary transition-colors uppercase tracking-tight">{activity.service_type}</h4>
                              <p className="text-[10px] text-earth-sub font-semibold uppercase tracking-widest leading-none mt-1">{activity.land_size} Hectares</p>
                            </div>
                            <History size={18} className="text-earth-mut group-hover:text-earth-primary transition-colors" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <Card className="bg-earth-card-alt/50 border-earth-dark/15/50 border-dashed rounded-xl h-full min-h-[120px]">
                        <CardContent className="p-4 flex items-center justify-center text-[10px] font-bold text-earth-mut uppercase tracking-widest h-full">
                           No Recent Activity
                        </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Weather / Tip Card */}
            <div className="space-y-3 flex flex-col h-full">
              <h3 className="font-bold text-earth-brown tracking-tight text-xs uppercase tracking-widest px-1">Farming Insight</h3>
              <Card className="bg-earth-card-alt border-earth-dark/15/50 rounded-xl overflow-hidden flex-1">
                <CardContent className="p-4 flex flex-col justify-between h-full bg-earth-card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cloud className="text-blue-400" size={18} />
                      <span className="text-xs font-black text-earth-brown uppercase">28°C Clear</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-earth-main/50 border border-earth-dark/15/30 rounded-lg flex-1 flex flex-col justify-center">
                    <p className="text-[9px] font-bold text-earth-primary uppercase tracking-widest mb-0.5">Tip: Optimal Soil Moisture</p>
                    <p className="text-[10px] text-earth-sub leading-tight">Great time for wheat sowing. Ensure soil moisture is checked.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Widgets & Schedule */}
        <div className="lg:col-span-4 space-y-5">
          <div className="space-y-4">
            {/* Stat for Right Side */}
            <Card className="bg-earth-card-alt border-earth-dark/15/50 rounded-[1.2rem]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-earth-mut uppercase tracking-widest mb-1">{stats[2].label}</p>
                  <h3 className="text-xl font-black text-earth-brown">{isLoading ? '-' : stats[2].value}</h3>
                </div>
                {(() => {
                  const Icon = stats[2].icon;
                  return (
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-earth-dark/15 shadow-inner", stats[2].bg, stats[2].color)}>
                      <Icon size={20} />
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <Card className="bg-earth-card-alt border-earth-dark/15/50 shadow-sm rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-earth-card border border-earth-dark/15 rounded-lg flex items-center justify-center text-earth-primary shrink-0 shadow-inner">
                  <MapPin size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-earth-mut uppercase tracking-widest mb-0.5">Primary Farm</p>
                  <p className="font-bold text-earth-brown text-[11px] truncate leading-tight">
                    {isLoading ? '...' : dashboardData.location || 'Unknown Location'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-earth-card-alt border border-earth-primary/10 shadow-sm rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-earth-primary/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <CardContent className="p-4 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-earth-primary rounded-lg flex items-center justify-center text-earth-brown shrink-0 group-hover:scale-110 transition-transform shadow-[0_4px_10px_rgba(234,179,8,0.2)]">
                  <Star size={18} />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-black text-earth-brown text-xs mb-0.5 leading-none uppercase tracking-wide">Refer & Earn</h4>
                  <p className="text-[10px] text-earth-sub font-semibold leading-none">Earn ₦500 credits per referral.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Schedule */}
          <div className="space-y-3">
            <h3 className="font-bold text-earth-brown tracking-tight text-xs uppercase tracking-widest px-1">Upcoming Jobs</h3>
            <div className="space-y-2.5">
              {isLoading ? (
                <div className="bg-earth-card-alt/30 p-4 rounded-xl border border-earth-dark/10/50 text-center flex items-center justify-center h-[74px]">
                  <Clock className="animate-spin text-earth-mut" size={16} />
                </div>
              ) : upcomingJobs.length > 0 ? (
                upcomingJobs.map((job, idx) => {
                  const jobDate = new Date(job.date);
                  return (
                    <div key={idx} className="flex gap-3 items-center bg-earth-card-alt/30 p-3 rounded-xl border border-earth-dark/10/50">
                      <div className="w-10 h-10 bg-earth-card rounded-lg flex flex-col items-center justify-center border border-earth-dark/15 shrink-0">
                        <span className="text-[8px] font-black text-earth-primary uppercase leading-none mb-0.5">{jobDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-sm font-black text-earth-brown leading-none">{jobDate.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-earth-brown truncate uppercase tracking-wide leading-none">{job.service_type}</p>
                        <p className="text-[9px] text-earth-mut font-bold uppercase tracking-widest mt-1">Status: {job.status}</p>
                      </div>
                      <Calendar size={14} className="text-earth-mut" />
                    </div>
                  );
                })
              ) : (
                <div className="bg-earth-card-alt/30 p-4 rounded-xl border border-earth-dark/10/50 text-center flex items-center justify-center h-[74px]">
                   <p className="text-[10px] font-black text-earth-mut uppercase tracking-widest">No upcoming jobs</p>
                </div>
              )}
              
              <Link to="/farmer/history" className="block text-center p-2 text-[10px] font-black text-earth-mut hover:text-earth-primary border border-dashed border-earth-dark/15 rounded-lg transition-colors uppercase tracking-widest">Full Schedule</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
