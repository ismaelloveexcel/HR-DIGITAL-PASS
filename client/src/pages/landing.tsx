import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Search, ShieldCheck, ClipboardCheck, Clock3, Link2, Layers, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@assets/baynunah-logo_1764408063481.png';

type SlotStatus = 'selected' | 'open' | 'hold';

type LinkedSlot = {
  id: string;
  label: string;
  detail: string;
  status: SlotStatus;
};

export default function Landing() {
  const [code, setCode] = useState('');
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      setLocation(`/pass/${code.trim().toUpperCase()}`);
    }
  };

  const adminStats = [
    { label: 'Active passes', value: '03', detail: 'Candidate · Manager · Onboarding' },
    { label: 'Tasks queued', value: '05', detail: 'Interviews • Docs • Offers' },
    { label: 'Starts this week', value: '01', detail: 'Prep onboarding kit' },
  ];

  const soloChecklist = [
    'Share the latest pass link before each check-in',
    'Log documents within 5 minutes of receiving them',
    'Send onboarding welcome pack 48h before start',
  ];

  const linkedSlots: LinkedSlot[] = [
    { id: 'slot-a', label: '09:30', detail: 'HQ · Floor 4', status: 'selected' },
    { id: 'slot-b', label: '12:00', detail: 'Video bridge', status: 'open' },
    { id: 'slot-c', label: '16:00', detail: 'HQ · Boardroom', status: 'hold' },
  ];

  const passTypes = [
    { label: 'Candidate pass', code: 'PASS-001', note: 'Live journey' },
    { label: 'Manager brief', code: 'REQ-001', note: 'Aligned slots' },
    { label: 'Onboarding kit', code: 'ONB-001', note: 'Ready to deploy' },
  ];

  const moduleToggles = [
    { label: 'Timeline', detail: 'Milestones', enabled: true },
    { label: 'Documents', detail: 'Uploads sync', enabled: true },
    { label: 'Availability', detail: 'Slots + QR', enabled: true },
    { label: 'Broadcast', detail: 'Digest emails', enabled: false },
  ];

  const workflowColumns = [
    {
      id: 'launch',
      tag: 'Flow 01',
      icon: Layers,
      title: 'Launch wallet passes with context',
      copy: 'Spin up candidate, manager, and onboarding views from one access code so nobody has to guess where information lives.',
      items: [
        'Persona buttons stay labelled — no hidden URLs.',
        'Flip front/back views instead of rebuilding screens.',
        'Each pass ships with QR, share, and console shortcuts.'
      ],
    },
    {
      id: 'sync',
      tag: 'Flow 02',
      icon: Link2,
      title: 'Keep every update in one live thread',
      copy: 'Linked slots, docs, and notes cascade instantly so the whole team sees the same state without extra broadcasts.',
      items: [
        'Availability edits ripple across personas in real time.',
        'Candidates pick guided slots instead of empty calendars.',
        'Console buttons jump to calls, mail, or the full profile.'
      ],
    },
    {
      id: 'automate',
      tag: 'Flow 03',
      icon: ShieldCheck,
      title: 'Automate maintenance work',
      copy: 'Toggle modules, reminders, and digests without engineers — the pass stays clean while ops stays fast.',
      items: [
        'Switch timeline, documents, availability, and insights per pass.',
        'Preset nudges send reminders and digest summaries.',
        'Action tips surface the next move on every dashboard.'
      ],
    },
  ];

  const slotColors: Record<SlotStatus, string> = {
    selected: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    open: 'bg-slate-100 text-slate-600 border-slate-200',
    hold: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#edf2ff] via-white to-white relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-[#cfdcfe] via-transparent to-transparent opacity-80 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-[520px] bg-gradient-to-l from-[#eff4ff] to-transparent opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-3xl bg-white shadow-[10px_10px_40px_rgba(15,23,42,0.05)] flex items-center justify-center">
              <img src={logo} alt="Baynunah" className="w-9 h-9 object-contain invert opacity-90" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 tracking-[0.4em] uppercase">Solo HR</p>
              <p className="text-sm text-slate-500">Digital pass platform</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.4em]">
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200">Secure</span>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200">Real-time</span>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200">Mobile-first</span>
          </div>
        </header>

        <div className="pt-10 grid gap-12 lg:grid-cols-[1.15fr_0.9fr] items-center">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 text-sm font-medium text-slate-600">
              <Sparkles className="w-4 h-4 text-[#1E40AF]" />
              Wallet-style passes for every persona
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                One pass.
                <br />
                <span className="text-[#1E40AF]">Every persona.</span>
              </h1>
              <p className="text-slate-600 text-xl max-w-2xl leading-relaxed">
                Premium HR wallet for candidates, managers, and onboarding — all synced in real-time with zero complexity.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full">
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#1E40AF]/20 to-blue-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white rounded-2xl border-2 border-slate-100 group-hover:border-[#1E40AF]/30 shadow-xl shadow-slate-200/50 flex items-center gap-3 p-2 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E40AF] to-blue-600 text-white flex items-center justify-center shadow-md">
                    <Search className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your pass code"
                    className="flex-1 bg-transparent text-slate-900 text-lg font-semibold placeholder:text-slate-400 outline-none"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!code}
                    className="h-14 px-8 rounded-xl bg-[#1E40AF] text-white font-bold flex items-center gap-2 hover:bg-blue-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                  >
                    Unlock
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-1">Pass Playbook</p>
                    <p className="text-sm text-slate-600">Quick access wallets</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1E40AF] flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-3">
                  {passTypes.map((pass) => (
                    <button
                      key={pass.code}
                      onClick={() => setLocation(`/pass/${pass.code}`)}
                      className="w-full rounded-2xl border-2 border-slate-100 hover:border-[#1E40AF] px-5 py-4 text-left hover:bg-blue-50/50 transition-all flex items-center justify-between gap-4 group shadow-sm hover:shadow-md"
                    >
                      <div>
                        <p className="text-base font-bold text-slate-800 group-hover:text-[#1E40AF] transition-colors">{pass.label}</p>
                        <p className="text-xs text-slate-500 leading-tight mt-0.5">{pass.note}</p>
                      </div>
                      <span className="font-mono text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 group-hover:bg-blue-50 group-hover:text-[#1E40AF] group-hover:border-blue-200 transition-all">{pass.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-1">Status Board</p>
                    <p className="text-sm text-slate-600">Live metrics</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Clock3 className="w-5 h-5" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {adminStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">{stat.label}</p>
                      <div className="text-4xl font-bold text-[#1E40AF] mb-1">{stat.value}</div>
                      <p className="text-xs text-slate-500 leading-tight">{stat.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/70 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-1">Module Control</p>
                  <p className="text-sm text-slate-600">Toggle features instantly</p>
                </div>
                <ShieldCheck className="w-6 h-6 text-[#1E40AF]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {moduleToggles.map((module) => (
                  <div
                    key={module.label}
                    className={cn(
                      "rounded-2xl border-2 px-4 py-4 flex flex-col gap-1 transition-all shadow-sm",
                      module.enabled 
                        ? 'border-[#1E40AF] bg-blue-50' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-bold", module.enabled ? 'text-[#1E40AF]' : 'text-slate-700')}>{module.label}</p>
                      <span className={cn(
                        "text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full",
                        module.enabled ? 'bg-[#1E40AF] text-white' : 'bg-slate-200 text-slate-500'
                      )}>
                        {module.enabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{module.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -top-10 right-6 w-48 rounded-2xl bg-slate-900 text-white p-4 shadow-2xl shadow-slate-900/40 rotate-6">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Manager view</span>
                <span className="font-mono">REQ-001</span>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                {linkedSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between">
                    <span>{slot.label}</span>
                    <span className={slot.status === 'selected' ? 'text-emerald-300' : slot.status === 'open' ? 'text-white/80' : 'text-amber-300'}>
                      {slot.status === 'hold' ? 'hold' : slot.status === 'selected' ? 'booked' : 'open'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-white/70">Open a slot here and the candidate pass updates instantly.</p>
            </div>

            <div className="relative z-10 rounded-[32px] bg-white shadow-[25px_30px_80px_rgba(15,23,42,0.15)] border border-white/60 p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Candidate pass</p>
                  <h3 className="text-2xl font-bold text-[#1E40AF]">Sarah Al-Mansouri</h3>
                  <p className="text-sm text-slate-500">Senior UX Designer</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Pass code</p>
                  <p className="font-mono text-sm text-slate-700">PASS-001</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {['Portfolio review', 'Final interview', 'Onboarding kit'].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Stage {index + 1}</p>
                    <p className="text-sm font-semibold text-slate-700">{item}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Linked availability</p>
                    <p className="text-sm font-semibold text-slate-700">Final interview panel</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">Synced</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {linkedSlots.map((slot) => (
                    <span key={slot.id} className={`px-3 py-1 rounded-full border text-xs font-semibold ${slotColors[slot.status]}`}>
                      {slot.label}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">Candidate selects from live slots. Manager sees the booking without emails.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Next step</p>
                  <p className="font-semibold text-slate-800">Dec 05 · 14:00</p>
                  <p className="text-xs text-slate-500">Baynunah Tower · Floor 4</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Documents</p>
                  <p className="font-semibold text-slate-800">2 / 5</p>
                  <p className="text-xs text-slate-500">Auto reminders enabled</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                <span>Live view</span>
                <div className="flex gap-1 w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <span key={i} className={`flex-1 ${i < 3 ? 'bg-emerald-400' : i === 3 ? 'bg-[#1E40AF]' : 'bg-slate-300'}`} />
                  ))}
                </div>
                <span>Share</span>
              </div>
            </div>
          </motion.section>
        </div>

        <section className="mt-16 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Feature map</p>
              <h2 className="text-3xl font-semibold text-slate-900 text-balance">Solo HR organised into three clear flows.</h2>
            </div>
            <p className="text-sm text-slate-500 max-w-xl text-balance">
              Launch once, stay synced, and let automations keep it tidy. Each block below explains what lives inside that flow.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {workflowColumns.map((column) => {
              const Icon = column.icon;
              return (
                <div key={column.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1E40AF] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-semibold">{column.tag}</p>
                      <h3 className="text-lg font-semibold text-slate-900">{column.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed text-balance">{column.copy}</p>
                  <ul className="space-y-2">
                    {column.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF] mt-2" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-slate-200/60 p-6 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1E40AF] flex items-center justify-center">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Linked passes</p>
                <p className="text-lg font-semibold text-slate-900">Manager availability feeds directly into the candidate wallet.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Candidate · PASS-001</p>
                    <p className="text-sm font-semibold text-slate-700">Sarah confirms slot</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">Live</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {linkedSlots.map((slot) => (
                    <button
                      key={`${slot.id}-candidate`}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${slotColors[slot.status]}`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">When Sarah taps 09:30 the manager brief and onboarding queue update instantly.</p>
              </div>

              <div className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Manager · REQ-001</p>
                    <p className="text-sm font-semibold text-slate-700">Slots available</p>
                  </div>
                  <Layers className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mt-4 space-y-2">
                  {linkedSlots.map((slot) => (
                    <div key={`${slot.id}-manager`} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-slate-800">{slot.label}</p>
                        <p className="text-xs text-slate-500">{slot.detail}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-[0.3em] ${slot.status === 'selected' ? 'bg-emerald-50 text-emerald-600' : slot.status === 'open' ? 'bg-blue-50 text-[#1E40AF]' : 'bg-amber-50 text-amber-600'}`}>
                        {slot.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 text-white p-4 flex items-center gap-4">
              <Clock3 className="w-10 h-10 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold">Next milestone reminder</p>
                <p className="text-xs text-white/80">Dec 05 · 14:00 · Final interview prep kit auto-shares 30 minutes before.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-[32px] bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-6 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1E40AF] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Solo HR toolkit</p>
                <p className="text-lg font-semibold text-slate-900">Stay ahead with one tap</p>
              </div>
            </div>
            <ul className="space-y-3">
              {soloChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-[#1E40AF]">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">Need more detail?</p>
              <p className="text-slate-500">Open the full candidate console for detailed insights, compensation data, and document control.</p>
            </div>
            <button
              onClick={() => setLocation('/candidate-profile')}
              className="w-full py-3 rounded-2xl bg-[#1E40AF] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 hover:bg-blue-900"
            >
              Open Candidate Console
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </section>

        <div className="mt-12 text-center text-[11px] text-slate-400 tracking-[0.4em] uppercase">
          Secure · Encrypted · Digital · Concept by Ismael
        </div>
      </div>
    </div>
  );
}
