import { useState, useEffect } from 'react';
import { Truck, Search, Plus, UserPlus, Settings2, ShieldCheck, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export default function Tractors() {
  const [tractors, setTractors] = useState([]);
  const [operators, setOperators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTractor, setNewTractor] = useState({ name: '', model: '' });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tractorRes, operatorRes] = await Promise.all([
        api.admin.getTractors(),
        api.admin.getOperators()
      ]);
      setTractors(tractorRes.data || []);
      setOperators(operatorRes.data || []);
    } catch (error) {
      console.error("Failed to fetch fleet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTractor = async (e) => {
    e.preventDefault();
    if (!newTractor.name) return;
    setIsSubmitting(true);
    try {
      const result = await api.admin.createTractor(newTractor);
      if (result.success) {
        setTractors(prev => [result.data, ...prev]);
        setShowAddModal(false);
        setNewTractor({ name: '', model: '' });
      }
    } catch (error) {
      alert(error.message || "Failed to create tractor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTractor = async (id, data) => {
    setUpdatingId(id);
    try {
      const result = await api.admin.updateTractor(id, data);
      if (result.success) {
        setTractors(prev => prev.map(t => t.id === id ? { ...t, ...result.data } : t));
      }
    } catch (error) {
      alert(error.message || "Failed to update tractor");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTractors = tractors.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-earth-dark/10 pb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-earth-brown mb-1 uppercase italic font-outfit">Fleet Management</h2>
          <p className="text-[10px] tracking-[0.3em] font-black uppercase text-earth-mut flex items-center gap-2">
            <Truck size={12} className="text-earth-primary" /> Centralized Resource Control
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative group w-full lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-mut group-focus-within:text-earth-primary transition-colors" size={16} />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Fleet Units..." 
              className="pl-12 bg-earth-card border-earth-dark/10 rounded-2xl h-12 focus:ring-1 focus:ring-earth-primary/30 font-bold"
            />
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="h-12 px-6 rounded-2xl bg-accent text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-accent/20 hover:scale-[1.02] transform transition-all active:scale-95"
          >
            <Plus size={16} className="mr-2 stroke-[3]" /> Add New Tractor
          </Button>
        </div>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         {[
           { label: 'Total Fleet', value: tractors.length, icon: Truck, color: 'text-earth-brown', bg: 'bg-earth-dark/5' },
           { label: 'Active Service', value: tractors.filter(t => t.status === 'available' || t.status === 'busy').length, icon: ShieldCheck, color: 'text-earth-green', bg: 'bg-earth-primary/10' },
           { label: 'Maintenance', value: tractors.filter(t => t.status === 'maintenance').length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
         ].map((stat, i) => (
           <Card key={i} className="bg-earth-card border-earth-dark/10 shadow-sm rounded-2xl border-b-4 border-b-earth-primary/20">
              <CardContent className="p-4 flex items-center justify-between">
                 <div>
                   <p className="text-[9px] font-black text-earth-mut uppercase tracking-[0.15em] mb-0.5 font-outfit">{stat.label}</p>
                   <h3 className="text-2xl font-black text-earth-brown tracking-tighter">{stat.value.toString().padStart(2, '0')}</h3>
                 </div>
                 <div className={cn("p-3 rounded-xl shrink-0 shadow-inner", stat.bg)}>
                    <stat.icon size={18} className={stat.color} />
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      {/* Tractors List */}
      <Card className="bg-earth-card border-earth-dark/10 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-earth-dark/10 flex flex-row items-center justify-between bg-earth-card/50">
          <div>
            <CardTitle className="text-base font-black text-earth-brown uppercase tracking-wider italic font-outfit">Fleet Registry</CardTitle>
            <CardDescription className="text-[10px] font-bold text-earth-mut uppercase mt-1 tracking-[0.1em]">Verified heavy machinery assets</CardDescription>
          </div>
          <button onClick={fetchData} className="p-2.5 hover:bg-earth-card-alt rounded-2xl transition-all text-earth-mut hover:text-earth-brown border border-transparent hover:border-earth-dark/10 shadow-sm">
            <RefreshCw size={16} className={isLoading ? "animate-spin text-earth-primary" : ""} />
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-earth-dark text-earth-main">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-earth-main uppercase tracking-[0.2em]">Unit Details</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-earth-main uppercase tracking-[0.2em]">Model/Make</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-earth-main uppercase tracking-[0.2em]">Assigned Operator</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-earth-main uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-earth-main uppercase tracking-[0.2em]">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-dark/10">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <Loader2 className="animate-spin text-earth-primary" size={40} />
                          <Truck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-earth-brown/30" size={16} />
                        </div>
                        <p className="text-xs font-black text-earth-mut uppercase tracking-[0.3em] animate-pulse italic">Scanning Fleet Frequency...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTractors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center">
                      <div className="p-12 rounded-[2.5rem] bg-earth-dark/5 inline-block border-2 border-dashed border-earth-dark/10">
                         <Truck size={40} className="mx-auto text-earth-mut opacity-30 mb-4" />
                         <p className="text-xs font-black text-earth-mut uppercase tracking-widest">Zero machinery records detected</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTractors.map((tractor) => (
                  <tr key={tractor.id} className="group hover:bg-earth-primary/5 transition-all duration-300">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-earth-card-alt flex items-center justify-center text-earth-brown border border-earth-dark/10 shadow-inner group-hover:border-earth-primary/30 group-hover:scale-110 transition-all duration-300">
                            <Truck size={20} className="group-hover:text-earth-primary transition-colors" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-earth-brown group-hover:tracking-tight transition-all font-outfit">{tractor.name}</p>
                            <p className="text-[10px] font-bold text-earth-mut uppercase flex items-center gap-1 mt-0.5 tracking-tighter">
                               SN: TL-TR-{tractor.id.toString().padStart(4, '0')}
                            </p>
                         </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-earth-card text-[10px] font-black uppercase border-earth-dark/10 px-3 py-1 rounded-lg tracking-wider">
                            {tractor.model || 'Standard Unit'}
                          </Badge>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="relative group/op">
                          <select 
                            className={cn(
                              "text-xs font-black uppercase tracking-wider bg-earth-card-alt border-2 border-earth-dark/10 rounded-xl px-4 py-2 pr-10 appearance-none cursor-pointer focus:ring-2 focus:ring-earth-primary/30 transition-all w-full md:w-56",
                              !tractor.operatorId ? "text-earth-mut italic border-dashed" : "text-earth-brown border-solid"
                            )}
                            value={tractor.operatorId || ''}
                            onChange={(e) => handleUpdateTractor(tractor.id, { operatorId: e.target.value === '' ? null : e.target.value })}
                            disabled={updatingId === tractor.id || tractor.status === 'maintenance'}
                          >
                             <option value="" className="font-bold text-earth-mut">Unassigned Unit</option>
                             {operators.map(op => (
                               <option key={op.id} value={op.id} className="font-black text-earth-brown uppercase">
                                 {op.name} {op.availability === 'busy' ? '(Busy)' : ''}
                               </option>
                             ))}
                          </select>
                          <UserPlus size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-mut pointer-events-none group-hover/op:text-earth-primary transition-colors" />
                       </div>
                       {tractor.status === 'maintenance' && (
                         <p className="text-[8px] font-black text-red-500 uppercase mt-1.5 ml-1 tracking-widest flex items-center gap-1">
                           <AlertTriangle size={8} /> Assignment disabled in maintenance
                         </p>
                       )}
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={cn(
                        "text-[9px] px-3 py-1 border uppercase font-black tracking-[0.2em] h-7 rounded-lg shadow-sm border-b-2",
                        tractor.status === 'available' && 'bg-earth-primary/10 text-earth-green border-earth-primary/20',
                        tractor.status === 'busy' && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                        tractor.status === 'maintenance' && 'bg-red-500/10 text-red-500 border-red-500/20'
                      )}>
                        {tractor.status === 'available' ? 'Ready' : tractor.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          disabled={updatingId === tractor.id || tractor.status === 'busy'}
                          onClick={() => handleUpdateTractor(tractor.id, { 
                            status: tractor.status === 'maintenance' ? 'available' : 'maintenance',
                            operatorId: tractor.status === 'maintenance' ? tractor.operatorId : null 
                          })}
                          className={cn(
                            "text-[9px] px-4 font-black uppercase tracking-widest h-10 rounded-xl transition-all border-b-2 active:translate-y-0.5",
                            tractor.status === 'maintenance' 
                              ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent hover:text-white' 
                              : 'bg-earth-card-alt border-earth-dark/15 text-earth-sub hover:text-red-500 hover:border-red-500/30'
                          )}
                        >
                          {updatingId === tractor.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            tractor.status === 'maintenance' ? (
                              <><ShieldCheck size={14} className="mr-1.5" /> Return to Service</>
                            ) : (
                              <><Settings2 size={14} className="mr-1.5" /> Maintenance</>
                            )
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Tractor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-dark/60 backdrop-blur-md animate-in fade-in duration-300">
           <Card className="w-full max-w-md bg-earth-card border-earth-dark/10 shadow-2xl rounded-[2.5rem] overflow-hidden border-t-8 border-t-earth-primary animate-in zoom-in-95 duration-300">
              <CardHeader className="p-8 pb-4 border-b border-earth-dark/5">
                 <div className="w-16 h-16 rounded-3xl bg-earth-primary/10 flex items-center justify-center text-earth-primary mb-6 shadow-inner mx-auto">
                    <Truck size={32} className="stroke-[2.5]" />
                 </div>
                 <CardTitle className="text-2xl font-black text-earth-brown uppercase text-center font-outfit italic tracking-tight">Enroll Machinery</CardTitle>
                 <CardDescription className="text-center text-[10px] font-black uppercase text-earth-mut tracking-widest mt-2">New Fleet Asset Registration</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                 <form onSubmit={handleCreateTractor} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-earth-mut uppercase tracking-widest ml-1">Asset Name / Identifier</label>
                       <Input 
                         required
                         value={newTractor.name}
                         onChange={(e) => setNewTractor(prev => ({ ...prev, name: e.target.value }))}
                         placeholder="e.g., Command Unit-01" 
                         className="bg-earth-dark/5 border-earth-dark/10 rounded-2xl h-14 font-black uppercase text-sm tracking-tighter focus:ring-2 focus:ring-earth-primary/30"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-earth-mut uppercase tracking-widest ml-1">Model / Specification</label>
                       <Input 
                         value={newTractor.model}
                         onChange={(e) => setNewTractor(prev => ({ ...prev, model: e.target.value }))}
                         placeholder="e.g., Massey Ferguson 375" 
                         className="bg-earth-dark/5 border-earth-dark/10 rounded-2xl h-14 font-bold text-sm focus:ring-2 focus:ring-earth-primary/30"
                       />
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                       <Button 
                         type="button"
                         variant="outline"
                         onClick={() => setShowAddModal(false)}
                         className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] border-earth-dark/10 hover:bg-earth-card-alt text-earth-mut"
                       >
                         Cancel
                       </Button>
                       <Button 
                         type="submit"
                         disabled={isSubmitting}
                         className="flex-1 h-14 rounded-2xl bg-accent text-white font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
                       >
                         {isSubmitting ? <Loader2 className="animate-spin" /> : "Deploy Asset"}
                       </Button>
                    </div>
                 </form>
              </CardContent>
           </Card>
        </div>
      )}

    </div>
  );
}
