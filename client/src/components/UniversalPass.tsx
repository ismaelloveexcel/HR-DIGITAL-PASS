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
  ShieldCheck,
  RotateCw,
  FileText,
  ArrowRight,
  CheckSquare,
  CalendarDays,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { UserData } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import logo from '@assets/baynunah-logo_1764408063481.png';

import { useLocation } from 'wouter';

interface UniversalPassProps {
  user: UserData;
}

// Data for the back of the card
const CANDIDATE_BACK_DATA = {
  timeline: [
    { stage: "Application", status: "completed", date: "Nov 25" },
    { stage: "Screening", status: "completed", date: "Nov 26" },
    { 
      stage: "Assessment", 
      status: "completed", 
      date: "Nov 28",
      components: {
        softSkills: { required: true, status: "completed", link: "#" },
        technical: { required: false, status: "skipped", link: "#" }
      }
    },
    { 
      stage: "Interview", 
      status: "current", 
      date: "Dec 05", 
      time: "14:00", 
      location: "HQ, Floor 4" 
    },
    { stage: "Offer", status: "pending", date: "-" },
    { stage: "Onboarding", status: "pending", startDate: "-" }
  ],
  assessments: {
    softSkills: { required: true, status: "Completed", link: "#" },
    technical: { required: true, status: "Pending", link: "#" }
  },
  nextStep: {
    label: "Final Interview",
    date: "Dec 05",
    time: "14:00 PM",
    location: "Baynunah Tower, Floor 4",
    instructions: "Please bring your original ID and portfolio."
  },
  documents: {
    uploadedByCandidate: [
      { type: "Resume/CV", url: "#", uploadedDate: "Nov 25" },
      { type: "Portfolio", url: "#", uploadedDate: "Nov 25" }
    ],
    hrUpdates: [
      { message: "Visa eligibility confirmed", date: "Nov 27" }
    ]
  }
};

