/**
 * SoloHRToolbar - Floating action button/sidebar for SOLO HR management tasks
 * Provides quick access to edit, export, import, and theme toggle
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Download,
  Upload,
  Sun,
  Moon,
  RefreshCw,
  Settings,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { usePassData } from '@/hooks/usePassData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SoloHRToolbarProps {
  className?: string;
  onEditPass?: () => void;
}

export function SoloHRToolbar({ className, onEditPass }: SoloHRToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();
  const { downloadData, uploadData, reset, lastSaved } = usePassData();
  const { toast } = useToast();

  const handleExport = () => {
    try {
      downloadData(`hr-pass-export-${new Date().toISOString().split('T')[0]}.json`);
      toast({
        title: 'Export Successful',
        description: 'Pass data has been downloaded as JSON.',
        variant: 'default',
      });
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Could not export pass data.',
        variant: 'destructive',
      });
    }
    setIsOpen(false);
  };

  const handleImport = async () => {
    const success = await uploadData();
    if (success) {
      toast({
        title: 'Import Successful',
        description: 'Pass data has been loaded from file.',
        variant: 'default',
      });
    } else {
      toast({
        title: 'Import Failed',
        description: 'Could not import pass data. Please check the file format.',
        variant: 'destructive',
      });
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    reset();
    toast({
      title: 'Data Reset',
      description: 'Pass data has been reset to defaults.',
      variant: 'default',
    });
    setIsOpen(false);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    toast({
      title: `Theme Changed`,
      description: `Switched to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode.`,
      variant: 'default',
    });
  };

  const actions = [
    {
      id: 'export',
      icon: Download,
      label: 'Export Data',
      description: 'Download all pass data as JSON',
      onClick: handleExport,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'import',
      icon: Upload,
      label: 'Import Data',
      description: 'Load pass data from JSON file',
      onClick: handleImport,
      color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100',
    },
    {
      id: 'theme',
      icon: resolvedTheme === 'light' ? Moon : Sun,
      label: resolvedTheme === 'light' ? 'Dark Mode' : 'Light Mode',
      description: 'Toggle theme appearance',
      onClick: handleThemeToggle,
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    },
    {
      id: 'reset',
      icon: RefreshCw,
      label: 'Reset Data',
      description: 'Restore default pass data',
      onClick: handleReset,
      color: 'text-amber-600 bg-amber-50 hover:bg-amber-100',
    },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className={cn(
          'fixed bottom-6 right-6 z-50',
          className
        )}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors',
            isOpen
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-[#1E40AF] text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400'
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Settings className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Last Saved Indicator */}
        {lastSaved && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-12 right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Action Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-50 w-72"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#1E40AF] dark:bg-blue-500 text-white flex items-center justify-center">
                      <Menu className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Solo HR Toolkit</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Quick actions</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2 space-y-1">
                  {actions.map((action, index) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={action.onClick}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group',
                        'hover:scale-[1.02]',
                        action.color,
                        'dark:bg-opacity-20 dark:hover:bg-opacity-30'
                      )}
                    >
                      <div className="shrink-0">
                        <action.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{action.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{action.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Auto-save enabled</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
