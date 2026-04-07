import { useState, useEffect } from 'react';
import { LogOut, Globe, KeyRound, CheckCircle, X, ChevronRight, User, Tractor, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export default function Profile() {
  const { logout } = useAuth();
  
  const [operator, setOperator] = useState({
    name: "Loading...",
    email: "loading...",
    phone: "",
    role: "operator",
    tractor: "Loading...",
    language: "en"
  });
  
  const [activeModal, setActiveModal] = useState(null); // 'language', 'password', 'profile'
  
  // Form States
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.operator.getProfile();
      if (res.success) {
        setOperator(res.data);
        setProfileForm({ 
          name: res.data.name, 
          email: res.data.email, 
          phone: res.data.phone 
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const handleLanguageChange = async (langCode) => {
    try {
      const res = await api.operator.updateLanguage({ language: langCode });
      if (res.success) {
        setOperator(prev => ({ ...prev, language: langCode }));
        localStorage.setItem('tractorlink_lang', langCode);
        setActiveModal(null);
        window.location.reload();
      }
    } catch (error) {
      alert("Failed to update language");
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.name || !profileForm.email) {
      alert("Name and Email are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.operator.updateProfile(profileForm);
      if (res.success) {
        alert("Profile updated successfully!");
        setOperator(prev => ({ ...prev, ...profileForm }));
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
      const res = await api.operator.changePassword(passwordForm);
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

  const menuItems = [
    { id: 'profile', icon: User, label: 'Edit Profile' },
    { id: 'password', icon: KeyRound, label: 'Change Password' },
    { id: 'language', icon: Globe, label: 'Interface Language', value: operator.language === 'en' ? 'English (INT)' : 'Naira (NGN)' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto md:min-h-full pb-24 md:pb-8">
      <div className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-earth-card-alt p-6 md:p-8 shadow-2xl border border-earth-dark/15/50 flex flex-col items-center text-center relative overflow-hidden rounded-[2rem] group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-earth-primary/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-earth-primary/20 transition-all duration-700"></div>
          
          <div className="w-20 h-20 md:w-24 md:h-24 bg-earth-card border border-earth-dark/15/50 rounded-3xl flex items-center justify-center text-whit shadow-lg z-10 overflow-hidden group-hover:border-earth-primary/50 transition-all duration-500 mb-4 text-earth-brown">
             <span className="text-3xl md:text-4xl font-black relative z-10 uppercase">{operator.name.charAt(0)}</span>
             <div className="absolute bottom-0 w-full h-1 bg-earth-primary shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black text-earth-brown z-10 tracking-tight">{operator.name}</h1>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-1 z-10">
             <p className="text-[10px] text-earth-sub font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Mail size={12} className="text-earth-primary/60" /> {operator.email}
             </p>
             {operator.phone && (
               <>
                 <div className="hidden md:block w-1 h-1 bg-earth-dark/20 rounded-full"></div>
                 <p className="text-[10px] text-earth-sub font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Phone size={12} className="text-earth-primary/60" /> {operator.phone}
                 </p>
               </>
             )}
          </div>
          
          <div className="mt-6 w-full flex flex-col md:flex-row gap-3">
             <div className="flex-1 bg-earth-card/50 border border-earth-dark/10 p-4 rounded-2xl flex items-center justify-center gap-2 relative overflow-hidden">
                <div className="w-1 absolute left-0 top-0 bottom-0 bg-earth-primary"></div>
                <User size={16} className="text-earth-primary" />
                <span className="text-[10px] uppercase font-black tracking-widest text-earth-brown">Role: {operator.role}</span>
             </div>
             
             <div className="flex-1 bg-earth-card/50 border border-earth-dark/10 p-4 rounded-2xl flex items-center justify-center gap-2 relative overflow-hidden">
                <div className="w-1 absolute left-0 top-0 bottom-0 bg-earth-primary"></div>
                <Tractor size={16} className="text-earth-primary" />
                <span className="text-[10px] uppercase font-black tracking-widest text-earth-brown">{operator.tractor}</span>
             </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div>
          <h3 className="font-black text-earth-mut uppercase tracking-widest text-[9px] mb-2 px-2">Core Actions</h3>
          
          <div className="bg-earth-card-alt/50 rounded-2xl shadow-xl border border-earth-dark/15/30 overflow-hidden">
            {menuItems.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveModal(item.id)}
                className="w-full flex items-center justify-between p-4 border-b border-earth-dark/15/20 last:border-0 hover:bg-earth-card transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-earth-card shadow-inner border border-earth-dark/10 text-earth-mut group-hover:border-earth-primary/30 group-hover:text-earth-primary flex items-center justify-center transition-all duration-300">
                    <item.icon size={18} />
                  </div>
                  <span className="font-black text-sm text-earth-brown group-hover:text-earth-brown transition-colors tracking-tight uppercase italic">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {item.value && <span className="text-[9px] uppercase tracking-widest font-black text-earth-mut bg-earth-card border border-earth-dark/10 px-2.5 py-1 rounded shadow-inner">{item.value}</span>}
                  <ChevronRight size={18} className="text-earth-mut group-hover:text-earth-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Button onClick={logout} className="w-full text-red-500 hover:text-earth-brown hover:bg-red-500 font-black tracking-[0.2em] uppercase justify-center h-14 text-[10px] md:text-sm rounded-2xl border-2 border-red-500/10 bg-red-500/5 transition-all shadow-xl hover:shadow-red-500/10 group">
              <LogOut size={18} className="mr-2 group-hover:animate-pulse" /> SIGN OUT
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
                   menuItems.find(i => i.id === activeModal)?.label || 'Settings'
                 }</h3>
                 <button onClick={() => setActiveModal(null)} className="text-earth-mut hover:text-earth-brown transition-colors p-1"><X size={18} /></button>
              </div>

              <div className="p-6">
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
                          operator.language === lang.code ? "bg-earth-primary/10 border-earth-primary/30 text-earth-primary" : "bg-earth-card border-earth-dark/10 text-earth-sub hover:border-earth-dark/15 hover:text-earth-brown"
                        )}>
                           <span className="font-black text-sm uppercase italic">{lang.label}</span>
                           {operator.language === lang.code && <CheckCircle size={18} className="text-earth-primary" />}
                        </button>
                      ))}
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
                           className="bg-earth-card border-earth-dark/10 text-earth-brown font-black h-12 rounded-xl focus:border-earth-primary px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black tracking-widest text-earth-mut pl-1">New Password</label>
                        <Input 
                           type="password"
                           value={passwordForm.newPassword}
                           onChange={e => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                           className="bg-earth-card border-earth-dark/10 text-earth-brown font-black h-12 rounded-xl focus:border-earth-primary px-4"
                        />
                      </div>
                      <Button 
                        onClick={handlePasswordChange}
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl mt-2 font-black uppercase tracking-widest text-[10px] bg-accent text-white hover:opacity-90 border-none shadow-lg disabled:opacity-50"
                      >
                         {isSubmitting ? "Updating..." : "Update Password"}
                      </Button>
                   </div>
                 )}

                 {/* Edit Profile Modal */}
                 {activeModal === 'profile' && (
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black tracking-widest text-earth-mut pl-1">Full Name</label>
                        <Input 
                           value={profileForm.name}
                           onChange={e => setProfileForm(prev => ({...prev, name: e.target.value}))}
                           className="bg-earth-card border-earth-dark/10 text-earth-brown font-black h-12 rounded-xl focus:border-earth-primary px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black tracking-widest text-earth-mut pl-1">Email Address</label>
                        <Input 
                           value={profileForm.email}
                           onChange={e => setProfileForm(prev => ({...prev, email: e.target.value}))}
                           className="bg-earth-card border-earth-dark/10 text-earth-brown font-black h-12 rounded-xl focus:border-earth-primary px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black tracking-widest text-earth-mut pl-1">Phone Number</label>
                        <Input 
                           value={profileForm.phone}
                           onChange={e => setProfileForm(prev => ({...prev, phone: e.target.value}))}
                           className="bg-earth-card border-earth-dark/10 text-earth-brown font-black h-12 rounded-xl focus:border-earth-primary px-4"
                        />
                      </div>
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={isSubmitting || !profileForm.name || !profileForm.email}
                        className="w-full h-12 rounded-xl mt-2 font-black uppercase tracking-widest text-[10px] bg-accent text-white hover:opacity-90 border-none shadow-lg disabled:opacity-50"
                      >
                         {isSubmitting ? "Updating..." : "Save Changes"}
                      </Button>
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
