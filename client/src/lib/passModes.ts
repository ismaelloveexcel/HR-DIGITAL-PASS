import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  CalendarCheck2,
  CalendarClock,
  ClipboardList,
  ClipboardSignature,
  FileText,
  Inbox,
  Layers,
  LifeBuoy,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Workflow,
} from 'lucide-react';
import type { PassPersona, UniversalPassRecord } from '@/lib/passDataStore';

export type FooterAction = 'menu' | 'support' | 'profile';

export interface SupportAction {
  label: string;
  detail: string;
  type: 'whatsapp' | 'email' | 'phone' | 'portal';
  icon: LucideIcon;
  value: string;
}

export interface FooterButton {
  label: string;
  action: FooterAction;
  icon: LucideIcon;
}

export interface MenuTile {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface PassModeConfig {
  passTitle: string;
  badge: string;
  caption: string;
  accentClass: string;
  notification: string;
  metaLabel: string;
  stageLabels: string[];
  menuTiles: MenuTile[];
  support: SupportAction[];
  footer: FooterButton[];
  identity: {
    secondaryLabel: string;
    metadataLabel: string;
    metadataPrefix?: string;
    secondaryAccessor: (record: UniversalPassRecord) => string;
    metadataAccessor: (record: UniversalPassRecord) => string;
  };
}

export const PASS_MODE_CONFIG: Record<PassPersona, PassModeConfig> = {
  candidate: {
    passTitle: 'Candidate Pass',
    badge: 'Candidate Journey',
    caption: 'Real-time hiring companion',
    accentClass: 'text-[#1E40AF]',
    notification: 'Timeline synced · 3 updates',
    metaLabel: 'Candidate ID',
    stageLabels: ['Application', 'Screening', 'Assessment', 'Interview', 'Offer', 'Onboarding'],
    menuTiles: [
      { id: 'timeline', label: 'Full Timeline', description: 'See every milestone & SLA', icon: CalendarClock },
      { id: 'evaluations', label: 'Evaluations', description: 'Score rings & assessments', icon: BadgeCheck },
      { id: 'inbox', label: 'Inbox', description: 'Notes & HR nudges', icon: Inbox },
      { id: 'documents', label: 'Documents', description: 'Upload, review & share', icon: FileText },
      { id: 'settings', label: 'Settings', description: 'WhatsApp, dark mode, wallet', icon: ShieldCheck },
    ],
    support: [
      { label: 'WhatsApp HR', detail: '+971 50 222 1111', type: 'whatsapp', icon: MessageCircle, value: 'https://wa.me/971502221111' },
      { label: 'Email HR', detail: 'talent@baynunah.ae', type: 'email', icon: Inbox, value: 'mailto:talent@baynunah.ae' },
      { label: 'Emergency', detail: '+971 2 555 9999', type: 'phone', icon: PhoneCall, value: 'tel:+97125559999' },
    ],
    footer: [
      { label: 'Menu', action: 'menu', icon: Layers },
      { label: 'Support', action: 'support', icon: LifeBuoy },
      { label: 'Profile', action: 'profile', icon: Wallet },
    ],
    identity: {
      secondaryLabel: 'Position',
      metadataLabel: 'Candidate ID',
      metadataPrefix: 'CAND-',
      secondaryAccessor: (record) => record.personal.position,
      metadataAccessor: (record) => record.personal.identifier,
    },
  },
  manager: {
    passTitle: 'Manager Pass',
    badge: 'Hiring Leader Brief',
    caption: 'Control every approval touchpoint',
    accentClass: 'text-emerald-600',
    notification: '2 approvals awaiting',
    metaLabel: 'Manager ID',
    stageLabels: ['New Role Request', 'HR Screening', 'Shortlisting', 'Evaluation', 'Interview Feedback', 'Final Decision'],
    menuTiles: [
      { id: 'timeline', label: 'Candidate Pipeline', description: 'Live status for each role', icon: Workflow },
      { id: 'approvals', label: 'Approvals', description: 'RRF, offer & interview sign-off', icon: ClipboardSignature },
      { id: 'evaluations', label: 'Scorecards', description: 'Submit & view assessments', icon: BadgeCheck },
      { id: 'team', label: 'Team Requests', description: 'Leave, attendance, documents', icon: Users },
      { id: 'documents', label: 'Attachments', description: 'Score sheets & notes', icon: FileText },
    ],
    support: [
      { label: 'WhatsApp HRBP', detail: '+971 50 333 2222', type: 'whatsapp', icon: MessageCircle, value: 'https://wa.me/971503332222' },
      { label: 'Executive Support', detail: 'exec-hr@baynunah.ae', type: 'email', icon: Inbox, value: 'mailto:exec-hr@baynunah.ae' },
      { label: 'Emergency', detail: '+971 2 555 8888', type: 'phone', icon: PhoneCall, value: 'tel:+97125558888' },
    ],
    footer: [
      { label: 'Menu', action: 'menu', icon: Layers },
      { label: 'Support', action: 'support', icon: LifeBuoy },
      { label: 'Console', action: 'profile', icon: ShieldCheck },
    ],
    identity: {
      secondaryLabel: 'Department',
      metadataLabel: 'Manager ID',
      metadataPrefix: 'MGR-',
      secondaryAccessor: (record) => record.personal.department ?? 'Leadership',
      metadataAccessor: (record) => record.personal.identifier,
    },
  },
  employee: {
    passTitle: 'Employee Pass',
    badge: 'Experience Wallet',
    caption: 'Attendance, payroll & requests',
    accentClass: 'text-amber-600',
    notification: 'Payroll released · Nov',
    metaLabel: 'Employee No.',
    stageLabels: ['Joining', 'Probation', 'Performance Review', 'Training & Development', 'Promotion/Transfer', 'Renewal / Exit'],
    menuTiles: [
      { id: 'profile', label: 'Profile', description: 'Employment essentials', icon: Sparkles },
      { id: 'payslips', label: 'Payroll', description: 'View slips & bonuses', icon: Wallet },
      { id: 'leave', label: 'Leave', description: 'Balance & new requests', icon: CalendarCheck2 },
      { id: 'attendance', label: 'Attendance', description: 'Daily punch-in summary', icon: CalendarClock },
      { id: 'requests', label: 'Requests', description: 'NOC, salary cert, more', icon: ClipboardList },
      { id: 'policies', label: 'Policies', description: 'Handbook & benefits', icon: ShieldCheck },
    ],
    support: [
      { label: 'People Ops WhatsApp', detail: '+971 50 111 4444', type: 'whatsapp', icon: MessageCircle, value: 'https://wa.me/971501114444' },
      { label: 'HR Service Desk', detail: 'people@baynunah.ae', type: 'email', icon: Inbox, value: 'mailto:people@baynunah.ae' },
      { label: 'Emergency', detail: '+971 2 555 7777', type: 'phone', icon: PhoneCall, value: 'tel:+97125557777' },
    ],
    footer: [
      { label: 'Menu', action: 'menu', icon: Layers },
      { label: 'Support', action: 'support', icon: LifeBuoy },
      { label: 'Wallet', action: 'profile', icon: Wallet },
    ],
    identity: {
      secondaryLabel: 'Job Title',
      metadataLabel: 'Employee No.',
      metadataPrefix: 'EMP-',
      secondaryAccessor: (record) => record.personal.position,
      metadataAccessor: (record) => record.personal.employeeNumber ?? record.personal.identifier,
    },
  },
};
