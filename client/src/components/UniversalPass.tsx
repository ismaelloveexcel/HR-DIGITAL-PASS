import { useState, useEffect, useMemo } from 'react';
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
  ChevronRight,
  Share2
} from 'lucide-react';
import type { CandidateWithRelations } from '@shared/schema';
import { cn } from '@/lib/utils';
import logo from '@assets/baynunah-logo_1764408063481.png';
import { usePassData } from '@/hooks/usePassData';
import type { PassLink, PassLinkSlot, PassSettings, SlotStatus } from '@/lib/passDataStore';

import { useLocation } from 'wouter';

interface UniversalPassProps {
  candidate: CandidateWithRelations;
}

type Persona = 'candidate' | 'manager' | 'onboarding';
type MaintenanceKey = keyof PassSettings['automations'];

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

export default function UniversalPass({ candidate }: UniversalPassProps) {
  const [expanded, setExpanded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showVerification, setShowVerification] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [, setLocation] = useLocation();
  const {
    store,
    getPassSettings: fetchPassSettings,
    toggleModuleVisibility,
    toggleAutomationPref,
    getLinksForCode: fetchLinksForCode,
    updateLinkSlot: mutateLinkSlot,
    updatePassSettings,
  } = usePassData();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset states when candidate changes
  useEffect(() => {
    setExpanded(false);
    setIsFlipped(false);
    setActiveSection(null);
  }, [candidate.code]);

  const passSettings = useMemo(
    () => fetchPassSettings(candidate.code),
    [candidate.code, fetchPassSettings, store.lastUpdated],
  );

  const linkedFlows = useMemo(
    () => fetchLinksForCode(candidate.code),
    [candidate.code, fetchLinksForCode, store.lastUpdated],
  );

  const primaryLinkedSlot = useMemo(() => {
    if (!linkedFlows.length) return null;
    const link = linkedFlows[0];
    const preferredSlot =
      link.slots.find((slot) => slot.candidateCode === candidate.code && slot.status === 'booked') ??
      link.slots.find((slot) => slot.status === 'open') ??
      link.slots[0];
    return { link, slot: preferredSlot };
  }, [linkedFlows, candidate.code]);

  const persona: Persona = useMemo(() => {
    if (candidate.code.startsWith('REQ')) return 'manager';
    if (candidate.code.startsWith('ONB')) return 'onboarding';
    return 'candidate';
  }, [candidate.code]);

  const personaMeta: Record<Persona, { badge: string; caption: string; accent: string }> = {
    candidate: {
      badge: 'Candidate Journey',
      caption: 'Share progress updates instantly.',
      accent: 'text-[#1E40AF]',
    },
    manager: {
      badge: 'Hiring Manager Brief',
      caption: 'Keep leadership synced without extra decks.',
      accent: 'text-emerald-600',
    },
    onboarding: {
      badge: 'Onboarding Checklist',
      caption: 'Make day-one ready in a glance.',
      accent: 'text-amber-600',
    },
  };

  const personaCopy = personaMeta[persona];

  const themeTokens: Record<PassSettings['theme'], {
    card: string;
    strip: string;
    accent: string;
    pill: string;
  }> = {
    light: {
      card: 'bg-white text-slate-900',
      strip: 'from-blue-500/20 to-blue-600/5',
      accent: 'text-[#1E40AF]',
      pill: 'bg-slate-100 text-slate-500',
    },
    dark: {
      card: 'bg-slate-900 text-white border border-slate-700',
      strip: 'from-slate-700/60 to-slate-900/20',
      accent: 'text-blue-300',
      pill: 'bg-slate-800 text-slate-200',
    },
    tech: {
      card: 'bg-gradient-to-br from-[#020617] via-[#0b1a34] to-[#020617] text-slate-100 border border-slate-800',
      strip: 'from-cyan-500/40 to-blue-500/10',
      accent: 'text-cyan-200',
      pill: 'bg-slate-900 text-cyan-300',
    },
  };

  const themeToken = themeTokens[passSettings.theme];

  const backMenuItems = useMemo(() => {
    return [
      { id: 'timeline', label: 'Timeline', icon: CalendarDays, enabled: passSettings.modules.timeline },
      { id: 'evaluations', label: 'Assessments', icon: CheckSquare, enabled: true },
      { id: 'next', label: 'Next', icon: ArrowRight, enabled: true },
      { id: 'documents', label: 'Documents', icon: FileText, enabled: passSettings.modules.documents },
      { id: 'linked', label: 'Links', icon: Share2, enabled: passSettings.modules.availability && linkedFlows.length > 0 },
    ].filter((item) => item.enabled);
  }, [passSettings.modules, linkedFlows.length]);

  const timelineStats = useMemo(() => {
    return candidate.timeline.reduce(
      (acc, item) => {
        if (item.status === 'completed') acc.completed += 1;
        else if (item.status === 'current') acc.current += 1;
        else acc.upcoming += 1;
        return acc;
      },
      { completed: 0, current: 0, upcoming: 0 }
    );
  }, [candidate.timeline]);

  const currentStage = useMemo(
    () => candidate.timeline.find((t) => t.status === 'current'),
    [candidate.timeline]
  );

  const nextStage = useMemo(
    () => candidate.timeline.find((t) => t.status === 'upcoming'),
    [candidate.timeline]
  );

  const outstandingDocs = Math.max(0, (persona === 'onboarding' ? 5 : 2) - candidate.documents.length);

  const workloadScore = useMemo(() => {
    const base = timelineStats.current * 20 + timelineStats.upcoming * 10;
    const docPenalty = outstandingDocs * 8;
    const evaluationLift = candidate.evaluations.length * 5;
    const personaBoost = persona === 'onboarding' ? 10 : persona === 'manager' ? 5 : 0;
    return Math.min(100, 45 + base + evaluationLift - docPenalty + personaBoost);
  }, [timelineStats, outstandingDocs, candidate.evaluations.length, persona]);

  const adminActions = useMemo(() => {
    const actions: { label: string; detail: string; tone: 'priority' | 'reminder' | 'attention' | 'routine' }[] = [];
    if (currentStage) {
      actions.push({
        label: `Prep ${currentStage.title}`,
        detail: currentStage.date ? `Align panel before ${currentStage.date}` : 'Confirm timing with stakeholders',
        tone: 'priority',
      });
    }
    if (nextStage) {
      actions.push({
        label: `Block calendar for ${nextStage.title}`,
        detail: nextStage.date ? `Target date ${nextStage.date}` : 'Schedule next milestone',
        tone: 'reminder',
      });
    }
    if (candidate.documents.length < (persona === 'onboarding' ? 4 : 2)) {
      actions.push({
        label: 'Request missing documents',
        detail: 'Send secure upload link to candidate',
        tone: 'attention',
      });
    }
    actions.push({
      label: 'Share universal pass update',
      detail: 'Keep leadership in the loop with one link',
      tone: 'routine',
    });
    return actions;
  }, [currentStage, nextStage, candidate.documents.length, persona]);

  const canCall = Boolean(candidate.phone);
  const canEmail = Boolean(candidate.email);

  const soloTip = useMemo(() => {
    if (persona === 'manager') {
      return 'Log one concise update after each interview to keep managers aligned without extra calls.';
    }
    if (persona === 'onboarding') {
      return 'Schedule equipment, access, and first-day buddy at least 48 hours before start.';
    }
    return 'Send micro-updates after every milestone so candidates feel guided even with a lean HR team.';
  }, [persona]);

  const counterpartLabel = (code?: string) => {
    if (!code) return 'Unassigned';
    const counterpart = store.candidates[code];
    return counterpart ? counterpart.name : code;
  };

  const handleCandidateSlotInteraction = (link: PassLink, slot: PassLinkSlot) => {
    if (!passSettings.modules.availability) return;
    if (slot.status === 'booked' && slot.candidateCode === candidate.code) {
      mutateLinkSlot(link.id, slot.id, { status: 'open', candidateCode: undefined });
      return;
    }
    if (slot.status === 'open') {
      mutateLinkSlot(link.id, slot.id, { status: 'booked', candidateCode: candidate.code });
    }
  };

  const handleManagerSlotStatus = (link: PassLink, slot: PassLinkSlot, nextStatus: SlotStatus) => {
    if (!passSettings.modules.availability) return;
    const payload: Partial<PassLinkSlot> = { status: nextStatus };
    if (nextStatus !== 'booked') {
      payload.candidateCode = undefined;
    }
    mutateLinkSlot(link.id, slot.id, payload);
  };

  const toggleExpand = () => setExpanded(!expanded);
  const toggleFlip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFlipped(!isFlipped);
    if (isFlipped) setActiveSection(null); // Reset section when flipping back to front
  };

  const getRoleGradient = () => {
    return themeToken.strip;
  };

  const getPassType = () => {
    if (persona === 'manager') return 'MANAGER PASS';
    if (persona === 'onboarding') return 'ONBOARDING PASS';
    return 'CANDIDATE PASS';
  };

  const renderDisabledState = (label: string) => (
    <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-center text-center text-slate-400 text-xs font-medium">
      {label} is hidden for this pass. Enable it via the Solo HR console.
    </div>
  );

  const renderDetailContent = () => {
    switch(activeSection) {
        case 'timeline':
            if (!passSettings.modules.timeline) {
              return renderDisabledState('Timeline');
            }
            return (
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col overflow-hidden h-full">
                    <div className="flex items-center gap-2 mb-4 shrink-0">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <CalendarDays className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Timeline</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                        {CANDIDATE_BACK_DATA.timeline.map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className={cn(
                                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                    item.status === 'completed' ? "bg-emerald-500" : 
                                    item.status === 'current' ? "bg-blue-600 animate-pulse" : "bg-slate-200"
                                )} />
                                <div className="flex-1">
                                    <p className={cn("text-xs font-semibold leading-tight", item.status === 'upcoming' ? "text-slate-400" : "text-slate-700")}>{item.stage}</p>
                                    {item.date && item.date !== '-' && <p className="text-[10px] text-slate-400">{item.date}</p>}
                                </div>
                                {item.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'evaluations':
             return (
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4 shrink-0">
                        <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                            <CheckSquare className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Assessments</span>
                    </div>
                    <div className="space-y-3 overflow-y-auto custom-scrollbar">
                            {Object.entries(CANDIDATE_BACK_DATA.assessments).map(([key, data]) => (
                                <div key={key} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs font-medium text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                {data.status === 'Completed' ? (
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Completed</span>
                                ) : (
                                    <a href={data.link} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 bg-white px-3 py-1 rounded-lg border border-blue-100 shadow-sm">
                                        Start <ArrowRight className="w-3 h-3" />
                                    </a>
                                )}
                                </div>
                            ))}
                    </div>
                </div>
             );
        case 'next':
            return (
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Next Step</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#1E40AF] bg-blue-50 px-2 py-1 rounded-lg">{CANDIDATE_BACK_DATA.nextStep.date}</span>
                    </div>
                    <div className="mt-2 pl-1 space-y-3">
                        <p className="text-lg font-bold text-slate-800 leading-tight">{CANDIDATE_BACK_DATA.nextStep.label}</p>
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> {CANDIDATE_BACK_DATA.nextStep.time}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> {CANDIDATE_BACK_DATA.nextStep.location}
                            </p>
                             <p className="text-xs text-slate-500 flex items-start gap-2 bg-slate-50 p-2 rounded-lg mt-2">
                                <span className="font-semibold shrink-0">Note:</span> {CANDIDATE_BACK_DATA.nextStep.instructions}
                            </p>
                        </div>
                    </div>
                </div>
            );
        case 'documents':
            if (!passSettings.modules.documents) {
              return renderDisabledState('Documents');
            }
            return (
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                            <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Documents</span>
                    </div>
                    <div className="space-y-2 overflow-y-auto custom-scrollbar">
                        {CANDIDATE_BACK_DATA.documents.uploadedByCandidate.map((doc, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 hover:bg-slate-100 transition-colors cursor-pointer">
                                <FileCheck className="w-4 h-4 text-slate-400 shrink-0" />
                                <div className="overflow-hidden">
                                    <p className="text-xs font-semibold text-slate-700 truncate">{doc.type}</p>
                                    <p className="text-[10px] text-slate-400">Uploaded {doc.uploadedDate}</p>
                                </div>
                            </div>
                        ))}
                            {CANDIDATE_BACK_DATA.documents.hrUpdates.map((update, i) => (
                            <div key={i + 10} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                <p className="text-xs font-medium text-blue-800">{update.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'linked':
            if (!passSettings.modules.availability || linkedFlows.length === 0) {
              return renderDisabledState('Linked passes');
            }
            return (
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col h-full space-y-4 overflow-y-auto custom-scrollbar">
                    {linkedFlows.map((link) => {
                        const isManagerView = link.managerCode === candidate.code || persona === 'manager';
                        const primarySlot = link.slots.find((slot) => slot.status === 'booked' && slot.candidateCode === candidate.code) 
                            ?? link.slots.find((slot) => slot.status === 'open');
                        return (
                            <div key={link.id} className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/60">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Linked to {counterpartLabel(link.managerCode === candidate.code ? link.candidateCode : link.managerCode)}</p>
                                        <p className="text-sm font-semibold text-slate-900">{link.title}</p>
                                        {primarySlot && (
                                            <p className="text-xs text-slate-500 mt-1">{primarySlot.date} · {primarySlot.time}</p>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-400">Updated {new Date(link.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="space-y-2">
                                    {link.slots.map((slot) => {
                                        const isSelectedByCandidate = slot.candidateCode === candidate.code && slot.status === 'booked';
                                        const slotStatus = slot.status === 'booked'
                                            ? isSelectedByCandidate ? 'Selected' : 'Booked'
                                            : slot.status === 'held' ? 'Hold' : 'Open';
                                        const statusColor = slot.status === 'booked'
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : slot.status === 'held'
                                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                : 'bg-slate-50 text-slate-500 border border-slate-100';
                                        return (
                                            <div key={slot.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{slot.label}</p>
                                                    <p className="text-xs text-slate-500">{slot.date} · {slot.time}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-widest", statusColor)}>
                                                        {slotStatus}
                                                    </span>
                                                    {persona === 'candidate' && (
                                                        <button
                                                            onClick={() => handleCandidateSlotInteraction(link, slot)}
                                                            disabled={slot.status === 'held' || (slot.status === 'booked' && !isSelectedByCandidate)}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                                                                isSelectedByCandidate
                                                                    ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                                                                    : "border-slate-200 text-slate-600 hover:border-[#1E40AF] hover:text-[#1E40AF]"
                                                            )}
                                                        >
                                                            {isSelectedByCandidate ? 'Release' : 'Select'}
                                                        </button>
                                                    )}
                                                    {persona === 'manager' && (
                                                        <div className="flex gap-1">
                                                            {(['open', 'held'] as SlotStatus[]).map((status) => (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => handleManagerSlotStatus(link, slot, status)}
                                                                    className={cn(
                                                                        "px-2 py-1 rounded-lg text-[10px] font-semibold border",
                                                                        slot.status === status
                                                                            ? "border-[#1E40AF] text-[#1E40AF] bg-blue-50"
                                                                            : "border-slate-200 text-slate-500 hover:border-[#1E40AF]/50"
                                                                    )}
                                                                >
                                                                    {status === 'open' ? 'Open' : 'Hold'}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans bg-[#ffffffde] dark:bg-slate-900">
      {/* Live Time Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 right-8 text-right z-10"
      >
        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Local Time</p>
        <p className="text-sm font-mono text-slate-600 dark:text-slate-300">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </motion.div>
      <AnimatePresence>
        {showVerification && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/10 dark:bg-slate-900/50 backdrop-blur-md font-semibold"
          >
             <div className="w-full max-w-[320px] rounded-[24px] p-4 relative overflow-hidden shadow-[0_0_100px_rgba(44,65,172,0.4)] text-[#000000] dark:text-white flex flex-col bg-[#ffffff] dark:bg-slate-800">
                <button 
                  onClick={() => setShowVerification(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 dark:bg-slate-700 flex items-center justify-center hover:bg-white/20 dark:hover:bg-slate-600 transition-colors z-10"
                >
                  <span className="text-xl font-light text-slate-400">&times;</span>
                </button>

                <div className="flex flex-col items-center text-center pt-2 pb-2">
                   <h2 className="text-lg font-bold tracking-tight mb-0.5 text-[#1E40AF] dark:text-blue-400 shrink-0">Verification Code</h2>
                   <p className="mb-3 shrink-0 text-slate-500 dark:text-slate-400 text-xs font-medium">Scan QR code or enter manually</p>

                   <div 
                    className="bg-white dark:bg-slate-700 p-3 rounded-2xl w-40 aspect-square flex items-center justify-center mb-3 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 shrink-0 border border-slate-50 dark:border-slate-600 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setLocation('/candidate-profile')}
                   >
                      <QRCodeSVG value={`https://baynunah-pass.com/verify/${candidate.code}`} size={130} fgColor="#1e293b" />
                   </div>

                   <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2 shrink-0">OR enter code</p>

                   <div className="w-full rounded-xl p-2.5 flex items-center justify-center relative mb-3 border border-slate-100 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-slate-50/80 dark:bg-slate-700/80 shrink-0 shadow-inner">
                      <span className="font-mono tracking-[0.2em] text-base font-bold">N8EC-PS5D-9PKD</span>
                      <button className="absolute right-3 text-slate-400 hover:text-[#1E40AF] dark:hover:text-blue-400 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      </button>
                   </div>

                   <div className="mb-3 shrink-0 space-y-0">
                      <h3 className="text-[#1E40AF] dark:text-blue-400 text-base font-bold tracking-tight">{candidate.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px] tracking-wider">{candidate.code}</p>
                   </div>

                   <div className="w-full h-px bg-slate-100 dark:bg-slate-700 mb-3 shrink-0" />

                   <button 
                     onClick={() => {
                       setShowVerification(false);
                       setLocation('/candidate-profile');
                     }}
                     className="w-full py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all flex items-center justify-center gap-2 text-xs bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#1E40AF] dark:hover:text-blue-400 font-semibold shrink-0 group"
                   >
                     <span className="group-hover:translate-x-[-2px] transition-transform">View Full Profile</span>
                     <svg className="group-hover:translate-x-[2px] transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminPanel && (
          <motion.div
            key="admin-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-slate-900/60 backdrop-blur-md"
          >
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[32px] shadow-[0_20px_80px_rgba(15,23,42,0.15)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Solo HR Console</p>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-1">{personaCopy.badge}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{personaCopy.caption}</p>
                </div>
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center"
                >
                  <span className="text-xl">&times;</span>
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Workload</p>
                    <p className="text-3xl font-bold text-[#1E40AF] dark:text-blue-400">{workloadScore}%</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Confidence to stay on track</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Stages</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{timelineStats.completed} done · {timelineStats.current} active</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Next: {nextStage?.title ?? 'All caught up'}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Docs & Notes</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{candidate.documents.length} uploaded · {outstandingDocs} outstanding</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Evaluations: {candidate.evaluations.length}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">Action Queue</p>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Tap to mark progress</span>
                  </div>
                  <div className="space-y-3">
                    {adminActions.map((action) => (
                      <button
                        key={action.label}
                        className={cn(
                          "w-full text-left p-4 rounded-2xl border flex items-start gap-3 transition-all",
                          action.tone === 'priority' ? "border-[#1E40AF] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/30 text-[#1E2A4A] dark:text-blue-200" :
                          action.tone === 'attention' ? "border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" :
                          "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-600"
                        )}
                      >
                        <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: action.tone === 'priority' ? '#1E40AF' : action.tone === 'attention' ? '#f97316' : '#94a3b8' }} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{action.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{action.detail}</p>
                        </div>
                        <CheckCircle2 className={cn("w-4 h-4", action.tone === 'priority' ? "text-[#1E40AF] dark:text-blue-400" : "text-slate-300 dark:text-slate-600")} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-3">Field Controls</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([
                      { key: 'timeline', label: 'Timeline', description: 'Recruitment progress' },
                      { key: 'documents', label: 'Documents', description: 'Secure file slots' },
                      { key: 'availability', label: 'Availability', description: 'Linked scheduling' },
                      { key: 'interactions', label: 'Insights', description: 'Micro tips & notes' },
                    ] as { key: keyof PassSettings['modules']; label: string; description: string }[]).map((module) => {
                      const enabled = passSettings.modules[module.key];
                      return (
                        <button
                          key={module.key}
                          onClick={() => toggleModuleVisibility(candidate.code, module.key)}
                          className={cn(
                            "p-4 rounded-2xl border text-left space-y-1 transition-all",
                            enabled
                              ? "border-[#1E40AF] dark:border-blue-500 bg-blue-50/70 dark:bg-blue-900/30 text-[#1E2A4A] dark:text-blue-200"
                              : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-600"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{module.label}</span>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest",
                              enabled ? "text-[#1E40AF]" : "text-slate-400"
                            )}>
                              {enabled ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                          <p className="text-xs">{module.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-3">Theme</p>
                  <div className="flex flex-wrap gap-2">
                    {(['light', 'dark', 'tech'] as PassSettings['theme'][]).map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() => updatePassSettings(candidate.code, { theme: themeOption })}
                        className={cn(
                          "px-4 py-2 rounded-2xl border text-sm font-semibold capitalize transition-colors",
                          passSettings.theme === themeOption
                            ? "border-[#1E40AF] text-[#1E40AF] bg-blue-50"
                            : "border-slate-200 text-slate-500 hover:border-[#1E40AF]/40"
                        )}
                      >
                        {themeOption} mode
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-3">Maintenance</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        key: 'reminders' as MaintenanceKey,
                        label: 'Timeline nudges',
                        description: 'Auto reminders 30 min before events',
                      },
                      {
                        key: 'docs' as MaintenanceKey,
                        label: 'Document sync',
                        description: 'Notify when uploads arrive',
                      },
                      {
                        key: 'broadcast' as MaintenanceKey,
                        label: 'Broadcast updates',
                        description: 'Send pass digest to leaders',
                      },
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => toggleAutomationPref(candidate.code, option.key)}
                        className={cn(
                          "p-4 rounded-2xl border text-left space-y-2 transition-all",
                          passSettings.automations[option.key]
                            ? "border-[#1E40AF] dark:border-blue-500 bg-blue-50/70 dark:bg-blue-900/30 text-[#1E2A4A] dark:text-blue-200"
                            : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-600"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{option.label}</span>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            passSettings.automations[option.key] ? "text-[#1E40AF] dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                          )}>
                            {passSettings.automations[option.key] ? "ON" : "OFF"}
                          </span>
                        </div>
                        <p className="text-xs">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowAdminPanel(false);
                      setLocation('/candidate-profile');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-[#1E40AF] text-white font-semibold text-sm shadow-lg shadow-blue-900/25 hover:bg-blue-800 transition-colors"
                  >
                    Open Candidate Console
                  </button>
                  <button
                    onClick={() => setShowAdminPanel(false)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
                  >
                    Keep Managing
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
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
                className={cn(
                  "absolute inset-0 backface-hidden rounded-[40px] p-8 flex flex-col items-center text-center group pass-card transition-colors duration-500 border border-transparent",
                  themeToken.card
                )}
                style={{ 
                    backfaceVisibility: 'hidden',
                }}
              >
                {/* Admin Console Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAdminPanel(true);
                  }}
                  className="absolute top-6 left-6 p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-[#1E40AF] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors z-20"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>

                {/* Flip Button */}
                <button 
                  onClick={toggleFlip}
                  className="absolute top-6 right-6 p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-[#1E40AF] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors z-20"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Security Strip */}
                <div className={cn("absolute top-0 left-0 w-full h-1 opacity-50 rounded-t-[40px]", getRoleGradient())} />

                <div className="flex flex-col items-center w-full h-full pt-4">
                    {/* Logo */}
                    <div className="h-6 mb-4 flex items-center justify-center w-full">
                        <img src={logo} alt="Baynunah" className="h-full object-contain invert dark:invert-0 opacity-80" />
                    </div>

                    {/* Pass Type */}
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <p className={cn("tracking-[0.2em] uppercase font-medium text-[14px]", passSettings.theme === 'tech' ? "text-cyan-200" : "text-[#62748e]")}>
                            {getPassType()}
                        </p>
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.3em]", themeToken.pill)}>
                            {personaCopy.badge}
                        </span>
                        <p className={cn("text-[10px] font-medium max-w-[220px] leading-snug", personaCopy.accent, "dark:opacity-80")}>
                            {personaCopy.caption}
                        </p>
                    </div>

                    {/* QR Code Area */}
                    <div className="relative flex flex-col items-center group/qr cursor-pointer mb-8" onClick={() => setShowVerification(true)}>
                        <div className="w-48 h-48 relative flex items-center justify-center group-hover/qr:scale-105 transition-transform duration-300 bg-white dark:bg-slate-700 rounded-3xl pass-card__qr p-4">
                             {/* Corner Brackets */}
                             <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-slate-300 dark:border-slate-500 rounded-tl-lg" />
                             <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-slate-300 dark:border-slate-500 rounded-tr-lg" />
                             <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-slate-300 dark:border-slate-500 rounded-bl-lg" />
                             <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-slate-300 dark:border-slate-500 rounded-br-lg" />

                             {/* Subtle Scan Animation */}
                             <motion.div 
                                className="absolute left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent z-10"
                                animate={{ top: ["10%", "90%"], opacity: [0, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            
                            <QRCodeSVG 
                                value={`https://baynunah-pass.com/pass/${candidate.code}`} 
                                size={140} 
                                fgColor="#334155" 
                                bgColor="transparent"
                            />
                        </div>
                        
                        <div className="absolute -bottom-3 bg-white dark:bg-slate-700 px-4 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-600 flex items-center gap-1.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full", candidate.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400')} />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{candidate.status}</span>
                        </div>
                    </div>

                    {/* Identity */}
                    <div className="space-y-1 mb-6">
                        <h1 className={cn("text-2xl font-bold tracking-tight", themeToken.accent)}>{candidate.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">{candidate.title}</p>
                        {candidate.department && (
                            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium mt-1">{candidate.department}</p>
                        )}
                    </div>

                    {/* Solo Admin Shortcuts */}
                    <div className="w-full flex items-center justify-center gap-2 mb-6">
                        <button
                          disabled={!canCall}
                          onClick={() => {
                            if (canCall && typeof window !== 'undefined') {
                              window.open(`tel:${candidate.phone}`, '_self');
                            }
                          }}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:border-blue-100 dark:hover:border-blue-700 hover:text-[#1E40AF] dark:hover:text-blue-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Call
                        </button>
                        <button
                          disabled={!canEmail}
                          onClick={() => {
                            if (canEmail && typeof window !== 'undefined') {
                              window.open(`mailto:${candidate.email}?subject=Baynunah Pass Update`, '_self');
                            }
                          }}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:border-blue-100 dark:hover:border-blue-700 hover:text-[#1E40AF] dark:hover:text-blue-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Email
                        </button>
                        <button
                          onClick={() => setLocation('/candidate-profile')}
                          className="flex-1 px-3 py-2 rounded-xl border border-[#1E40AF]/20 dark:border-blue-500/30 bg-[#1E40AF]/10 dark:bg-blue-500/20 text-[12px] font-semibold text-[#1E40AF] dark:text-blue-400 hover:bg-[#1E40AF]/20 dark:hover:bg-blue-500/30 transition-colors"
                        >
                          Profile
                        </button>
                    </div>

                {passSettings.modules.availability && primaryLinkedSlot && (
                    <div className="w-full mb-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 text-left p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Linked Availability</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{primaryLinkedSlot.link.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{primaryLinkedSlot.slot.date} · {primaryLinkedSlot.slot.time}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsFlipped(true);
                                    setActiveSection('linked');
                                }}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-[11px] font-semibold text-slate-500 dark:text-slate-300 hover:border-[#1E40AF] hover:text-[#1E40AF]"
                            >
                                Manage
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {primaryLinkedSlot.link.slots.map((slot) => {
                                const isSelected = slot.candidateCode === candidate.code && slot.status === 'booked';
                                const isDisabled = persona !== 'candidate' || slot.status === 'held' || (slot.status === 'booked' && !isSelected);
                                return (
                                    <button
                                        key={slot.id}
                                        onClick={() => handleCandidateSlotInteraction(primaryLinkedSlot.link, slot)}
                                        disabled={isDisabled}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors",
                                            isSelected
                                                ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                                                : "border-slate-200 text-slate-500 hover:border-[#1E40AF]/40 disabled:opacity-40"
                                        )}
                                    >
                                        {slot.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {passSettings.modules.interactions && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4 max-w-[240px]">
                      {soloTip}
                    </p>
                )}

                {passSettings.modules.timeline && (
                <div className="w-full mt-auto relative">
                        {/* Container: visible on mobile, hover-reveal on desktop */}
                        <div className="overflow-hidden max-h-[140px] opacity-100 md:max-h-0 md:opacity-0 md:group-hover:max-h-[140px] md:group-hover:opacity-100 transition-all duration-500 ease-out">
                            <div 
                                className="pt-4 border-t border-slate-100 hover:bg-slate-50 transition-colors rounded-xl p-2 cursor-pointer" 
                                onClick={() => setLocation('/candidate-profile')}
                            >
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Recruitment Stage</span>
                                        <span className="text-xs font-bold text-[#1E40AF] uppercase tracking-wide flex items-center gap-1">
                                            {candidate.timeline.find(t => t.status === 'current')?.title || 'In Progress'}
                                            <ChevronRight className="w-3 h-3 text-slate-300 hover:text-[#1E40AF] transition-colors" />
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-medium text-slate-400">
                                        Step {candidate.timeline.findIndex(t => t.status === 'current') + 1} of {candidate.timeline.length}
                                    </span>
                                </div>
                                
                                <div className="flex gap-1 h-1.5 w-full">
                                    {candidate.timeline.map((stage, i) => {
                                        const isActive = stage.status === 'current';
                                        const isCompleted = stage.status === 'completed';
                                        return (
                                            <div 
                                                key={stage.id} 
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
                        
                        {/* Handle Indicator (Hidden on mobile, visible on desktop when widget is hidden) */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200 rounded-full hidden md:block md:opacity-100 md:group-hover:opacity-0 transition-opacity duration-300 delay-100" />
                </div>
                )}
                </div>
              </div>

              {/* BACK FACE (2x2 Menu or Detail) */}
              <div 
                className={cn(
                  "absolute inset-0 backface-hidden rounded-[40px] p-6 flex flex-col transition-colors duration-500",
                  passSettings.theme === 'tech' ? "bg-[#020617] text-slate-100" : "bg-[#f8fafc]"
                )}
                style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    boxShadow: '20px 20px 60px #c5c5c5, -20px -20px 60px #ffffff'
                }}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    {activeSection ? (
                         <button 
                            onClick={() => setActiveSection(null)}
                            className="p-2 -ml-2 rounded-full text-slate-400 hover:text-[#1E40AF] hover:bg-blue-50 transition-colors flex items-center gap-1 group"
                        >
                            <div className="w-6 h-6 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:border-blue-100">
                                <ArrowRight className="w-3 h-3 rotate-180" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
                        </button>
                    ) : (
                        <div className="flex items-center justify-center w-full relative">
                            <img src={logo} alt="Baynunah" className="h-5 object-contain invert opacity-80" />
                        </div>
                    )}
                    
                    {!activeSection && (
                        <button 
                            onClick={toggleFlip}
                            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-[#1E40AF] hover:bg-blue-50 transition-colors"
                        >
                            <RotateCw className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 h-full overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activeSection ? (
                            <motion.div 
                                key="detail"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {renderDetailContent()}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="menu"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 gap-2 w-full max-w-[280px] mx-auto place-content-center flex-1"
                            >
                                {backMenuItems.length === 0 ? (
                                    <div className="col-span-2 text-center text-[11px] text-slate-400">
                                        All modules are hidden for this pass.
                                    </div>
                                ) : (
                                    backMenuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            className="w-full aspect-[4/3] bg-white text-slate-400 hover:text-slate-600 transition-all duration-200 outline-none border-none flex flex-col items-center justify-center gap-2 group relative hover:-translate-y-0.5"
                                            style={{
                                                borderRadius: '24px',
                                                boxShadow: 'inset 2px 2px 2px #fff, inset -2px -2px 2px #e2e8f0, 2px 2px 8px #e2e8f0'
                                            }}
                                        >
                                            <item.icon className="w-7 h-7 stroke-[1.5]" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">{item.label}</span>
                                        </button>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center ring-2 ring-slate-100">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{candidate.name}</h3>
                  <p className="text-xs text-slate-500">{candidate.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="px-3 py-2 rounded-xl bg-blue-50 text-[#1E40AF] text-xs font-semibold border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  HR Console
                </button>
                <button 
                  onClick={toggleExpand}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <ChevronUp className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-1"
                >
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-tight">Stage</span>
                  <span className="text-lg font-bold text-[#1E40AF]">{candidate.timeline.find(t => t.status === 'current')?.title || 'In Progress'}</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-1"
                >
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-tight">Assessments</span>
                  <span className="text-lg font-bold text-[#1E40AF]">{candidate.evaluations.length}</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-1"
                >
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-tight">Documents</span>
                  <span className="text-lg font-bold text-[#1E40AF]">{candidate.documents.length}</span>
                </motion.div>
              </div>

              {/* Info Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Contact Information</h4>
                
                {candidate.location && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-slate-500">Location</p>
                      <p className="text-slate-900 font-medium">{candidate.location}</p>
                    </div>
                  </div>
                )}

                {candidate.email && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-slate-500">Email</p>
                      <p className="text-slate-900 font-medium break-all">{candidate.email}</p>
                    </div>
                  </div>
                )}

                {candidate.phone && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-slate-500">Phone</p>
                      <p className="text-slate-900 font-medium">{candidate.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider px-1">Timeline</h4>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="relative pl-2 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {candidate.timeline.map((item, i) => (
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
                  <QRCodeSVG value={candidate.code} size={24} fgColor="#ffffff" bgColor="transparent" />
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