import { useState, useEffect } from 'react';
import { Search, Download, Calendar, Tractor, X, MapPin, CheckCircle, Clock, Mail, ChevronLeft, ChevronRight, FileText, Navigation, ArrowDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useBookings } from '../../context/BookingContext';
import { cn } from '../../lib/utils';

export default function History() {
  const { bookings, loading, pagination, fetchBookings } = useBookings();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ticketStatus, setTicketStatus] = useState(null);

  // Server-side Sync Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings({
        page: 1, 
        search: searchTerm, 
        status: statusFilter === 'All' ? 'all' : statusFilter.toLowerCase()
      });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter]);

  const handlePageChange = (newPage) => {
    fetchBookings({
      page: newPage,
      search: searchTerm,
      status: statusFilter === 'All' ? 'all' : statusFilter.toLowerCase()
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(23, 23, 23);
      doc.text("TRACTORLINK", 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("FARMER SERVICE HISTORY REPORT", 14, 28);
      doc.text(`Generated: ${new Date().toLocaleString()} | Filter: ${statusFilter.toUpperCase()}`, 14, 34);

      const tableRows = bookings.map(b => [
        String(b.id).toUpperCase(),
        b.service?.name?.toUpperCase() || 'N/A',
        new Date(b.createdAt).toLocaleDateString(),
        `${b.landSize} Ha`,
        b.status.toUpperCase(),
        `₦${b.totalPrice.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['ID', 'SERVICE', 'DATE', 'LAND SIZE', 'STATUS', 'AMOUNT']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [23, 23, 23], textColor: [255, 255, 255] }
      });

      doc.save(`tractorlink_history_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadInvoice = (booking) => {
    if (!booking) return;
    setIsDownloading(true);
    try {
      const doc = new jsPDF();
      
      // 1. Branding Header
      doc.setFontSize(22);
      doc.setTextColor(23, 23, 23);
      doc.text("TRACTORLINK", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("FARMER SERVICE INVOICE", 14, 28);
      doc.text(`Transaction ID: #B-${booking.id}`, 14, 34);
      doc.text(`Date of Issue: ${new Date(booking.createdAt).toLocaleString()}`, 14, 40);

      // 2. Financial Particulars Table
      const financialParticulars = [
        ["Service Unit", (booking.serviceNameSnapshot || booking.service?.name || "N/A").toUpperCase()],
        ["Area Coverage", `${booking.landSize} Hectares`],
        ["Origin (Hub)", booking.hubName || "Main Hub"],
        ["Route Distance", `${booking.roadDistance || booking.distanceKm || 0} KM`],
        ["Base Work Rate", `Naira ${booking.basePrice.toLocaleString()}`],
        ["Distance Surcharge", booking.distanceCharge > 0 ? `Naira ${booking.distanceCharge.toLocaleString()}` : "Included"],
        ["TOTAL VALUATION", `Naira ${booking.totalPrice.toLocaleString()}`]
      ];

      autoTable(doc, {
        startY: 50,
        head: [['PARTICULAR / DESCRIPTION', 'VALUATION / CONTEXT']],
        body: financialParticulars,
        theme: 'striped',
        headStyles: { fillColor: [23, 23, 23], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
      });

      // 3. Footer / Signature
      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("This is a computer-generated invoice and requires no physical signature.", 14, finalY + 20);
      doc.text("TractorLink Logistics - Powering Green Growth.", 14, finalY + 25);

      doc.save(`tractorlink_invoice_B-${booking.id}.pdf`);
    } catch (err) {
      console.error("Invoice generation failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRequestSupport = () => {
    // Hidden as per user request to remove support button
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto relative pb-24 md:pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-earth-dark/15/50 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-earth-brown uppercase italic">Booking Archive</h1>
          <p className="text-[10px] md:text-sm text-earth-mut mt-1 font-black uppercase tracking-widest">Central Repository of Services</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-mut" size={16} />
            <input 
              type="text"
              placeholder="Search ID / Service..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-11 bg-earth-card border border-earth-dark/15 rounded-xl text-earth-brown font-bold text-sm focus:ring-2 focus:ring-earth-primary/50 outline-none w-full md:w-64 transition-all"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 bg-earth-card border border-earth-dark/15 rounded-xl text-earth-brown font-bold text-xs uppercase tracking-widest px-4 focus:ring-2 focus:ring-earth-primary/50 outline-none cursor-pointer flex-1 md:flex-none"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
            </select>

            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="h-11 gap-2 font-black uppercase tracking-widest bg-earth-primary hover:bg-earth-primary-hover text-earth-brown rounded-xl shadow-lg shadow-earth-primary/20 px-6"
            >
              {isExporting ? <Clock className="animate-spin" size={16} /> : <Download size={16} />}
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center">
            <Clock className="animate-spin mx-auto text-earth-primary mb-4" size={32} />
            <p className="text-xs font-black text-earth-brown uppercase tracking-widest">Syncing Archive...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {bookings.length > 0 ? bookings.map((booking) => (
              <motion.div
                layout
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedBooking(booking)}
                className="h-full"
              >
                <Card className="cursor-pointer bg-earth-card border border-earth-dark/10 shadow-sm hover:border-earth-primary/50 hover:bg-earth-card-alt transition-all group rounded-2xl relative overflow-hidden h-full flex flex-col">
                  <CardContent className="p-5 md:p-6 flex flex-col flex-1 relative z-10 text-left">
                    <div className="flex justify-between items-start mb-5 shrink-0">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-earth-card-alt border border-earth-dark/15 text-earth-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all">
                          <Tractor size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-earth-brown md:text-lg leading-tight group-hover:text-earth-primary transition-colors uppercase italic">{booking.service?.name}</h3>
                            <Badge className="bg-earth-card-alt text-[8px] font-black text-earth-mut border-none px-1.5 uppercase tracking-tighter">#{booking.id}</Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-earth-mut uppercase tracking-widest mt-1">
                            <Badge className={cn(
                              "text-[8px] px-2 py-0 border font-black uppercase tracking-widest",
                              booking.status === 'completed' || booking.status === 'paid' ? 'bg-earth-primary/20 text-earth-green border-emerald-500/20' : 
                              booking.status === 'pending' ? 'bg-earth-dark/10 text-earth-mut border-earth-dark/20' :
                              booking.status === 'scheduled' ? 'bg-earth-primary/10 text-earth-primary border-earth-primary/20' : 
                              booking.status === 'dispatched' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            )}>
                              {booking.status === 'dispatched' ? 'ASSIGNED' : booking.status}
                            </Badge>
                            {booking.scheduledAt ? (
                              <span className="text-[10px] font-black text-earth-primary lowercase">
                                @ {new Date(booking.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-earth-mut/60 lowercase italic">
                                {booking.status === 'scheduled' ? 'pending scheduling' : 'not scheduled'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-earth-dark/10 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-earth-mut mb-1">Total Unit</p>
                        <p className="font-bold text-earth-brown text-sm">{booking.landSize} Hectares</p>
                      </div>
                      <div className="text-right">
                        {(() => {
                           const paidAmount = booking.payments?.reduce((s, p) => s + p.amount, 0) || 0;
                           const balance = booking.totalPrice - paidAmount;
                           const pStatus = booking.paymentStatus || (booking.status === 'paid' ? 'PAID' : 'PENDING');
                           
                           return (
                             <>
                               <Badge 
                                 className={cn(
                                   "mb-1.5 text-[8px] px-2 py-0 border font-black uppercase tracking-widest",
                                   pStatus === 'PAID' ? 'bg-earth-primary/20 text-earth-green border-emerald-500/40' :
                                   pStatus === 'PARTIAL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                   'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                 )}
                               >
                                 {pStatus}
                               </Badge>
                               <p className="font-black text-earth-brown text-lg leading-none tracking-tighter">₦{booking.totalPrice?.toLocaleString()}</p>
                               {balance > 0 && paidAmount > 0 && (
                                 <p className="text-[9px] font-bold text-red-500 mt-1 uppercase tracking-tighter">Balance: ₦{balance.toLocaleString()}</p>
                               )}
                             </>
                           );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              <div className="col-span-full py-16 text-center">
                 <div className="w-16 h-16 bg-earth-card mx-auto rounded-full flex items-center justify-center text-earth-mut mb-4 shadow-inner border border-earth-dark/10">
                    <Search size={24} />
                 </div>
                 <h3 className="text-lg font-black text-earth-brown uppercase tracking-widest">No Records Found</h3>
                 <p className="text-[10px] font-bold text-earth-mut max-w-sm mx-auto mt-2">No service history matches your current filters.</p>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-earth-dark/10 pt-6">
           <p className="text-[10px] font-black text-earth-mut uppercase tracking-widest">Page {pagination.currentPage} of {pagination.totalPages}</p>
           <div className="flex gap-2">
              <Button 
                variant="ghost" size="icon" 
                disabled={pagination.currentPage === 1 || loading}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className="h-9 w-9 bg-earth-card border border-earth-dark/10 text-earth-mut hover:text-earth-brown"
              >
                <ChevronLeft size={18} />
              </Button>
              <Button 
                variant="ghost" size="icon" 
                disabled={pagination.currentPage === pagination.totalPages || loading}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className="h-9 w-9 bg-earth-card border border-earth-dark/10 text-earth-mut hover:text-earth-brown"
              >
                <ChevronRight size={18} />
              </Button>
           </div>
        </div>
      )}

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[99999] flex items-start justify-center p-6 md:p-12 overflow-y-auto bg-earth-main/95 backdrop-blur-xl pt-20 pb-20">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 -z-10"
            />
            
            <motion.div
              layoutId={selectedBooking.id}
              className="bg-earth-main border border-earth-dark/10 w-full max-w-md rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 max-h-[80vh] flex flex-col my-auto"
            >
              {/* Modal Header - More Compact */}
              <div className="p-6 border-b border-earth-dark/10 flex justify-between items-center bg-earth-dark">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-earth-primary rounded-2xl flex items-center justify-center text-earth-brown shadow-2xl">
                    <Tractor size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-earth-main uppercase italic leading-none">{selectedBooking.service?.name}</h2>
                    <p className="text-[9px] font-black text-earth-main/60 uppercase tracking-widest mt-1">#B-{selectedBooking.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="w-10 h-10 rounded-full bg-earth-card-alt flex items-center justify-center text-earth-main/60 hover:text-earth-main transition-all border border-earth-dark/15"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content - Refined Spacing */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* 1. Location Selection (Route Flow) */}
                <div className="space-y-4 text-left">
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
                          <p className="text-[9px] font-black text-earth-mut uppercase tracking-widest leading-none mb-1">Destination Point (You)</p>
                          <p className="text-sm font-black text-earth-brown truncate">
                            {selectedBooking.location || "Your Site Location"}
                          </p>
                          <p className="text-[10px] font-medium text-earth-mut truncate mt-0.5 italic text-left">
                            Zone: {selectedBooking.zoneName || "Calculated Range"}
                          </p>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="h-px bg-earth-dark/5 w-full" />

                {/* 2. Service & Financial Breakdown */}
                <div className="space-y-6 text-left">
                   {/* Schedule Status */}
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-earth-mut uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                        <Clock size={12} className="text-earth-primary" />
                        Mission Scheduling
                      </h4>
                      <div className="p-4 bg-earth-card border border-earth-dark/10 rounded-2xl flex items-center justify-between shadow-inner">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-earth-primary/5 border border-earth-primary/10 flex items-center justify-center text-earth-primary">
                               <Clock size={18} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-earth-mut uppercase tracking-[0.2em] leading-none mb-1">Scheduled Deployment</p>
                               <p className={cn(
                                 "text-sm font-black uppercase",
                                 selectedBooking.scheduledAt ? "text-earth-brown" : "text-earth-primary italic"
                               )}>
                                  {selectedBooking.scheduledAt 
                                    ? new Date(selectedBooking.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                                    : "Not Scheduled Yet"}
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Service Summary */}
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-earth-mut uppercase tracking-[0.2em] px-1">Service Particulars</h4>
                      <div className="p-4 bg-earth-main/40 rounded-2xl border border-earth-dark/10/50 space-y-3">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-earth-card border border-earth-dark/10 flex items-center justify-center text-earth-primary">
                               <Tractor size={18} />
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
                      <h4 className="text-[10px] font-black text-earth-mut uppercase tracking-[0.2em] px-1 text-left">Financial Ledger</h4>
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
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-earth-primary italic">Final Valuation</span>
                            <span className="text-lg font-black text-earth-brown tracking-tighter italic">₦{selectedBooking.totalPrice?.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* 3. Extra Info & Policy */}
                <div className="p-4 bg-earth-primary/5 rounded-2xl border border-earth-primary/10 flex gap-4 text-left">
                   <div className="w-10 h-10 rounded-xl bg-earth-primary/20 flex items-center justify-center shrink-0">
                      <Info size={16} className="text-earth-primary" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-earth-brown uppercase tracking-widest">Inclusions & Policy</p>
                      <p className="text-[9px] font-bold text-earth-mut uppercase leading-relaxed tracking-wide">
                        Quote includes full fuel allocation, professional operator deployment, and equipment mobilization.
                        <br />
                        <span className="text-earth-primary font-black italic">Valid for 48 hours for service lock.</span>
                      </p>
                   </div>
                </div>
              </div>

              {/* Modal Footer - Single Button */}
              <div className="p-6 bg-earth-card border-t border-earth-dark/10">
                <Button 
                   onClick={() => handleDownloadInvoice(selectedBooking)}
                   disabled={isDownloading}
                   className="w-full bg-earth-primary hover:bg-earth-primary-hover text-earth-brown font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg transition-all"
                >
                  {isDownloading ? <Clock className="animate-spin mr-2" size={16} /> : <FileText className="mr-2" size={16} />}
                  {isDownloading ? "Generating PDF..." : "Download Invoice"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d5c4a1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bdae93; }
      `}} />
    </div>
  );
}
