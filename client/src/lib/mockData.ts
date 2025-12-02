export type UserRole = 'candidate' | 'manager' | 'onboarding';

export interface UserData {
  id: string;
  code: string;
  name: string;
  title: string;
  role: UserRole;
  avatarUrl: string;
  status: 'Active' | 'Pending' | 'Completed';
  department?: string;
  location?: string;
  email?: string;
  phone?: string;
  
  // Role specific data
  stats?: {
    label: string;
    value: string;
    icon?: string;
  }[];
  timeline?: {
    title: string;
    date: string;
    status: 'completed' | 'current' | 'upcoming';
  }[];
}

export const MOCK_USERS: Record<string, UserData> = {
  'PASS-001': {
    id: '1',
    code: 'PASS-001',
    name: 'Sarah Al-Mansouri',
    title: 'Senior UX Designer',
    role: 'candidate',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    status: 'Active',
    department: 'Design',
    location: 'Abu Dhabi, UAE',
    email: 'sarah.m@example.com',
    phone: '+971 50 123 4567',
    stats: [
      { label: 'Interview Stage', value: 'Final Round' },
      { label: 'Applied', value: '2 days ago' },
      { label: 'Score', value: '92%' }
    ],
    timeline: [
      { title: 'Application Received', date: 'Nov 25', status: 'completed' },
      { title: 'Screening Call', date: 'Nov 26', status: 'completed' },
      { title: 'Portfolio Review', date: 'Nov 28', status: 'completed' },
      { title: 'Final Interview', date: 'Today, 2:00 PM', status: 'current' }
    ]
  },
  'REQ-001': {
    id: '2',
    code: 'REQ-001',
    name: 'Khalid Al-Falahi',
    title: 'Engineering Director',
    role: 'manager',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200',
    status: 'Active',
    department: 'Engineering',
    location: 'Dubai, UAE',
    email: 'k.alfalahi@baynunah.ae',
    phone: '+971 55 987 6543',
    stats: [
      { label: 'Team Size', value: '24' },
      { label: 'Open Roles', value: '3' },
      { label: 'Department', value: 'Tech' }
    ],
    timeline: [
      { title: 'Q4 Review', date: 'Dec 15', status: 'upcoming' },
      { title: 'Team Offsite', date: 'Dec 20', status: 'upcoming' }
    ]
  },
  'ONB-001': {
    id: '3',
    code: 'ONB-001',
    name: 'James Wilson',
    title: 'Product Manager',
    role: 'onboarding',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
    status: 'Pending',
    department: 'Product',
    location: 'Remote / Abu Dhabi',
    email: 'j.wilson@baynunah.ae',
    phone: '+971 52 333 4444',
    stats: [
      { label: 'Start Date', value: 'Dec 01' },
      { label: 'Progress', value: '45%' },
      { label: 'Documents', value: '2/5' }
    ],
    timeline: [
      { title: 'Offer Signed', date: 'Nov 20', status: 'completed' },
      { title: 'Document Upload', date: 'Nov 22', status: 'current' },
      { title: 'IT Setup', date: 'Nov 29', status: 'upcoming' },
      { title: 'First Day', date: 'Dec 01', status: 'upcoming' }
    ]
  }
};
