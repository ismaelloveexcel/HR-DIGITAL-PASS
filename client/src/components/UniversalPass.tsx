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

interface UniversalPassProps {
  user: UserData;
}

export default function UniversalPass({ user }: UniversalPassProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHovering, setIsHovering] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#e8e8e8] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 font-sans">
      
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
              className="bg-[#e8e8e8] rounded-[40px] p-8 relative group transition-all duration-300"
              style={{
                boxShadow: '20px 20px 60px #c5c5c5, -20px -20px 60px #ffffff'
              }}
            >
              {/* Security Strip - Minimal */}
              <div className={cn("absolute top-0 left-0 w-full h-1 opacity-50", getRoleGradient(user.role))} />

              <div className="flex flex-col items-center text-center space-y-8 relative z-10 mt-2">
                {/* QR Code (Primary) */}
                <div className="relative flex flex-col items-center">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden flex items-center justify-center relative z-10 bg-white shadow-sm">
                    <QRCodeSVG value={`https://baynunah-pass.com/pass/${user.code}`} size={100} fgColor="#1E40AF" />
                  </div>
                  
                  {/* Status Dot */}
                  <div className={cn(
                    "mt-3 px-3 py-1 rounded-full text-[10px] font-medium border border-slate-100 shadow-sm whitespace-nowrap uppercase tracking-wider flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-slate-500"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400')} />
                    {user.status}
                  </div>
                </div>

                {/* Identity */}
                <div className="space-y-1 mt-6">
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{user.name}</h1>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-wider">{user.title}</p>
                  {user.department && (
                    <p className="text-slate-400 text-[10px] font-medium mt-1">
                      {user.department}
                    </p>
                  )}
                </div>

                {/* Action Button - Clean & Flat */}
                <button 
                  onClick={toggleExpand}
                  className="w-full py-3.5 bg-[#1E40AF] text-white rounded-xl font-medium text-sm tracking-wide shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Pass</span>
                </button>
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
