import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ChevronUp, 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Home,
  ListTodo,
  User,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { UserData } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import logo from '@assets/baynunah-logo_1764408063481.png';

interface UniversalPassProps {
  user: UserData;
}

export default function UniversalPass({ user }: UniversalPassProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHovering, setIsHovering] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset expansion when user changes
  useEffect(() => {
    setExpanded(false);
  }, [user.code]);

  const toggleExpand = () => setExpanded(!expanded);

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'candidate': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'manager': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'onboarding': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getRoleGradient = (role: string) => {
    switch(role) {
      case 'candidate': return 'from-blue-500/20 to-blue-600/5';
      case 'manager': return 'from-purple-500/20 to-purple-600/5';
      case 'onboarding': return 'from-emerald-500/20 to-emerald-600/5';
      default: return 'from-gray-500/20 to-gray-600/5';
    }
  };

  const getPassType = (role: string) => {
    switch(role) {
      case 'candidate': return 'CANDIDATE PASS';
      case 'manager': return 'STAFF PASS';
      case 'onboarding': return 'ONBOARDING PASS';
      default: return 'UNIVERSAL PASS';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 font-sans bg-[#ffffffde] pt-[0px] pb-[0px] pl-[0px] pr-[0px]">
      {/* Live Time Indicator - minimalist */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 right-8 text-right z-10"
      >
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Local Time</p>
        <p className="text-sm font-mono text-slate-600">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </motion.div>
      <AnimatePresence mode="wait">
        {showVerification && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/10 backdrop-blur-md"
          >
             <div className="w-full max-w-xs rounded-[32px] p-6 relative overflow-hidden shadow-[0_0_100px_rgba(44,65,172,0.4)] bg-[#1f337f3d] text-[#000000]">
                {/* Close Button */}
                <button 
                  onClick={() => setShowVerification(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span className="text-xl font-light">&times;</span>
                </button>

                <div className="flex flex-col items-center text-center pt-4 pb-2">
                   {/* Icon */}
                   <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 ring-1 ring-white/20">
                     <span className="text-2xl font-light">#</span>
                   </div>

                   <h2 className="text-lg font-bold mb-1 bg-[#08004f00] text-[#193cb8]">Verification Code</h2>
                   <p className="text-xs mb-8 text-[#0f0000]">Scan the QR code or enter manually</p>

                   {/* Large QR Card */}
                   <div className="bg-white p-4 rounded-3xl w-full aspect-square flex items-center justify-center mb-6 shadow-lg">
                      <QRCodeSVG value={`https://baynunah-pass.com/verify/${user.code}`} size={200} fgColor="#000000" />
                   </div>

                   <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">OR enter the code manually</p>

                   {/* Code Box */}
                   <div className="w-full rounded-xl p-4 flex items-center justify-center relative mb-8 border border-white/10 text-[#193cb8] font-semibold text-[20px] bg-[#e8eafa]">
                      <span className="font-mono text-sm tracking-widest opacity-90 text-[#85848a] bg-[#00000000]">N8EC-PS5D-9PKD</span>
                      <button className="absolute right-4 opacity-60 hover:opacity-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      </button>
                   </div>

                   {/* User Info */}
                   <div className="mb-8">
                      <h3 className="text-lg text-[#193cb8] font-extrabold">{user.name}</h3>
                      <p className="text-sm text-[#6b6b80]">{user.code}</p>
                   </div>

                   <div className="w-full h-px bg-white/10 mb-6" />

                   <button 
                     onClick={() => {
                       setShowVerification(false);
                       setExpanded(true);
                     }}
                     className="w-full py-3.5 rounded-xl hover:bg-white/20 border border-white/10 transition-all flex items-center justify-center gap-2 text-sm bg-[#e8eafa] text-[#9c9c9c] font-semibold"
                   >
                     <span className="text-[#85848a]">View Full Profile</span>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                   </button>
                </div>
             </div>
          </motion.div>
        )}
        {!expanded ? (
          <motion.div 
            key="compact"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
            }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-[320px] relative z-10"
          >
            <div 
              className="rounded-[40px] p-8 relative group transition-all duration-300 bg-[#ffffff]"
              style={{
                boxShadow: '20px 20px 60px #c5c5c5, -20px -20px 60px #ffffff'
              }}
            >
              {/* Security Strip - Minimal */}
              <div className={cn("absolute top-0 left-0 w-full h-1 opacity-50", getRoleGradient(user.role))} />

              <div className="flex flex-col items-center text-center relative z-10 mt-2">
                {/* Logo */}
                <div className="h-6 mb-2 flex items-center justify-center w-full">
                  <img src={logo} alt="Baynunah" className="h-full object-contain invert opacity-80" />
                </div>

                {/* Pass Type */}
                <p className="tracking-[0.2em] text-slate-400 uppercase font-medium mt-[0px] mb-[0px] text-[16px] pt-[5px] pb-[5px]">
                  {getPassType(user.role)}
                </p>

                {/* QR Code (Primary) */}
                <div className="relative flex flex-col items-center group cursor-pointer mb-6" onClick={() => setShowVerification(true)}>
                  <div className="w-40 h-40 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300 pt-[0px] pb-[0px] mt-[15px] mb-[15px]">
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-slate-100 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-slate-100 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-slate-100 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-slate-100 rounded-br-xl" />
                    
                    {/* 3D Embossed QR */}
                    <div className="filter drop-shadow-[4px_4px_6px_rgba(0,0,0,0.1)]">
                      <QRCodeSVG 
                        value={`https://baynunah-pass.com/pass/${user.code}`} 
                        size={120} 
                        fgColor="#64748b" 
                        bgColor="transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Status Dot */}
                  <div className="px-3 py-1 rounded-full text-[10px] font-medium border border-slate-100 shadow-sm whitespace-nowrap uppercase tracking-wider flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-slate-500 mt-[0px] mb-[0px] pt-[0px] pb-[0px]">
                    <span className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400')} />
                    {user.status}
                  </div>
                </div>

                {/* Identity */}
                <div className="space-y-1 mt-2">
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-[0px] mb-[0px]">{user.name}</h1>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-wider pt-[5px] pb-[5px]">{user.title}</p>
                  {user.department && (
                    <p className="text-slate-400 text-[10px] font-medium mt-1">
                      {user.department}
                    </p>
                  )}
                </div>

                {/* Action Button - Reveal on Hover */}
                <motion.div 
                  className="w-full overflow-hidden h-0 group-hover:h-[60px] transition-all duration-300 ease-in-out flex items-center justify-center"
                >
                  <button 
                    onClick={toggleExpand}
                    className="w-full py-3.5 bg-[#1E40AF] text-white rounded-xl font-medium text-sm tracking-wide shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Pass</span>
                  </button>
                </motion.div>
                
                {/* Bottom indicator when not hovering */}
                <div className="h-1 w-12 bg-slate-300 rounded-full mx-auto group-hover:w-0 group-hover:opacity-0 transition-all duration-300 mt-4" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="expanded"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.5, type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 bg-subtle z-20 flex flex-col"
          >
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                  <p className="text-xs text-slate-500">{user.code}</p>
                </div>
              </div>
              <button 
                onClick={toggleExpand}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <ChevronUp className="w-5 h-5 rotate-180" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                {user.stats?.map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-1"
                  >
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-tight">{stat.label}</span>
                    <span className="text-lg font-bold text-[#1E40AF]">{stat.value}</span>
                  </motion.div>
                ))}
              </div>

              {/* Info Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Contact Information</h4>
                
                {user.location && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-slate-500">Location</p>
                      <p className="text-slate-900 font-medium">{user.location}</p>
                    </div>
                  </div>
                )}

                {user.email && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-slate-500">Email</p>
                      <p className="text-slate-900 font-medium break-all">{user.email}</p>
                    </div>
                  </div>
                )}

                {user.phone && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-slate-500">Phone</p>
                      <p className="text-slate-900 font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider px-1">Timeline</h4>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="relative pl-2 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {user.timeline?.map((item, i) => (
                      <div key={i} className="relative flex gap-4">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 z-10 ring-4 ring-white", 
                          item.status === 'completed' ? "bg-[#059669]" : 
                          item.status === 'current' ? "bg-[#1E40AF]" : "bg-slate-300"
                        )} />
                        <div>
                          <h5 className={cn("text-sm font-medium", item.status === 'upcoming' ? "text-slate-500" : "text-slate-900")}>
                            {item.title}
                          </h5>
                          <p className="text-xs text-slate-400 mt-0.5">{item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-2 flex justify-between items-center px-6">
                <NavItem icon={<Home className="w-5 h-5" />} active />
                <NavItem icon={<ListTodo className="w-5 h-5" />} />
                <div className="w-12 h-12 bg-[#1E40AF] rounded-full -mt-8 flex items-center justify-center text-white shadow-lg shadow-blue-900/30 ring-4 ring-white">
                  <QRCodeSVG value={user.code} size={24} fgColor="#ffffff" bgColor="transparent" />
                </div>
                <NavItem icon={<CheckCircle2 className="w-5 h-5" />} />
                <NavItem icon={<Settings className="w-5 h-5" />} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <button className={cn(
      "p-3 rounded-xl transition-colors",
      active ? "text-[#1E40AF] bg-blue-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
    )}>
      {icon}
    </button>
  );
}