export default function UniversalPass({ user }: UniversalPassProps) {
  const [expanded, setExpanded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showVerification, setShowVerification] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset states when user changes
  useEffect(() => {
    setExpanded(false);
    setIsFlipped(false);
  }, [user.code]);

  const toggleExpand = () => setExpanded(!expanded);
  const toggleFlip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFlipped(!isFlipped);
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans bg-[#ffffffde]">
      {/* Live Time Indicator */}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/10 backdrop-blur-md font-semibold"
          >
             <div className="w-full max-w-[320px] rounded-[24px] p-4 relative overflow-hidden shadow-[0_0_100px_rgba(44,65,172,0.4)] text-[#000000] flex flex-col bg-[#ffffff]">
                <button 
                  onClick={() => setShowVerification(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                >
                  <span className="text-xl font-light text-slate-400">&times;</span>
                </button>

                <div className="flex flex-col items-center text-center pt-2 pb-2">
                   <h2 className="text-lg font-bold tracking-tight mb-0.5 text-[#1E40AF] shrink-0">Verification Code</h2>
                   <p className="mb-3 shrink-0 text-slate-500 text-xs font-medium">Scan QR code or enter manually</p>

                   <div 
                    className="bg-white p-3 rounded-2xl w-40 aspect-square flex items-center justify-center mb-3 shadow-xl shadow-slate-200/50 shrink-0 border border-slate-50 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setLocation('/candidate-profile')}
                   >
                      <QRCodeSVG value={`https://baynunah-pass.com/verify/${user.code}`} size={130} fgColor="#1e293b" />
                   </div>

                   <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-2 shrink-0">OR enter code</p>

                   <div className="w-full rounded-xl p-2.5 flex items-center justify-center relative mb-3 border border-slate-100 text-slate-700 bg-slate-50/80 shrink-0 shadow-inner">
                      <span className="font-mono tracking-[0.2em] text-base font-bold">N8EC-PS5D-9PKD</span>
                      <button className="absolute right-3 text-slate-400 hover:text-[#1E40AF] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      </button>
                   </div>

                   <div className="mb-3 shrink-0 space-y-0">
                      <h3 className="text-[#1E40AF] text-base font-bold tracking-tight">{user.name}</h3>
                      <p className="text-slate-500 font-mono text-[10px] tracking-wider">{user.code}</p>
                   </div>

                   <div className="w-full h-px bg-slate-100 mb-3 shrink-0" />

                   <button 
                     onClick={() => {
                       setShowVerification(false);
                       setLocation('/candidate-profile');
                     }}
                     className="w-full py-2.5 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all flex items-center justify-center gap-2 text-xs bg-slate-50 text-slate-600 hover:text-[#1E40AF] font-semibold shrink-0 group"
                   >
                     <span className="group-hover:translate-x-[-2px] transition-transform">View Full Profile</span>
                     <svg className="group-hover:translate-x-[2px] transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                   </button>
                </div>
             </div>
          </motion.div>
        )}

        {!expanded ? (
          <motion.div 
            key="compact"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-[320px] h-[580px] relative z-10 perspective-1000"
            style={{ perspective: '1000px' }}
          >
            <motion.div
              className="w-full h-full relative preserve-3d transition-all duration-700"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* FRONT FACE */}
              <div 
                className="absolute inset-0 backface-hidden rounded-[40px] p-8 bg-[#ffffff] flex flex-col items-center text-center group"
                style={{ 
                    backfaceVisibility: 'hidden',
                    boxShadow: '20px 20px 60px #c5c5c5, -20px -20px 60px #ffffff'
                }}
              >
                {/* Flip Button */}
                <button 
                  onClick={toggleFlip}
                  className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-[#1E40AF] hover:bg-blue-50 transition-colors z-20"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Security Strip */}
                <div className={cn("absolute top-0 left-0 w-full h-1 opacity-50 rounded-t-[40px]", getRoleGradient(user.role))} />

                <div className="flex flex-col items-center w-full h-full pt-4">
                    {/* Logo */}
                    <div className="h-6 mb-4 flex items-center justify-center w-full">
                        <img src={logo} alt="Baynunah" className="h-full object-contain invert opacity-80" />
                    </div>

                    {/* Pass Type */}
                    <p className="tracking-[0.2em] uppercase font-medium text-[14px] text-[#62748e] mb-8">
                        {getPassType(user.role)}
                    </p>

                    {/* QR Code Area */}
                    <div className="relative flex flex-col items-center group/qr cursor-pointer mb-8" onClick={() => setShowVerification(true)}>
                        <div className="w-48 h-48 relative flex items-center justify-center group-hover/qr:scale-105 transition-transform duration-300 bg-white rounded-3xl shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] p-4">
                             {/* Corner Brackets */}
                             <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-slate-300 rounded-tl-lg" />
                             <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-slate-300 rounded-tr-lg" />
                             <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-slate-300 rounded-bl-lg" />
                             <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-slate-300 rounded-br-lg" />

                             {/* Subtle Scan Animation */}
                             <motion.div 
                                className="absolute left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent z-10"
                                animate={{ top: ["10%", "90%"], opacity: [0, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            
                            <QRCodeSVG 
                                value={`https://baynunah-pass.com/pass/${user.code}`} 
                                size={140} 
                                fgColor="#334155" 
                                bgColor="transparent"
                            />
                        </div>
                        
                        <div className="absolute -bottom-3 bg-white px-4 py-1 rounded-full shadow-sm border border-slate-100 flex items-center gap-1.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400')} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{user.status}</span>
                        </div>
                    </div>

                    {/* Identity */}
                    <div className="space-y-1 mb-6">
                        <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF]">{user.name}</h1>
                        <p className="text-slate-500 font-medium text-xs uppercase tracking-wider">{user.title}</p>
                        {user.department && (
                            <p className="text-slate-400 text-[10px] font-medium mt-1">{user.department}</p>
                        )}
                    </div>

                    {/* Recruitment Status Widget - Reveals on Hover */}
                    <div className="w-full mt-auto relative">
                        {/* Hidden Container */}
                        <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[140px] group-hover:opacity-100 transition-all duration-500 ease-out">
                            <div 
                                className="pt-4 border-t border-slate-100 hover:bg-slate-50 transition-colors rounded-xl p-2 cursor-pointer" 
                                onClick={() => setLocation('/candidate-profile')}
                            >
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Recruitment Stage</span>
                                        <span className="text-xs font-bold text-[#1E40AF] uppercase tracking-wide flex items-center gap-1">
                                            Interview
                                            <ChevronRight className="w-3 h-3 text-slate-300 hover:text-[#1E40AF] transition-colors" />
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-medium text-slate-400">Step 4 of 6</span>
                                </div>
                                
                                <div className="flex gap-1 h-1.5 w-full">
                                    {['Application', 'Screening', 'Assessment', 'Interview', 'Offer', 'Onboarding'].map((stage, i) => {
                                        const currentStageIndex = 3;
                                        const isActive = i === currentStageIndex;
                                        const isCompleted = i < currentStageIndex;
                                        return (
                                            <div 
                                                key={stage} 
                                                className={cn(
                                                    "h-full rounded-full flex-1 transition-colors",
                                                    isActive ? "bg-[#1E40AF]" : 
                                                    isCompleted ? "bg-emerald-400" : 
                                                    "bg-slate-200"
                                                )} 
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        {/* Handle Indicator (Visible when hidden) */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200 rounded-full opacity-100 group-hover:opacity-0 transition-opacity duration-300 delay-100" />
                    </div>
                </div>
              </div>

              {/* BACK FACE (4 Menu Tiles) */}
              <div 
                className="absolute inset-0 backface-hidden rounded-[40px] p-6 bg-[#f8fafc] flex flex-col"
                style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    boxShadow: '20px 20px 60px #c5c5c5, -20px -20px 60px #ffffff'
                }}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Baynunah" className="h-4 object-contain opacity-60" />
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Pass Menu</span>
                    </div>
                    <button 
                        onClick={toggleFlip}
                        className="p-2 rounded-full text-slate-400 hover:text-[#1E40AF] hover:bg-blue-50 transition-colors"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>
                </div>

                {/* Grid Layout */}
                <div className="flex flex-col gap-3 flex-1 h-full overflow-y-auto pb-2 custom-scrollbar">
                    
                    <div className="flex gap-3 h-[170px] shrink-0">
                        {/* Tile A: Timeline */}
                        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow relative group">
                            <div className="flex items-center gap-2 mb-2 shrink-0">
                                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                    <CalendarDays className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Timeline</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                                {CANDIDATE_BACK_DATA.timeline.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full mt-1 shrink-0",
                                            item.status === 'completed' ? "bg-emerald-500" : 
                                            item.status === 'current' ? "bg-blue-600 animate-pulse" : "bg-slate-200"
                                        )} />
                                        <div className="flex-1">
                                            <p className={cn("text-[9px] font-semibold leading-tight", item.status === 'upcoming' ? "text-slate-400" : "text-slate-700")}>{item.stage}</p>
                                            {item.date && item.date !== '-' && <p className="text-[8px] text-slate-400">{item.date}</p>}
                                        </div>
                                        {item.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tile B: Assessments */}
                        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow group">
                             <div className="flex items-center gap-2 mb-2 shrink-0">
                                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                                    <CheckSquare className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Tasks</span>
                            </div>
                            <div className="space-y-2 overflow-y-auto custom-scrollbar">
                                 <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-[9px] font-medium text-slate-600">Soft Skills</span>
                                    <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Done</span>
                                 </div>
                                 <div className="flex flex-col p-2 bg-slate-50 rounded-lg border border-slate-100 gap-1.5">
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-[9px] font-medium text-slate-600">Technical</span>
                                    </div>
                                    <a href="#" className="text-[8px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 self-end bg-white px-2 py-1 rounded border border-blue-100 shadow-sm">
                                        Start <ArrowRight className="w-2 h-2" />
                                    </a>
                                 </div>
                            </div>
                        </div>
                    </div>

                    {/* Tile C: Next Step */}
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow shrink-0 h-[84px]">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                                    <Clock className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Next Step</span>
                            </div>
                            <span className="text-[9px] font-bold text-[#1E40AF] bg-blue-50 px-2 py-0.5 rounded-full">{CANDIDATE_BACK_DATA.nextStep.date}</span>
                        </div>
                        <div className="mt-1 pl-1">
                            <p className="text-sm font-bold text-slate-800 leading-tight">{CANDIDATE_BACK_DATA.nextStep.label}</p>
                            <div className="flex gap-3 mt-1">
                                <p className="text-[9px] text-slate-500 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> {CANDIDATE_BACK_DATA.nextStep.time}
                                </p>
                                <p className="text-[9px] text-slate-500 flex items-center gap-1 truncate">
                                    <MapPin className="w-2.5 h-2.5" /> {CANDIDATE_BACK_DATA.nextStep.location}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tile D: Documents */}
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow shrink-0">
                         <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                                <FileText className="w-3 h-3" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Documents</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {CANDIDATE_BACK_DATA.documents.uploadedByCandidate.map((doc, i) => (
                                <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                                    <FileCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-semibold text-slate-700 truncate">{doc.type}</p>
                                        <p className="text-[8px] text-slate-400">Uploaded {doc.uploadedDate}</p>
                                    </div>
                                </div>
                            ))}
                             {CANDIDATE_BACK_DATA.documents.hrUpdates.map((update, i) => (
                                <div key={i + 10} className="p-2 bg-blue-50/50 rounded-lg border border-blue-100 col-span-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                    <p className="text-[9px] font-medium text-blue-800 truncate">{update.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>

            </motion.div>
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