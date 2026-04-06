import { useState, useEffect } from 'react';
import { MapPin, Globe, LogOut, ChevronRight, Edit3, KeyRound, CheckCircle, X, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export default function Profile() {
  const { logout } = useAuth();
  const [farmer, setFarmer] = useState({
    name: 'Loading...',
    email: 'Loading...',
    location: 'Loading...',
    total_bookings: 0,
    language: 'en'
  });
  
  const [activeModal, setActiveModal] = useState(null); // 'edit' | 'password' | 'language'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editForm, setEditForm] = useState({ name: '', location: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.farmer.getProfile();
      if (res.success) {
        setFarmer(res.data);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const openEditModal = () => {
    setEditForm({ name: farmer.name, location: farmer.location });
    setActiveModal('edit');
  };

  const handleSaveProfile = async () => {
    if (!editForm.name || !editForm.location) {
      alert("Name and Location are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.farmer.updateProfile(editForm);
      if (res.success) {
        setFarmer(prev => ({ ...prev, name: res.data.name, location: res.data.location }));
        setActiveModal(null);
      }
    } catch (error) {
      alert(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      alert("Both password fields are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.farmer.changePassword(passwordForm);
      if (res.success) {
        alert("Password updated successfully!");
        setActiveModal(null);
        setPasswordForm({ oldPassword: '', newPassword: '' });
      }
    } catch (error) {
      alert(error.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageChange = async (langCode) => {
    try {
      const res = await api.farmer.updateLanguage({ language: langCode });
      if (res.success) {
        setFarmer(prev => ({ ...prev, language: langCode }));
        localStorage.setItem('tractorlink_lang', langCode);
        setActiveModal(null);
        window.location.reload();
      }
    } catch (error) {
      alert("Failed to update language");
    }
  };

  const menuItems = [
    { id: 'edit', icon: Edit3, label: 'Edit Profile', onClick: openEditModal },
    { id: 'password', icon: KeyRound, label: 'Change Password', onClick: () => setActiveModal('password') },
    { id: 'language', icon: Globe, label: 'Interface Language', value: farmer.language === 'en' ? 'English (INT)' : 'Naira (NGN)', onClick: () => setActiveModal('language') },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto relative pb-24 md:pb-8">
      <div className="space-y-6">
        
        {/* Profile Card */}
        <Card className="bg-earth-card border border-earth-dark/10 shadow-xl overflow-hidden rounded-3xl group">
          <CardContent className="p-6 md:p-8 flex flex-col items-center text-center relative z-10">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-earth-card-alt text-earth-brown text-3xl font-black rounded-3xl flex items-center justify-center shadow-lg border border-earth-dark/15 relative overflow-hidden mb-5">
                <span className="uppercase">{farmer.name.charAt(0)}</span>
                <div className="absolute bottom-0 w-full h-1 bg-earth-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-earth-brown italic leading-tight">{farmer.name}</h1>
            <p className="text-[10px] text-earth-sub font-bold uppercase tracking-widest mt-1 z-10">{farmer.email}</p>
            
            <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <div className="bg-earth-card-alt/30 border border-earth-dark/10/50 p-3 rounded-2xl flex items-center justify-center gap-2.5">
                  <MapPin size={16} className="text-earth-primary" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-earth-brown truncate">{farmer.location}</span>
                </div>
                <div className="bg-earth-card-alt/30 border border-earth-dark/10/50 p-3 rounded-2xl flex items-center justify-center gap-2.5">
                  <History size={16} className="text-blue-400" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-earth-brown">{farmer.total_bookings} Bookings</span>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Menu */}
        <div>
          <h3 className="font-black text-earth-brown text-lg md:text-xl uppercase italic px-1 mb-3">Preferences</h3>
          
          <div className="bg-earth-card rounded-3xl shadow-xl border border-earth-dark/10/50 overflow-hidden divide-y divide-earth-dark/10">
            {menuItems.map((item, idx) => (
              <button 
                key={idx} 
                onClick={item.onClick}
                className="w-full flex items-center justify-between p-5 hover:bg-earth-card-alt cursor-pointer transition-all group relative"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-earth-card-alt border border-earth-dark/15 text-earth-mut flex items-center justify-center transition-all group-hover:text-earth-green">
                    <item.icon size={18} />
                  </div>
                  <span className="font-black text-sm text-earth-brown group-hover:text-earth-brown transition-colors uppercase italic">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {item.value && <span className="text-[9px] uppercase tracking-widest font-black text-earth-mut bg-earth-card-alt px-2.5 py-1 rounded shadow-inner">{item.value}</span>}
                  <ChevronRight size={18} className="text-earth-mut group-hover:text-earth-green transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4">
            <Button 
               onClick={logout} 
               className="w-full text-red-500 hover:text-earth-brown bg-red-500/5 hover:bg-red-500 font-black tracking-[0.2em] uppercase justify-center h-14 text-[10px] md:text-sm rounded-2xl border-2 border-red-500/10 transition-all shadow-xl hover:shadow-red-500/10 group"
            >
              <LogOut size={18} className="mr-3 group-hover:animate-pulse" /> SIGN OUT
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-earth-main/90 backdrop-blur-md" />
            
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 10 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               exit={{ scale: 0.95, opacity: 0, y: 10 }}
               className="bg-earth-main border border-earth-dark/10 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-5 border-b border-earth-dark/10 flex justify-between items-center bg-earth-card/30">
                 <h3 className="font-black text-base text-earth-brown uppercase italic tracking-tight">{
                   menuItems.find(i => i.id === activeModal)?.label || 'Action'
                 }</h3>
                 <button onClick={() => setActiveModal(null)} className="text-earth-mut hover:text-earth-brown transition-colors p-1"><X size={18} /></button>
              </div>

              <div className="p-6">
                 {/* Edit Profile Modal */}
                 {activeModal === 'edit' && (
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black tracking-widest text-earth-mut pl-1">Full Name</label>
                        <Input 
                           value={editForm.name}
                           onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))}
                           className="bg-earth-card border-earth-dark/10 text-earth-brown font-black h-12 rounded-xl focus:border-emerald-500 px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black tracking-widest text-earth-mut pl-1">Location / Region</label>
                        <Input 
                           value={editForm.location}
                           onChange={e => setEditForm(prev => ({...prev, location: e.target.value}))}
                           className="bg-earth-card border-earth-dark/10 text-earth-brown font-black h-12 rounded-xl focus:border-emerald-500 px-4"
                        />
                      </div>
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl mt-2 font-black uppercase tracking-widest text-[10px] bg-earth-primary text-earth-brown hover:bg-earth-primary-hover border-none shadow-lg disabled:opacity-50"
                      >
                         {isSubmitting ? "Saving..." : "Save Profile"}
                      </Button>
                   </div>
                 )}

                 {/* Password Change Modal */}
                 {activeModal === 'password' && (
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black tracking-widest text-earth-mut pl-1">Current Password</label>
                        <Input 
                           type="password"
                           value={passwordForm.oldPassword}
                           onChange={e => setPasswordForm(prev => ({...prev, oldPassword: e.target.value}))}
                           className="bg-earth-card border-earth-dark/10 text-earth-brown font-black h-12 rounded-xl focus:border-emerald-500 px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black tracking-widest text-earth-mut pl-1">New Password</label>
                        <Input 
                           type="password"
                           value={passwordForm.newPassword}
                           onChange={e => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                           className="bg-earth-card border-earth-dark/10 text-earth-brown font-black h-12 rounded-xl focus:border-emerald-500 px-4"
                        />
                      </div>
                      <Button 
                        onClick={handlePasswordChange}
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl mt-2 font-black uppercase tracking-widest text-[10px] bg-earth-primary text-earth-brown hover:bg-earth-primary-hover border-none shadow-lg disabled:opacity-50"
                      >
                         {isSubmitting ? "Updating..." : "Update Password"}
                      </Button>
                   </div>
                 )}

                 {/* Language Select Modal */}
                 {activeModal === 'language' && (
                   <div className="space-y-3">
                      {[
                        { label: 'English (INT)', code: 'en' },
                        { label: 'Naira (NGN)', code: 'naira' }
                      ].map((lang) => (
                        <button 
                          key={lang.code} 
                          onClick={() => handleLanguageChange(lang.code)}
                          className={cn(
                          "w-full h-14 rounded-2xl border px-5 flex items-center justify-between transition-all group",
                          farmer.language === lang.code ? "bg-earth-primary/10 border-emerald-500/30 text-earth-green" : "bg-earth-card border-earth-dark/10 text-earth-sub hover:border-earth-dark/15 hover:text-earth-brown"
                        )}>
                           <span className="font-black text-sm uppercase italic">{lang.label}</span>
                           {farmer.language === lang.code && <CheckCircle size={18} className="text-earth-green" />}
                        </button>
                      ))}
                   </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
