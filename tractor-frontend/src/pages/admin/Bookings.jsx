import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Search, Filter, MoreVertical, FileText, Clock, Tractor as TractorIcon, CheckCircle2, ChevronDown, Trash2, CheckCircle, X, MapPin, Navigation, ArrowDown, Info } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useBookings } from '../../context/BookingContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Bookings() {
  const { bookings, pagination, totalCount, fetchBookings, updateBookingStatus } = useBookings();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Sync with server on filter/search/page change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings({ 
        page: pagination.currentPage, 
        status: statusFilter, 
        search: searchTerm 
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [statusFilter, searchTerm, pagination.currentPage]);

  const handleViewDetails = async (id) => {
    try {
      setLoadingDetails(true);
      setIsViewModalOpen(true);
      const res = await api.admin.getBooking(id);
      if (res.success) {
        setSelectedBooking(res.data);
      }
    } catch (err) {
      console.error("Failed to load booking details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // 1. Title & Header
      doc.setFontSize(20);
      doc.setTextColor(23, 23, 23); // Dark neutral
      doc.text("TRACTORLINK", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("OPERATIONS CONTROL | SERVICE NODE REGISTRY", 14, 28);
      doc.text(`Generated on: ${new Date().toLocaleString()} | Filter: ${statusFilter}`, 14, 34);

      // 2. Data Preparation
      const tableRows = bookings.map(b => [
        `#${String(b.id).toUpperCase()}`,
        b.farmer?.name || 'Unknown',
        b.service?.name?.toUpperCase() || 'N/A',
        `${b.landSize} Ha`,
        b.status.toUpperCase(),
        `Naira ${b.totalPrice?.toLocaleString()}`
      ]);

      // 3. Table Generation
      autoTable(doc, {
        startY: 40,
        head: [['NODE ID', 'FARMER CONTEXT', 'SERVICE UNIT', 'LAND SIZE', 'STATUS', 'REVENUE']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [23, 23, 23],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 50],
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 40 }
      });

      // 4. Save PDF
      doc.save(`tractorlink_registry_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Desktop Wrapper Card */}
      <Card className="hidden md:block shadow-2xl border-earth-dark/15/50 bg-earth-card-alt rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-earth-dark/15/50 bg-earth-card/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-earth-brown uppercase italic">Operations Control</h2>
            <p className="text-[10px] font-black text-earth-mut uppercase tracking-[0.2em] mt-2">Active Service Node Registry</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-mut group-focus-within:text-earth-primary transition-colors" size={18} />
              <Input 
                placeholder="Search nodes or farmers..." 
                className="w-full lg:w-80 pl-12 bg-earth-card border-earth-dark/15 focus:border-earth-primary text-earth-brown shadow-inner font-bold h-12 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={cn("shrink-0 border-earth-dark/15 h-12 w-12 rounded-xl transition-colors", statusFilter !== 'All' ? "bg-earth-primary/10 text-earth-primary border-earth-primary/20" : "bg-earth-card text-earth-sub hover:text-earth-brown")}
              >
                <Filter size={20} />
              </Button>
              <AnimatePresence>
                {showFilterDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-earth-card border border-earth-dark/15 rounded-xl shadow-2xl z-50 overflow-hidden p-1 flex flex-col gap-1"
                  >
                      {['All', 'Scheduled', 'In Progress', 'Completed', 'Paid'].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => { setStatusFilter(opt); setShowFilterDropdown(false); fetchBookings({ page: 1, status: opt, search: searchTerm }); }} 
                          className={cn("flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-earth-card-alt rounded-lg transition-colors text-left w-full", statusFilter === opt ? "text-earth-primary bg-earth-card-alt" : "text-earth-sub hover:text-earth-brown")}
                        >
                          {opt}
                        </button>
                      ))}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
             <Button 
               onClick={handleExport} 
               disabled={isExporting}
               className="shrink-0 bg-earth-primary hover:bg-earth-primary-hover text-earth-brown font-black uppercase tracking-widest h-12 px-6 rounded-xl shadow-lg border-none transition-all"
             >
               {isExporting ? <span className="animate-pulse">Exporting...</span> : <><FileText size={18} className="mr-2" /> Export</>}
             </Button>
           </div>
         </div>
 
         <div className="overflow-x-auto text-left">
           <table className="w-full text-sm whitespace-nowrap">
             <thead className="bg-earth-dark text-earth-main uppercase font-black text-[10px] tracking-widest border-b border-earth-dark/10">
               <tr>
                 <th className="px-8 py-6 w-24 text-earth-main">Node ID</th>
                 <th className="px-8 py-6 text-earth-main">Farmer Context</th>
                 <th className="px-8 py-6 text-earth-main">Service Params</th>
                 <th className="px-8 py-6 text-earth-main">Status</th>
                 <th className="px-8 py-6 text-earth-main">Financials</th>
                 <th className="px-8 py-6 text-right text-earth-main">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-earth-dark/10 bg-earth-card-alt">
               {bookings.length > 0 ? bookings.map((booking) => {
                 return (
                   <tr key={booking.id} className="hover:bg-earth-card transition-all group">
                     <td className="px-8 py-6">
                       <span className="font-black text-[10px] text-earth-mut bg-earth-card px-3 py-1.5 rounded-xl border border-earth-dark/10 group-hover:border-earth-primary/30 group-hover:text-earth-primary transition-all uppercase">#{String(booking.id).toUpperCase()}</span>
                     </td>
                     <td className="px-8 py-6">
                       <p className="font-black text-earth-brown text-base tracking-tight">{booking.farmer?.name || 'Unknown'}</p>
                       <p className="text-[10px] font-bold text-earth-mut uppercase tracking-widest mt-0.5">{booking.farmer?.email || 'N/A'}</p>
                     </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <TractorIcon size={16} className="text-earth-mut" />
                         <div>
                            <p className="font-black text-earth-brown uppercase text-xs">{booking.service?.name}</p>
                            <p className="text-[10px] font-bold text-earth-mut uppercase tracking-widest mt-0.5">{booking.landSize} Hectares</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={cn(
                        "text-[9px] px-3 py-0.5 border uppercase font-black tracking-[0.1em]",
                        booking.status === 'completed' || booking.status === 'paid' ? 'bg-earth-primary/20 text-earth-green border-emerald-500/20' : 
                        booking.status === 'scheduled' ? 'bg-earth-primary/10 text-earth-primary border-earth-primary/20' : 
                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      )}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-earth-brown text-lg tracking-tighter">₦{booking.totalPrice.toLocaleString()}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                         {booking.status === 'paid' ? <CheckCircle2 size={10} className="text-earth-green" /> : <Clock size={10} className="text-earth-mut" />}
                         <span className="text-[9px] font-black text-earth-mut uppercase tracking-widest">{booking.status === 'paid' ? 'PAID' : 'PENDING'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => handleViewDetails(booking.id)}
                         className="bg-earth-primary/10 text-earth-primary hover:bg-earth-primary hover:text-earth-brown font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-lg border border-earth-primary/20 transition-all"
                       >
                         <Eye size={12} className="mr-2" /> View Details
                       </Button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                     <p className="text-xs font-black text-earth-mut uppercase tracking-[0.2em]">No active nodes found in registry.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-earth-dark/15/50 bg-earth-card/50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-earth-mut">
          <span>{totalCount} Nodes Synchronized | Page {pagination.currentPage} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={pagination.currentPage <= 1}
              onClick={() => fetchBookings({ page: pagination.currentPage - 1, status: statusFilter, search: searchTerm })}
              className="bg-earth-card border-earth-dark/10 text-earth-sub font-black uppercase hover:text-earth-brown"
            >
              Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => fetchBookings({ page: pagination.currentPage + 1, status: statusFilter, search: searchTerm })}
              className="bg-earth-card border-earth-dark/10 text-earth-sub font-black uppercase hover:text-earth-brown"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Mobile Separate Cards View */}
      <div className="md:hidden space-y-4">
        <div className="flex flex-col gap-4 mb-2">
          <h2 className="text-2xl font-black tracking-tight text-earth-brown uppercase italic bg-earth-main/50 p-2 rounded-xl border border-earth-dark/10">Operations Hub</h2>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-mut" size={16} />
              <Input 
                placeholder="Filter Nodes..." 
                className="pl-10 bg-earth-card border-earth-dark/10 text-earth-brown font-bold h-12 rounded-2xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
               <Button 
                variant="outline" 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={cn("shrink-0 border-earth-dark/10 h-12 w-12 rounded-2xl", statusFilter !== 'All' ? "bg-earth-primary/10 text-earth-primary border-earth-primary/20" : "bg-earth-card text-earth-mut")}
               >
                 <Filter size={18} />
               </Button>
               {showFilterDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-earth-card border border-earth-dark/15 rounded-xl shadow-2xl z-50 p-1 flex flex-col gap-1">
                     {['All', 'Scheduled', 'In Progress', 'Completed', 'Paid'].map(opt => (
                       <button 
                         key={opt}
                         onClick={() => { setStatusFilter(opt); setShowFilterDropdown(false); fetchBookings({ page: 1, status: opt, search: searchTerm }); }} 
                         className={cn("flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-earth-card-alt rounded-lg transition-colors text-left", statusFilter === opt ? "text-earth-primary bg-earth-card-alt" : "text-earth-sub")}
                       >
                         {opt}
                       </button>
                     ))}
                  </div>
               )}
            </div>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="shrink-0 bg-earth-primary text-earth-brown px-4 font-black uppercase h-12 rounded-2xl"
            >
               <FileText size={16} />
            </Button>
          </div>
        </div>

        {bookings.length > 0 ? bookings.map((booking) => {
          return (
            <Card key={booking.id} className="shadow-2xl bg-earth-card-alt border-earth-dark/15/50 rounded-[2rem] overflow-hidden active:scale-95 transition-all group">
              <div className="p-5 bg-earth-card/40 border-b border-earth-dark/10 flex justify-between items-center">
                 <span className="text-[10px] font-black text-earth-mut uppercase tracking-widest bg-earth-card px-3 py-1 rounded-xl border border-earth-dark/15/50">NODE-#{String(booking.id).toUpperCase()}</span>
                 <Badge className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-3 py-1 border",
                  booking.status === 'completed' || booking.status === 'paid' ? 'bg-earth-primary/20 text-earth-green border-emerald-500/20' : 
                  booking.status === 'scheduled' ? 'bg-earth-primary/10 text-earth-primary border-earth-primary/20' : 
                  'bg-orange-500/10 text-orange-400 border-orange-500/20'
                )}>
                  {booking.status}
                </Badge>
              </div>
              
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-earth-brown text-xl tracking-tight leading-none">{booking.farmer?.name || 'Unknown'}</h4>
                    <p className="text-[10px] font-bold text-earth-mut uppercase tracking-widest mt-2">{booking.farmer?.email || 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={() => handleViewDetails(booking.id)}
                       className="bg-earth-primary text-earth-brown hover:bg-earth-primary-hover font-black uppercase text-[10px] tracking-widest px-4 rounded-xl h-10 border-none w-full"
                    >
                      <Eye size={14} className="mr-2" /> View Details
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-earth-card/60 rounded-2xl border border-earth-dark/10/50 shadow-inner">
                    <p className="text-[9px] font-black text-earth-mut uppercase tracking-widest mb-1.5 opacity-60">Service Unit</p>
                    <p className="text-xs font-black text-earth-primary uppercase leading-none">{booking.service?.name}</p>
                    <p className="text-[8px] font-bold text-earth-mut mt-1 uppercase italic">{booking.landSize} Hectares</p>
                  </div>
                  <div className="p-4 bg-earth-card/60 rounded-2xl border border-earth-dark/10/50 shadow-inner">
                    <p className="text-[9px] font-black text-earth-mut uppercase tracking-widest mb-1.5 opacity-60">Revenue</p>
                    <p className="text-sm font-black text-earth-brown leading-none">₦{booking.totalPrice?.toLocaleString()}</p>
                    <p className="text-[8px] font-bold text-earth-mut mt-1 uppercase italic">{booking.status === 'paid' ? 'PAID' : 'DUE'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-earth-dark/10/80">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-2xl bg-earth-card border border-earth-dark/10 text-earth-sub flex items-center justify-center">
                       <TractorIcon size={14} />
                    </div>
                    <span className="text-[10px] font-black text-earth-mut uppercase tracking-widest">
                       {booking.tractorId ? 'Fleet Assigned' : 'Awaiting Core'}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-earth-mut uppercase tracking-widest bg-earth-card px-3 py-1.5 rounded-xl border border-earth-dark/10/50">
                    {new Date(booking.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="py-12 text-center bg-earth-card/50 rounded-[2rem] border border-dashed border-earth-dark/10 mx-1">
             <p className="text-[10px] font-black text-earth-mut uppercase tracking-widest">No matching node activity.</p>
          </div>
        )}

        <div className="p-4 flex items-center justify-between">
           <Button 
            variant="outline" 
            disabled={pagination.currentPage <= 1}
            onClick={() => fetchBookings({ page: pagination.currentPage - 1, status: statusFilter, search: searchTerm })}
            className="flex-1 bg-earth-card border-earth-dark/10 text-earth-sub font-black uppercase text-[10px]"
          >
            Prev
          </Button>
          <span className="px-4 text-[10px] font-black text-earth-mut">PAGE {pagination.currentPage}</span>
          <Button 
            variant="outline" 
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => fetchBookings({ page: pagination.currentPage + 1, status: statusFilter, search: searchTerm })}
            className="flex-1 bg-earth-card border-earth-dark/10 text-earth-sub font-black uppercase text-[10px]"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-6 md:p-12 overflow-y-auto bg-earth-main/80 backdrop-blur-sm pt-20 pb-20">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewModalOpen(false)}
              className="fixed inset-0 -z-10"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-earth-card border border-earth-dark/15/50 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col max-h-[80vh] my-auto"
            >
              <div className="p-6 border-b border-earth-dark/10 flex items-center justify-between bg-earth-main/20">
                <div>
                   <h3 className="text-xl font-black text-earth-brown uppercase italic tracking-tight">Booking Context</h3>
                   <p className="text-[9px] font-black text-earth-mut uppercase tracking-[0.2em] mt-1">Registry Node: # {selectedBooking.id}</p>
                </div>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="h-10 w-10 rounded-xl bg-earth-card border border-earth-dark/10 text-earth-mut flex items-center justify-center hover:text-earth-brown hover:bg-earth-card-alt transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 text-left">
                {/* 1. Location Selection (Route Flow) */}
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-earth-mut uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                     <Navigation size={12} className="text-earth-primary" />
                     Service Route Visualization
                   </h4>
                   <div className="relative pl-10 space-y-6">
                      {/* Vertical Line */}
                      <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-dashed border-l border-dashed border-earth-dark/20" />
                      
                      {/* From: Hub */}
                      <div className="relative">
                        <div className="absolute -left-[30px] top-0 w-5 h-5 rounded-full bg-earth-card border-2 border-earth-primary flex items-center justify-center z-10 shadow-sm">
                           <div className="w-1.5 h-1.5 rounded-full bg-earth-primary" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-earth-mut uppercase tracking-widest leading-none mb-1">Origin Point (Hub)</p>
                          <p className="text-sm font-black text-earth-brown truncate">
                            {selectedBooking.hubName || "TractorLink Main Hub"}
                          </p>
                          <p className="text-[10px] font-medium text-earth-mut truncate mt-0.5">
                            {selectedBooking.hubLocation || "Operational Base Registry"}
                          </p>
                        </div>
                      </div>

                      {/* Distance Indicator Overlay */}
                      <div className="relative py-2">
                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-earth-main border border-earth-dark/10 rounded-full text-[10px] font-black text-earth-primary uppercase tracking-widest shadow-sm">
                            <ArrowDown size={10} />
                            {selectedBooking.roadDistance || selectedBooking.distanceKm || 0} KM Road Distance
                         </div>
                      </div>

                      {/* To: Farmer */}
                      <div className="relative">
                        <div className="absolute -left-[30px] top-0 w-5 h-5 rounded-full bg-earth-primary flex items-center justify-center z-10 shadow-lg shadow-earth-primary/30">
                           <MapPin size={10} className="text-earth-brown" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-earth-mut uppercase tracking-widest leading-none mb-1">Destination Point (Farmer)</p>
                          <p className="text-sm font-black text-earth-brown truncate">
                            {selectedBooking.location || "Farmer Site Location"}
                          </p>
                          <p className="text-[10px] font-medium text-earth-mut truncate mt-0.5 italic">
                            Zone: {selectedBooking.zoneName || "Calculated Range"}
                          </p>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="h-px bg-earth-dark/5 w-full" />

                {/* 2. Service & Financial Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Service Summary */}
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-earth-mut uppercase tracking-[0.2em] px-1">Service Particulars</h4>
                      <div className="p-4 bg-earth-main/40 rounded-2xl border border-earth-dark/10/50 space-y-3">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-earth-card border border-earth-dark/10 flex items-center justify-center text-earth-primary">
                               <TractorIcon size={18} />
                            </div>
                            <div>
                               <p className="text-sm font-black text-earth-brown uppercase italic leading-none">{selectedBooking.serviceNameSnapshot || selectedBooking.service?.name}</p>
                               <p className="text-[10px] font-bold text-earth-mut mt-1">{selectedBooking.landSize} Hectares Coverage</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Price Ledger */}
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-earth-mut uppercase tracking-[0.2em] px-1">Financial Ledger</h4>
                      <div className="p-4 bg-earth-card border border-earth-dark/10 rounded-2xl shadow-inner space-y-3">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-earth-mut">
                            <span>Base Work Rate</span>
                            <span className="text-earth-brown">₦{selectedBooking.basePrice?.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-earth-mut">
                            <span>Distance Logistics</span>
                            <span className="text-earth-brown">₦{selectedBooking.distanceCharge?.toLocaleString()}</span>
                         </div>
                         <div className="h-px bg-earth-dark/10 my-1" />
                         <div className="flex justify-between items-center bg-earth-primary/10 -mx-4 px-4 py-2">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-earth-primary italic">Total Valuation</span>
                            <span className="text-base font-black text-earth-brown tracking-tighter italic">₦{selectedBooking.totalPrice?.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* 3. Extra Info & Policy */}
                <div className="p-4 bg-earth-primary/5 rounded-2xl border border-earth-primary/10 flex gap-4">
                   <div className="w-10 h-10 rounded-xl bg-earth-primary/20 flex items-center justify-center shrink-0">
                      <Info size={16} className="text-earth-primary" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-earth-brown uppercase tracking-widest">Inclusions & Policy</p>
                      <p className="text-[9px] font-bold text-earth-mut uppercase leading-relaxed tracking-wide">
                        Quote includes full fuel allocation, professional operator deployment, and equipment mobilization.
                        <br />
                        <span className="text-earth-primary font-black italic">Valid for 48 hours from Registry Sync Date.</span>
                      </p>
                   </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-3 pt-2">
                   <Badge className={cn(
                     "text-[8px] px-3 py-1 font-black uppercase tracking-widest border border-earth-dark/10 shadow-sm",
                     selectedBooking.status === 'completed' || selectedBooking.status === 'paid' ? 'bg-earth-primary/20 text-earth-green border-emerald-500/20' : 'bg-earth-primary/10 text-earth-primary border-earth-primary/20'
                   )}>{selectedBooking.status}</Badge>
                   <Badge className={cn(
                     "text-[8px] px-3 py-1 font-black uppercase tracking-widest border border-earth-dark/10 shadow-sm",
                     selectedBooking.status === 'paid' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                   )}>{selectedBooking.status === 'paid' ? 'Financials Settled' : 'Payment Pending'}</Badge>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-earth-dark/10 bg-earth-main/40 flex justify-end">
                 <Button 
                   onClick={() => setIsViewModalOpen(false)}
                   className="bg-earth-card-alt hover:bg-earth-card text-earth-sub hover:text-earth-brown font-black uppercase text-[10px] tracking-widest px-6 h-10 rounded-xl border border-earth-dark/15 transition-all"
                 >
                   Sync Close
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="space-y-1.5 text-left">
      <p className="text-[9px] font-black text-earth-mut uppercase tracking-[0.2em]">{label}</p>
      {value}
    </div>
  );
}
