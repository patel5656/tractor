import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, History, Search, Filter, Mail, MapPin, MoreHorizontal, Shield, ShieldOff, CheckCircle2, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export default function Farmers() {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchFarmers = async () => {
    setIsLoading(true);
    try {
      const result = await api.admin.listFarmers();
      setFarmers(result.data || []);
    } catch (error) {
      console.error("Failed to fetch farmers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUpdatingId(id);
    try {
      const result = await api.admin.updateFarmerStatus(id, newStatus);
      if (result.success) {
        setFarmers(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(error.message || "Failed to update farmer status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-earth-dark/10 pb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-earth-brown mb-1 uppercase italic">Service Consumers</h2>
          <p className="text-[10px] tracking-[0.3em] font-black uppercase text-earth-mut flex items-center gap-2">
            <Users size={12} className="text-earth-primary" /> Farmer Database Registry
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative group w-full lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-mut group-focus-within:text-earth-primary transition-colors" size={16} />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Farmers/Locations..." 
              className="pl-12 bg-earth-card border-earth-dark/10 rounded-2xl h-12 focus:ring-0 focus:border-earth-primary"
            />
          </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         {[
           { label: 'Total Enrolled', value: farmers.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
           { label: 'Active Users', value: farmers.filter(f => f.status === 'active').length, icon: Shield, color: 'text-earth-green', bg: 'bg-earth-primary/10' },
           { label: 'Dormant Accounts', value: farmers.filter(f => f.status === 'inactive').length, icon: ShieldOff, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
         ].map((stat, i) => (
           <Card key={i} className="bg-earth-card border-earth-dark/10 shadow-sm rounded-[2rem]">
              <CardContent className="p-6 flex items-center justify-between">
                 <div>
                   <p className="text-[10px] font-black text-earth-mut uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                   <h3 className="text-2xl font-black text-earth-brown">{stat.value}</h3>
                 </div>
                 <div className={cn("p-4 rounded-2xl shrink-0", stat.bg)}>
                    <stat.icon size={20} className={stat.color} />
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      {/* Farmers Table */}
      <Card className="bg-earth-card border-earth-dark/10 shadow-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-earth-dark/10 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-black text-earth-brown uppercase tracking-wider italic">Platform Users</CardTitle>
            <CardDescription className="text-[10px] font-bold text-earth-mut uppercase mt-1">Verified agricultural service consumers</CardDescription>
          </div>
          <button onClick={fetchFarmers} className="p-2 hover:bg-earth-card-alt rounded-full transition-colors text-earth-mut hover:text-earth-brown">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-earth-dark text-earth-main">
                <tr>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-earth-main uppercase tracking-[0.2em]">User Entity</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-earth-main uppercase tracking-[0.2em]">Contact & Reach</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-earth-main uppercase tracking-[0.2em]">Operations</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-earth-main uppercase tracking-[0.2em]">Account State</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-earth-main uppercase tracking-[0.2em]">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-dark/10">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-earth-primary" size={32} />
                        <p className="text-xs font-black text-earth-mut uppercase tracking-widest">Accessing Encrypted Farmer Records...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredFarmers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <p className="text-xs font-black text-earth-mut uppercase tracking-widest">No matching farmer records found in system</p>
                    </td>
                  </tr>
                ) : filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="group hover:bg-earth-card transition-colors">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-2xl bg-earth-card-alt flex items-center justify-center text-earth-brown border border-earth-dark/15 shadow-inner group-hover:border-earth-primary/30 transition-all">
                            <Users size={18} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-earth-brown">{farmer.name}</p>
                            <p className="text-[10px] font-bold text-earth-mut uppercase flex items-center gap-1 mt-0.5">
                               ID: TL-FR-{farmer.id.toString().padStart(4, '0')}
                            </p>
                         </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-earth-brown">
                             <Mail size={12} className="text-earth-mut" /> {farmer.email}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-earth-mut uppercase italic">
                             <MapPin size={10} className="text-earth-primary" /> {farmer.location}
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-earth-primary/10 rounded-lg flex items-center justify-center text-earth-primary border border-earth-primary/20">
                             <Badge className="bg-transparent border-none text-[11px] font-black">{farmer.totalBookings}</Badge>
                          </div>
                          <span className="text-[9px] font-black text-earth-mut uppercase tracking-tighter">Total Bookings</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={cn(
                        "text-[9px] px-3 py-1 border uppercase font-black tracking-widest h-6 rounded-lg",
                        farmer.status === 'active' 
                          ? 'bg-earth-primary/10 text-earth-green border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      )}>
                        {farmer.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/bookings?search=${farmer.email}`)}
                        className="text-[9px] px-4 font-black uppercase tracking-widest h-9 rounded-xl bg-earth-primary/10 text-earth-primary border-earth-primary/20 hover:bg-earth-primary hover:text-earth-brown transition-all"
                      >
                        <History size={12} className="mr-1" /> History
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        disabled={updatingId === farmer.id}
                        onClick={() => handleToggleStatus(farmer.id, farmer.status)}
                        className={cn(
                          "text-[9px] px-4 font-black uppercase tracking-widest h-9 rounded-xl transition-all",
                          farmer.status === 'active' 
                            ? 'bg-earth-card-alt border-earth-dark/15 text-earth-sub hover:text-red-500 hover:border-red-500/30' 
                            : 'bg-earth-primary/5 border-emerald-500/20 text-earth-green hover:bg-earth-primary hover:text-earth-brown'
                        )}
                      >
                        {updatingId === farmer.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          farmer.status === 'active' ? "Deactivate" : "Activate Access"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
