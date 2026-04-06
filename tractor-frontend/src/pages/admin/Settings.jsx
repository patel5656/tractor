import { useState, useEffect } from 'react';
import { Fuel, MapPin, Banknote, Wrench, Settings as SettingsIcon, Save, Info, CheckCircle2, AlertTriangle, ShieldCheck, Trash2, Edit, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../lib/api';

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    generalInfo, fuelMetrics, zones, serviceRates, maintenanceSettings,
    updateGeneral, updateFuelPrice, refreshZones, updateServiceRates, updateMaintenance 
  } = useSettings();

  const tabFromPath = location.pathname.split('/').pop();
  const validTabs = ['fuel', 'zones', 'rates', 'maintenance'];
  const activeTab = validTabs.includes(tabFromPath) ? tabFromPath : 'general';

  const [localGeneral, setLocalGeneral] = useState(generalInfo);
  const [localFuel, setLocalFuel] = useState({ 
    dieselPrice: fuelMetrics.dieselPrice, 
    avgMileage: fuelMetrics.avgMileage 
  });
  
  // Zones are managed independently from the main Save button to allow CRUD
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneMinDistance, setNewZoneMinDistance] = useState('');
  const [newZoneMaxDistance, setNewZoneMaxDistance] = useState('');
  const [newZoneSurcharge, setNewZoneSurcharge] = useState('');
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [zoneSearchTerm, setZoneSearchTerm] = useState('');
  
  const [localRates, setLocalRates] = useState(serviceRates);
  const [localMaintenance, setLocalMaintenance] = useState(maintenanceSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    setLocalFuel({
      dieselPrice: fuelMetrics.dieselPrice,
      avgMileage: fuelMetrics.avgMileage
    });
  }, [fuelMetrics]);

  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => setSaveStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const tabs = [
    { id: 'general', label: 'General Info', icon: SettingsIcon },
    { id: 'fuel', label: 'Fuel Metrics', icon: Fuel },
    { id: 'zones', label: 'Distance Zones', icon: MapPin },
    { id: 'rates', label: 'Service Rates', icon: Banknote },
    { id: 'maintenance', label: 'Maintenance Hub', icon: Wrench },
  ];

  const handleTabChange = (tabId) => {
    navigate(`/admin/settings${tabId === 'general' ? '' : `/${tabId}`}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'general') await updateGeneral(localGeneral);
      if (activeTab === 'fuel') await updateFuelPrice(localFuel.dieselPrice, localFuel.avgMileage);
      if (activeTab === 'rates') await updateServiceRates(localRates);
      if (activeTab === 'maintenance') await updateMaintenance(localMaintenance);
      
      setSaveStatus('success');
    } catch (e) {
      console.error(e);
      // add proper error handling if needed
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveZone = async () => {
    if (!newZoneName || newZoneMinDistance === '' || newZoneMaxDistance === '' || newZoneSurcharge === '') return;
    try {
      if (editingZoneId) {
        const res = await api.admin.updateZone(editingZoneId, {
          name: newZoneName.trim(), 
          minDistance: parseFloat(newZoneMinDistance),
          maxDistance: parseFloat(newZoneMaxDistance),
          surchargePerHectare: parseFloat(newZoneSurcharge)
        });
        if (res.success) {
          await refreshZones();
          setNewZoneName('');
          setNewZoneMinDistance('');
          setNewZoneMaxDistance('');
          setNewZoneSurcharge('');
          setEditingZoneId(null);
        } else {
          console.error('Failed to update zone:', res.message);
        }
      } else {
        const res = await api.admin.createZone({ 
          name: newZoneName.trim(), 
          minDistance: parseFloat(newZoneMinDistance),
          maxDistance: parseFloat(newZoneMaxDistance),
          surchargePerHectare: parseFloat(newZoneSurcharge) 
        });
        if (res.success) {
          await refreshZones();
          setNewZoneName('');
          setNewZoneMinDistance('');
          setNewZoneMaxDistance('');
          setNewZoneSurcharge('');
        } else {
          console.error('Failed to create zone:', res.message);
        }
      }
    } catch(e) {
      console.error('Zone save error:', e);
    }
  };

  const handleEditClick = (zone) => {
    setNewZoneName(zone.name);
    setNewZoneMinDistance(zone.minDistance.toString());
    setNewZoneMaxDistance(zone.maxDistance.toString());
    setNewZoneSurcharge(zone.surchargePerHectare.toString());
    setEditingZoneId(zone.id);
  };

  const handleCancelEdit = () => {
    setNewZoneName('');
    setNewZoneMinDistance('');
    setNewZoneMaxDistance('');
    setNewZoneSurcharge('');
    setEditingZoneId(null);
  };

  const handleDeleteZone = async (id) => {
    try {
      const res = await api.admin.deleteZone(id);
      if (res.success) {
        refreshZones();
      }
    } catch(e) {
      console.error(e);
    }
  };

  const filteredZones = zones.filter(z => 
    z.name.toLowerCase().includes(zoneSearchTerm.toLowerCase()) ||
    z.minDistance?.toString().includes(zoneSearchTerm) ||
    z.maxDistance?.toString().includes(zoneSearchTerm) ||
    z.surchargePerHectare?.toString().includes(zoneSearchTerm)
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-8rem)]">
      
      {/* Settings Navigation */}
      <div className="w-full lg:w-64 shrink-0 space-y-2">
        <div className="px-5 py-2 mb-2">
          <p className="text-[10px] font-black text-earth-mut uppercase tracking-[0.2em]">System Configuration</p>
        </div>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all text-left group",
              activeTab === tab.id 
                ? "bg-earth-card-alt text-earth-brown shadow-xl border border-earth-dark/15/50 pointer-events-none" 
                : "text-earth-mut hover:bg-earth-card-alt/40 hover:text-earth-brown border border-transparent"
            )}
          >
            <div className={cn("p-2 rounded-xl border shadow-inner transition-all duration-300", activeTab === tab.id ? "bg-earth-primary/10 text-earth-primary border-earth-primary/30 scale-110" : "bg-earth-card border-earth-dark/10 text-earth-mut group-hover:border-earth-dark/15 group-hover:text-earth-sub")}>
               <tab.icon size={16} />
            </div>
            {tab.label}
          </button>
        ))}
        
        <div className="mt-8 p-6 bg-earth-card/50 border border-dashed border-earth-dark/10 rounded-3xl">
           <div className="flex items-center gap-3 mb-3 text-primary-500/50">
             <ShieldCheck size={20} />
             <span className="text-[10px] font-black uppercase tracking-widest leading-none">Global Sync Active</span>
           </div>
           <p className="text-[9px] text-earth-mut font-bold uppercase tracking-widest leading-relaxed">All node updates are broadcasted to the farmer network in real-time.</p>
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 space-y-6">
        
        <Card className="shadow-2xl border-earth-dark/15/50 bg-earth-card-alt rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-earth-dark/15/50 bg-earth-card/50 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl md:text-2xl font-black text-earth-brown uppercase tracking-tight italic flex items-center gap-3">
                   {tabs.find(t => t.id === activeTab)?.label}
                   <div className="w-2 h-2 rounded-full bg-earth-primary animate-pulse"></div>
                </CardTitle>
                <CardDescription className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-earth-mut mt-2">
                  {activeTab === 'general' && "Manage base hub identity and administrative touchpoints."}
                  {activeTab === 'fuel' && "Real-time diesel cost injection for logistics overhead mapping."}
                  {activeTab === 'zones' && "Configure distance-based surcharges and operational radii."}
                  {activeTab === 'rates' && "Modify unit economics for standard tractor operations."}
                  {activeTab === 'maintenance' && "Threshold triggers for preventive fleet service protocols."}
                </CardDescription>
              </div>
              {activeTab !== 'zones' && (
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "gap-2 font-black uppercase tracking-widest h-12 px-8 rounded-xl border-none transition-all shadow-lg",
                  saveStatus === 'success' 
                    ? "bg-primary-500 text-earth-brown scale-105" 
                    : "bg-earth-primary hover:bg-earth-primary-hover text-earth-brown"
                )}
              >
                {isSaving ? "Syncing..." : saveStatus === 'success' ? <><CheckCircle2 size={18} /> Synced</> : <><Save size={18} /> Update Node</>}
              </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1">Hub Name</label>
                      <Input 
                        value={localGeneral.hubName} 
                        onChange={(e) => setLocalGeneral({...localGeneral, hubName: e.target.value})}
                        className="bg-earth-card border-earth-dark/15 font-bold text-earth-brown h-14 rounded-2xl focus:border-earth-primary shadow-inner" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1">Main Location</label>
                      <Input 
                        value={localGeneral.hubLocation} 
                        onChange={(e) => setLocalGeneral({...localGeneral, hubLocation: e.target.value})}
                        className="bg-earth-card border-earth-dark/15 font-bold text-earth-brown h-14 rounded-2xl focus:border-earth-primary shadow-inner" 
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                     <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1">Support Email</label>
                      <Input 
                        type="email"
                        value={localGeneral.supportEmail} 
                        onChange={(e) => setLocalGeneral({...localGeneral, supportEmail: e.target.value})}
                        className="bg-earth-card border-earth-dark/15 font-bold text-earth-brown h-14 rounded-2xl focus:border-earth-primary shadow-inner" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1">Ops Email Address</label>
                      <Input 
                        type="email"
                        value={localGeneral.contactEmail} 
                        onChange={(e) => setLocalGeneral({...localGeneral, contactEmail: e.target.value})}
                        className="bg-earth-card border-earth-dark/15 font-bold text-earth-brown h-14 rounded-2xl focus:border-earth-primary shadow-inner" 
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-earth-dark/10 pt-8" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1 flex items-center gap-2"><MapPin size={12} className="text-earth-primary" /> Hub Base Latitude</label>
                    <Input 
                      type="number"
                      step="any"
                      value={localGeneral.baseLatitude} 
                      onChange={(e) => setLocalGeneral({...localGeneral, baseLatitude: parseFloat(e.target.value) || 0})}
                      className="bg-earth-card border-earth-dark/15 font-black text-earth-brown h-14 rounded-2xl focus:border-earth-primary shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1 flex items-center gap-2"><MapPin size={12} className="text-earth-primary" /> Hub Base Longitude</label>
                    <Input 
                      type="number"
                      step="any"
                      value={localGeneral.baseLongitude} 
                      onChange={(e) => setLocalGeneral({...localGeneral, baseLongitude: parseFloat(e.target.value) || 0})}
                      className="bg-earth-card border-earth-dark/15 font-black text-earth-brown h-14 rounded-2xl focus:border-earth-primary shadow-inner" 
                    />
                  </div>
                </div>
                <div className="p-4 bg-earth-primary/5 border border-earth-primary/20 rounded-2xl flex gap-3">
                  <Info size={16} className="text-earth-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-earth-brown uppercase tracking-widest mb-1">How Distance Pricing Works</p>
                    <p className="text-[9px] font-bold text-earth-sub uppercase tracking-wider leading-relaxed">
                      These Hub coordinates are used to calculate Haversine distance to each farmer (× 1.3 terrain factor = Road Distance). The road distance is then matched against <strong>Distance Zones</strong> (Track A Tiered Pricing) to determine the surcharge per hectare.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Fuel Settings */}
            {activeTab === 'fuel' && (
              <div className="max-w-md space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1">Current Diesel Price (₦/L)</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-earth-primary font-black">₦</div>
                       <Input 
                        type="number" 
                        value={localFuel.dieselPrice} 
                        onChange={(e) => setLocalFuel({...localFuel, dieselPrice: e.target.value})}
                        className="pl-10 bg-earth-card border-earth-dark/15 font-black text-2xl text-earth-brown h-16 rounded-2xl focus:border-earth-primary shadow-inner" 
                      />
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-earth-card/50 border border-earth-dark/15/50 rounded-2xl flex items-start gap-4">
                   <Fuel size={20} className="text-earth-primary mt-1 shrink-0" />
                   <div className="w-full">
                     <p className="text-[10px] font-black text-earth-brown uppercase tracking-widest mb-1">Base Fuel Multiplier</p>
                     <p className="text-[10px] font-bold text-earth-mut uppercase tracking-wider leading-relaxed mb-3">Formula: Diesel Price ÷ 800 (Stored for Phase 2)</p>
                     <div className="bg-earth-card-alt border border-earth-dark/10 p-3 rounded-xl flex items-center justify-between">
                       <span className="text-xs font-black text-earth-sub uppercase">Multiplier Value</span>
                       <span className="text-lg font-black text-earth-primary">{localFuel.dieselPrice ? (parseFloat(localFuel.dieselPrice) / 800).toFixed(4) : "0.0000"}</span>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {/* Distance Zones Settings */}
            {activeTab === 'zones' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-earth-brown uppercase">{editingZoneId ? 'Edit Zone' : 'Add New Zone'}</h3>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1">Zone Name</label>
                    <Input 
                      placeholder="e.g. Village Area"
                      value={newZoneName} 
                      onChange={(e) => setNewZoneName(e.target.value)}
                      className="bg-earth-card border-earth-dark/15 font-bold text-earth-brown h-12 rounded-xl focus:border-earth-primary shadow-inner" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1">Min Distance</label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="0"
                          value={newZoneMinDistance} 
                          onChange={(e) => setNewZoneMinDistance(e.target.value)}
                          className="bg-earth-card border-earth-dark/15 font-black text-earth-brown h-12 rounded-xl focus:border-earth-primary shadow-inner" 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-earth-mut uppercase">km</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1">Max Distance</label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="15"
                          value={newZoneMaxDistance} 
                          onChange={(e) => setNewZoneMaxDistance(e.target.value)}
                          className="bg-earth-card border-earth-dark/15 font-black text-earth-brown h-12 rounded-xl focus:border-earth-primary shadow-inner" 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-earth-mut uppercase">km</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1">Surcharge Per Hectare (₦)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-earth-primary font-black">₦</div>
                      <Input 
                        type="number" 
                        placeholder="500"
                        value={newZoneSurcharge} 
                        onChange={(e) => setNewZoneSurcharge(e.target.value)}
                        className="pl-8 bg-earth-card border-earth-dark/15 font-black text-earth-brown h-12 rounded-xl focus:border-earth-primary shadow-inner" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveZone} 
                      className="flex-1 bg-earth-primary hover:bg-earth-primary-hover text-earth-brown uppercase font-black tracking-widest rounded-xl h-12"
                    >
                      {editingZoneId ? 'Update Zone' : 'Create Zone'}
                    </Button>
                    {editingZoneId && (
                      <Button 
                        onClick={handleCancelEdit} 
                        variant="outline"
                        className="bg-earth-card-alt hover:bg-earth-card text-earth-sub uppercase font-black tracking-widest rounded-xl h-12 border-earth-dark/15"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-sm font-black text-earth-brown uppercase">Existing Zones</h3>
                  </div>
                  
                  <div className="relative group mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-mut group-focus-within:text-earth-primary transition-colors" size={16} />
                    <Input 
                      value={zoneSearchTerm}
                      onChange={(e) => setZoneSearchTerm(e.target.value)}
                      placeholder="Search zones by name or distance..." 
                      className="pl-12 bg-earth-card border-earth-dark/15 rounded-xl h-12 w-full focus:ring-0 focus:border-earth-primary shadow-inner font-bold text-earth-brown"
                    />
                  </div>

                  {filteredZones.length === 0 ? (
                    <div className="p-6 bg-earth-card/50 border border-dashed border-earth-dark/10 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-earth-mut uppercase tracking-widest">
                        {zones.length === 0 ? "No zones configured yet." : "No matching zones found."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredZones.map(z => (
                        <div key={z.id} className="p-4 bg-earth-card border border-earth-dark/10 rounded-2xl flex items-center justify-between group hover:border-earth-primary/30 transition-all">
                           <div className="flex items-center gap-3">
                             <MapPin size={18} className="text-earth-primary" />
                             <div>
                               <p className="text-xs font-black text-earth-brown uppercase tracking-wide">{z.name}</p>
                               <p className="text-[10px] font-bold text-earth-mut tracking-widest uppercase">{z.minDistance} - {z.maxDistance} KM &bull; ₦{z.surchargePerHectare}/ha</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-1">
                             <button onClick={() => handleEditClick(z)} className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-400/10 transition-colors">
                               <Edit size={16} />
                             </button>
                             <button onClick={() => handleDeleteZone(z.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-400/10 transition-colors">
                               <Trash2 size={16} />
                             </button>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3 mt-4">
                    <Info size={16} className="text-blue-500 mt-1 shrink-0" />
                    <p className="text-[10px] font-bold text-earth-sub uppercase tracking-wider leading-relaxed">
                      Farmers will select from these zones when booking. If no zone is selected, distance charge defaults to ₦0.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Service Rates Settings */}
            {activeTab === 'rates' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(localRates).map(([service, price]) => (
                    <div key={service} className="p-5 bg-earth-card rounded-3xl border border-earth-dark/10 space-y-3 group hover:border-earth-primary/30 transition-all">
                      <label className="text-[9px] uppercase font-black tracking-[0.2em] text-earth-mut pl-1 group-hover:text-earth-primary">{service} Rate (₦/ha)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-earth-mut font-bold">₦</div>
                        <Input 
                          type="number" 
                          value={price} 
                          onChange={(e) => setLocalRates({...localRates, [service]: parseInt(e.target.value)})}
                          className="pl-8 bg-earth-main border-earth-dark/10 font-black text-lg text-earth-brown h-12 rounded-xl focus:border-earth-primary shadow-inner" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3">
                   <AlertTriangle size={18} className="text-yellow-500 mt-0.5" />
                   <p className="text-[9px] font-bold text-earth-sub uppercase tracking-widest leading-relaxed">Warning: Adjusting base rates will affect all future quotes instantly. Existing bookings will retain their original lock price.</p>
                </div>
              </div>
            )}

            {/* Maintenance Settings */}
            {activeTab === 'maintenance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1">Standard Service Interval</label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={localMaintenance.serviceIntervalHours} 
                        onChange={(e) => setLocalMaintenance({...localMaintenance, serviceIntervalHours: parseInt(e.target.value)})}
                        className="bg-earth-card border-earth-dark/15 font-black text-xl text-earth-brown h-14 rounded-2xl focus:border-earth-primary shadow-inner" 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-earth-mut uppercase">hours</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-earth-sub pl-1">Pre-Alert Threshold</label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={localMaintenance.preAlertHours} 
                        onChange={(e) => setLocalMaintenance({...localMaintenance, preAlertHours: parseInt(e.target.value)})}
                        className="bg-earth-card border-earth-dark/15 font-black text-xl text-earth-brown h-14 rounded-2xl focus:border-earth-primary shadow-inner" 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-earth-mut uppercase">hours</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10 h-full flex flex-col justify-center gap-4">
                     <AlertTriangle size={32} className="text-red-500" />
                     <div className="space-y-1">
                        <p className="text-xs font-black text-earth-brown uppercase italic tracking-tight">Critical Monitoring</p>
                        <p className="text-[10px] font-bold text-earth-mut uppercase tracking-widest leading-relaxed">
                          The system will flag units for mandatory withdrawal from dispatch logic when the pre-alert threshold is reached.
                        </p>
                     </div>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
