import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import logo from '@assets/baynunah-logo_1764408063481.png';

export default function Landing() {
  const [code, setCode] = useState('');
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      setLocation(`/pass/${code.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-subtle flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent opacity-50 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10 flex flex-col items-center text-center"
      >
        {/* Logo Area */}
        <div className="w-24 h-24 bg-white rounded-3xl shadow-[20px_20px_60px_#c5c5c5,-20px_-20px_60px_#ffffff] flex items-center justify-center mb-8 p-4">
          <img src={logo} alt="Baynunah" className="w-full h-full object-contain invert opacity-90" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Baynunah Pass</h1>
        <p className="text-slate-500 mb-10 max-w-xs mx-auto">Secure digital access and identity management for the modern workplace.</p>

        {/* Search Box */}
        <form onSubmit={handleSubmit} className="w-full relative group">
          <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-hover:bg-blue-500/10 transition-all" />
          <div className="relative bg-white p-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
            <div className="pl-4 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Enter Access Code (e.g. PASS-001)" 
              className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-300 font-medium h-12"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!code}
              className="h-12 w-12 bg-[#1E40AF] rounded-xl flex items-center justify-center text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-900/20"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="mt-12 flex flex-col gap-3 w-full max-w-xs">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Quick Access Demo</p>
          <button onClick={() => setLocation('/pass/PASS-001')} className="text-sm text-slate-600 hover:text-[#1E40AF] py-2 px-4 rounded-lg bg-white border border-slate-100 hover:border-blue-100 hover:bg-blue-50 transition-all text-left flex justify-between items-center">
            <span>Candidate View</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">PASS-001</span>
          </button>
          <button onClick={() => setLocation('/pass/REQ-001')} className="text-sm text-slate-600 hover:text-[#1E40AF] py-2 px-4 rounded-lg bg-white border border-slate-100 hover:border-blue-100 hover:bg-blue-50 transition-all text-left flex justify-between items-center">
            <span>Manager View</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">REQ-001</span>
          </button>
          <button onClick={() => setLocation('/pass/ONB-001')} className="text-sm text-slate-600 hover:text-[#1E40AF] py-2 px-4 rounded-lg bg-white border border-slate-100 hover:border-blue-100 hover:bg-blue-50 transition-all text-left flex justify-between items-center">
            <span>Onboarding View</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">ONB-001</span>
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-6 text-center w-full">
        <p className="text-[10px] text-slate-300 font-mono mb-1">SECURE • ENCRYPTED • DIGITAL</p>
        <p className="text-[10px] text-slate-300 font-mono opacity-60">Concept by Ismael</p>
      </div>
    </div>
  );
}
