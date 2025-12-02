import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Briefcase,
  Zap,
  Bell,
  Bug,
  User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Candidate {
  id: number;
  name: string;
  code: string;
  stage: number;
  status: string;
  role?: string;
}

interface AdminControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAGES = [
  { id: 1, name: 'Application' },
  { id: 2, name: 'Phone Screen' },
  { id: 3, name: 'Technical Interview' },
  { id: 4, name: 'Final Interview' },
  { id: 5, name: 'Offer' },
  { id: 6, name: 'Onboarding' },
];

export function AdminControlCenter({ isOpen, onClose }: AdminControlCenterProps) {
  const queryClient = useQueryClient();
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [settings, setSettings] = useState({
    autoProgression: true,
    emailNotifications: true,
    debugMode: false,
  });

  const { data: candidates = [] } = useQuery<Candidate[]>({
    queryKey: ['/api/candidates'],
    staleTime: 30000,
  });

  const selectedPerson = candidates.find(c => c.id === selectedPersonId);

  useEffect(() => {
    if (candidates.length > 0 && !selectedPersonId) {
      setSelectedPersonId(candidates[0].id);
    }
  }, [candidates, selectedPersonId]);

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: number }) => {
      const stageNames = ['Applied', 'Phone Screen', 'Technical Interview', 'Final Interview', 'Offer Extended', 'Onboarding'];
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stage, 
          status: stageNames[stage - 1] || 'In Progress' 
        }),
      });
      if (!response.ok) throw new Error('Failed to update stage');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
    },
  });

  const handlePreviousStage = () => {
    if (selectedPerson && selectedPerson.stage > 1) {
      updateStageMutation.mutate({ 
        id: selectedPerson.id, 
        stage: selectedPerson.stage - 1 
      });
    }
  };

  const handleNextStage = () => {
    if (selectedPerson && selectedPerson.stage < 6) {
      updateStageMutation.mutate({ 
        id: selectedPerson.id, 
        stage: selectedPerson.stage + 1 
      });
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const candidateCount = candidates.filter(c => c.stage < 6).length;
  const employeeCount = candidates.filter(c => c.stage === 6).length;

  const currentStageName = selectedPerson 
    ? STAGES.find(s => s.id === selectedPerson.stage)?.name || `Stage ${selectedPerson.stage}`
    : 'No Selection';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
            data-testid="admin-overlay"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[400px] max-w-[90vw] bg-slate-900 text-white shadow-2xl z-50 overflow-y-auto"
            data-testid="admin-panel"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg" data-testid="panel-title">HR Control Center</h2>
                    <p className="text-sm text-slate-400">Admin Testing Interface</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center transition-colors"
                  data-testid="button-close-admin"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                  <User className="w-4 h-4" />
                  <span>Select Person</span>
                </div>
                <select
                  value={selectedPersonId || ''}
                  onChange={(e) => setSelectedPersonId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer hover:border-slate-600 transition-colors"
                  data-testid="select-person"
                >
                  {candidates.map(candidate => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} - Stage {candidate.stage}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-400 mb-1">Current Stage</p>
                <p className="text-xl font-semibold" data-testid="text-current-stage">
                  {currentStageName}
                </p>
              </div>

              <div className="mb-8">
                <p className="text-sm text-slate-400 mb-3">Stage Navigation</p>
                <div className="flex gap-3">
                  <button
                    onClick={handlePreviousStage}
                    disabled={!selectedPerson || selectedPerson.stage <= 1 || updateStageMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 transition-colors"
                    data-testid="button-previous-stage"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleNextStage}
                    disabled={!selectedPerson || selectedPerson.stage >= 6 || updateStageMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 transition-colors"
                    data-testid="button-next-stage"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm text-slate-400 mb-3">System Settings</p>
                <div className="space-y-3">
                  <SettingToggle
                    icon={<Zap className="w-5 h-5" />}
                    label="Auto-Progression"
                    description="Automatically advance when conditions met"
                    enabled={settings.autoProgression}
                    onToggle={() => toggleSetting('autoProgression')}
                    testId="toggle-auto-progression"
                  />
                  <SettingToggle
                    icon={<Bell className="w-5 h-5" />}
                    label="Email Notifications"
                    description="Send email updates to candidates"
                    enabled={settings.emailNotifications}
                    onToggle={() => toggleSetting('emailNotifications')}
                    testId="toggle-email-notifications"
                  />
                  <SettingToggle
                    icon={<Bug className="w-5 h-5" />}
                    label="Debug Mode"
                    description="Show detailed system logs"
                    enabled={settings.debugMode}
                    onToggle={() => toggleSetting('debugMode')}
                    testId="toggle-debug-mode"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-3">Quick Stats</p>
                <div className="flex gap-3">
                  <div className="flex-1 bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Candidates</span>
                    </div>
                    <p className="text-3xl font-bold text-cyan-400" data-testid="stat-candidates">
                      {candidateCount}
                    </p>
                  </div>
                  <div className="flex-1 bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">Employees</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-400" data-testid="stat-employees">
                      {employeeCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface SettingToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  testId: string;
}

function SettingToggle({ icon, label, description, enabled, onToggle, testId }: SettingToggleProps) {
  return (
    <div 
      className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 cursor-pointer hover:bg-slate-800 transition-colors"
      onClick={onToggle}
      data-testid={testId}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300">
          {icon}
        </div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <div 
        className={`w-12 h-7 rounded-full relative transition-colors ${
          enabled ? 'bg-cyan-500' : 'bg-slate-600'
        }`}
      >
        <div 
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
    </div>
  );
}

export function AdminButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-800 transition-colors z-30"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="button-open-admin"
    >
      <Settings className="w-6 h-6" />
    </motion.button>
  );
}
