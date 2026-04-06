import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tractor, MapPin, Navigation, Mail, Info, CheckCircle, Calculator, Map as MapIcon, Loader2, ArrowRight, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { useSettings } from '../../context/SettingsContext';
import { useBookings } from '../../context/BookingContext';
import { api } from '../../lib/api';

export default function BookTractor() {
  const navigate = useNavigate();
  const { serviceRates, systemServices, zones } = useSettings();
  const { addBooking } = useBookings();
  
  const [service, setService] = useState('Ploughing');
  const [landSize, setLandSize] = useState('');
  const [location, setLocation] = useState('');
  const [farmerLatitude, setFarmerLatitude] = useState('');
  const [farmerLongitude, setFarmerLongitude] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errors, setErrors] = useState({});
  const [priceDetails, setPriceDetails] = useState({
    basePrice: 0,
    distanceKm: 0,
    distanceCharge: 0,
    fuelSurcharge: 0,
    totalPrice: 0,
    roadDistance: 0,
    zoneName: ""
  });

  // Price Preview logic
  useEffect(() => {
    const getPreview = async () => {
      if (!landSize || parseFloat(landSize) <= 0) return;
      
      setIsPreviewLoading(true);
      try {
        const result = await api.farmer.getPricePreview({
          serviceType: service.toLowerCase(),
          landSize: parseFloat(landSize),
          location: location || 'TBD',
          farmerLatitude: farmerLatitude ? parseFloat(farmerLatitude) : null,
          farmerLongitude: farmerLongitude ? parseFloat(farmerLongitude) : null
        });
        if (result.success) {
          setPriceDetails(result.data);
        }
      } catch (error) {
        console.error('Preview failed:', error);
      } finally {
        setIsPreviewLoading(false);
      }
    };

    const debounce = setTimeout(getPreview, 500);
    return () => clearTimeout(debounce);
  }, [service, landSize, location, farmerLatitude, farmerLongitude]);

  const baseRate = serviceRates[service] || 0;
  const baseTotal = priceDetails.basePrice;
  const distanceSurcharge = priceDetails.distanceCharge;
  const totalCost = priceDetails.totalPrice;

  const validate = () => {
    const newErrors = {};
    if (!landSize || parseFloat(landSize) <= 0) newErrors.landSize = "Size required";
    if (!location || location.trim() === '') newErrors.location = "Location required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookNow = async () => {
    if (!validate()) return;
    
    setIsBooking(true);
    try {
      const result = await api.farmer.createBooking({
        serviceType: service.toLowerCase(),
        landSize: parseFloat(landSize),
        location,
        farmerLatitude: farmerLatitude ? parseFloat(farmerLatitude) : null,
        farmerLongitude: farmerLongitude ? parseFloat(farmerLongitude) : null
      });
      
      if (result.success) {
        addBooking(result.data);
        setIsConfirmed(true);
        setLandSize('');
        setLocation('');
        setErrors({});
      }
    } catch (error) {
      setErrors({ general: error.message || "Connection failed" });
    } finally {
      setIsBooking(false);
    }
  };



  if (isConfirmed) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[80vh]">
        <Card className="bg-earth-card border-earth-dark/10 w-full max-w-lg p-8 text-center space-y-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-earth-primary"></div>
          <div className="w-20 h-20 bg-earth-primary/10 text-earth-green rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-500">
            <CheckCircle size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-earth-brown tracking-tight uppercase">Booking Confirmed!</h2>
            <p className="text-earth-mut font-bold text-sm uppercase tracking-widest">Order ID: #B-59203</p>
          </div>
          
          <div className="bg-earth-card-alt rounded-2xl p-6 border border-earth-dark/10 text-left space-y-4">
             <div className="flex justify-between border-b border-earth-dark/10 pb-3">
               <span className="text-[10px] font-black text-earth-mut uppercase">Service</span>
               <span className="text-sm font-black text-earth-brown uppercase">{service}</span>
             </div>
             <div className="flex justify-between border-b border-earth-dark/10 pb-3">
               <span className="text-[10px] font-black text-earth-mut uppercase">Total Amount</span>
               <span className="text-sm font-black text-earth-primary">₦{totalCost.toLocaleString()}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-[10px] font-black text-earth-mut uppercase">Assigned Time</span>
               <span className="text-sm font-black text-earth-green uppercase">Today, 3:00 PM</span>
             </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={() => navigate('/farmer/track')} 
              className="w-full bg-earth-primary hover:bg-earth-primary-hover text-earth-brown h-14 rounded-2xl font-black uppercase tracking-wide flex items-center justify-center gap-2"
            >
              Track Now <ArrowRight size={20} />
            </Button>
            <button 
              onClick={() => setIsConfirmed(false)}
              className="text-[10px] font-black text-earth-mut uppercase tracking-widest hover:text-earth-brown transition-colors"
            >
              Make another booking
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-6xl mx-auto pb-24 md:pb-6 relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-earth-card/50 p-4 rounded-2xl border border-earth-dark/10">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-earth-primary rounded-xl flex items-center justify-center text-earth-brown shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <Tractor size={20} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-earth-brown uppercase tracking-tight">Book Tractor</h1>
              <p className="text-[10px] text-earth-mut font-bold uppercase tracking-widest">Instant Rental & Quotation</p>
            </div>
          </div>
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest animate-shake">
              {errors.general}
            </div>
          )}
        </div>

      </div>

      <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-5 transition-all duration-300", isBooking && "opacity-50 pointer-events-none scale-[0.99]")}>
        
        {/* Main Booking Form */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="bg-earth-card-alt border-earth-dark/15/50 rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-5 space-y-6">
              
              {/* Service Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-earth-mut uppercase tracking-widest ml-1">Select Service</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {systemServices && systemServices.map((s) => {
                    const label = s.name.charAt(0).toUpperCase() + s.name.slice(1);
                    return (
                      <button
                        key={s.id}
                        onClick={() => setService(label)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all group",
                          service === label 
                            ? "border-earth-primary bg-earth-card" 
                            : "border-earth-dark/15 hover:border-earth-primary bg-earth-card/50"
                        )}
                      >
                        <Tractor size={18} className={cn("mb-2 transition-colors", service === label ? "text-earth-primary" : "text-earth-mut group-hover:text-earth-brown")} />
                        <span className={cn("font-black text-[11px] uppercase tracking-wide", service === label ? "text-earth-primary" : "text-earth-brown")}>{label}</span>
                        <span className={cn("text-[8px] font-bold mt-1 tracking-widest", service === label ? "text-earth-primary/80" : "text-earth-mut")}>₦{s.baseRatePerHectare}/ha</span>
                      </button>
                    );
                  })}
                </div>
                {systemServices && systemServices.find(s => s.name === service.toLowerCase())?.description && (
                  <div className="mt-4 p-3.5 bg-earth-card border border-earth-dark/10 rounded-xl flex gap-3 items-start shadow-sm transition-all group hover:border-earth-primary/30">
                    <Info size={16} className="text-earth-primary mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-earth-mut mb-1 block">Service Description</span>
                      <p className="text-xs font-bold text-earth-sub leading-relaxed">
                        {systemServices.find(s => s.name === service.toLowerCase()).description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center px-1">
                     <label className={cn("text-[10px] font-black uppercase tracking-widest", errors.landSize ? "text-red-500" : "text-earth-mut")}>Land Size (Hectares)</label>
                     {errors.landSize && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1"><X size={10} /> Required</span>}
                  </div>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="e.g. 5" 
                      value={landSize} 
                      onChange={(e) => {
                        setLandSize(e.target.value);
                        if (errors.landSize) setErrors({...errors, landSize: false});
                      }}
                      className={cn(
                        "h-12 bg-earth-card text-earth-brown font-bold rounded-xl transition-all",
                        errors.landSize ? "border-red-500 bg-red-500/5" : "border-earth-dark/15 focus:ring-earth-primary"
                      )}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-earth-mut uppercase">ha</div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center px-1">
                     <label className={cn("text-[10px] font-black uppercase tracking-widest", errors.location ? "text-red-500" : "text-earth-mut")}>Map / Village Location</label>
                     {errors.location && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1"><X size={10} /> Required</span>}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-earth-mut">
                      <MapPin size={16} />
                    </div>
                    <Input 
                      placeholder="Village name or area" 
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        if (errors.location) setErrors({...errors, location: false});
                      }}
                      className={cn(
                        "pl-10 h-12 bg-earth-card text-earth-brown font-bold rounded-xl transition-all",
                        errors.location ? "border-red-500 bg-red-500/5" : "border-earth-dark/15 focus:ring-earth-primary"
                      )} 
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left md:col-span-2">
                  <div className="flex justify-between items-center px-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-earth-mut">Farmer Coordinates (Haversine)</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Input 
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={farmerLatitude}
                        onChange={(e) => setFarmerLatitude(e.target.value)}
                        className="h-12 bg-earth-card text-earth-brown font-bold rounded-xl border border-earth-dark/15 focus:ring-earth-primary px-4"
                      />
                    </div>
                    <div className="relative">
                      <Input 
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={farmerLongitude}
                        onChange={(e) => setFarmerLongitude(e.target.value)}
                        className="h-12 bg-earth-card text-earth-brown font-bold rounded-xl border border-earth-dark/15 focus:ring-earth-primary px-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Quote Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="bg-earth-card border border-earth-dark/10 rounded-2xl overflow-hidden sticky top-5 shadow-xl">
            <div className="p-4 bg-earth-card-alt/50 border-b border-earth-dark/10 flex items-center gap-2">
              <Calculator size={16} className="text-earth-primary" />
              <h3 className="font-black text-[10px] uppercase tracking-widest text-earth-brown">Auto Quotation</h3>
            </div>
            <CardContent className="p-5 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-earth-sub">
                  <span>Base Price ({landSize || 0} ha)</span>
                  <span className="text-earth-brown">₦{baseTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-earth-sub">
                  <div className="flex flex-col">
                    <span>Distance Charge ({priceDetails.roadDistance || 0} km)</span>
                    {priceDetails.zoneName && (
                      <span className="text-[9px] text-earth-mut uppercase tracking-widest leading-none mt-1">Tier: {priceDetails.zoneName}</span>
                    )}
                  </div>
                  <span className="text-earth-brown">
                    {priceDetails.distanceCharge === 0 
                      ? "Included" 
                      : `₦${distanceSurcharge.toLocaleString()}`
                    }
                  </span>
                </div>
                <div className="pt-3 border-t border-earth-dark/10 flex justify-between items-end">
                  <span className="text-xs font-black text-earth-brown uppercase underline decoration-earth-primary underline-offset-4 decoration-2">Total Amount</span>
                  <span className="text-2xl font-black text-earth-primary tracking-tighter">₦{totalCost.toLocaleString()}</span>
                </div>
                <p className="text-[9px] text-earth-mut font-bold uppercase text-right tracking-widest">Quote valid for 48 hours</p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={handleBookNow}
                  disabled={isBooking}
                  className={cn(
                    "w-full h-12 rounded-xl font-black uppercase tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all",
                    Object.keys(errors).length > 0 ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-earth-primary hover:bg-earth-primary-hover text-earth-brown shadow-earth-primary/20"
                  )}
                >
                  {isBooking ? <Loader2 size={20} className="animate-spin" /> : Object.keys(errors).length > 0 ? "Check Fields" : "Book Now"}
                </Button>
                <a 
                  href="mailto:support@dummy.com" 
                  className="w-full border border-earth-dark/15 hover:bg-earth-card-alt text-earth-brown h-12 rounded-xl font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-colors"
                >
                  <Mail size={16} /> Email Hub
                </a>
              </div>
            </CardContent>
          </Card>


        </div>

      </div>

      {/* Loading Overlay */}
      {isBooking && (
        <div className="fixed inset-0 bg-earth-main/60 backdrop-blur-sm z-[100] flex items-center justify-center">
           <div className="bg-earth-card border border-earth-dark/10 p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl animate-in fade-in zoom-in duration-300">
              <Loader2 size={40} className="text-earth-primary animate-spin" />
              <p className="text-xs font-black text-earth-brown uppercase tracking-[0.2em]">Processing Booking...</p>
           </div>
        </div>
      )}


    </div>
  );
}
