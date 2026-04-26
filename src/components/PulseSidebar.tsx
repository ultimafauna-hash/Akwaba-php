import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Map as MapIcon, Trophy, Globe, X, Sparkles, Activity, Mail, Plus } from 'lucide-react';
import { HistoryMini } from './HistoryMini';
import { MapMini } from './MapMini';
import { QuizMini } from './QuizMini';
import { StoryMini } from './StoryMini';
import { NewsletterSignup } from './NewsletterSignup';
import { cn } from '../lib/utils';

export const PulseSidebar = () => {
  const [activeFeature, setActiveFeature] = useState<'history' | 'map' | 'quiz' | 'diaspora' | 'newsletter' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    { id: 'history', icon: History, label: "L'Histoire", color: "text-slate-900", iconBg: "bg-slate-100", text: "Ce jour dans l'histoire" },
    { id: 'map', icon: MapIcon, label: "La Carte", color: "text-amber-500", iconBg: "bg-amber-50", text: "Carte interactive" },
    { id: 'quiz', icon: Trophy, label: "Le Quiz", color: "text-emerald-600", iconBg: "bg-emerald-50", text: "Défiez vos connaissances" },
    { id: 'diaspora', icon: Globe, label: "Diaspora", color: "text-indigo-600", iconBg: "bg-indigo-50", text: "Sucess Stories" },
    { id: 'newsletter', icon: Mail, label: "Newsletter", color: "text-primary", iconBg: "bg-primary/5", text: "Abonnez-vous à l'info" },
  ];

  const handleOpenFeature = (id: any) => {
    setActiveFeature(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Floating Action Button & Popup Menu */}
      <div className="fixed right-6 bottom-40 z-[210]">
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[-1]"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Popup Menu */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20, x: 0 }}
                animate={{ opacity: 1, scale: 1, y: -20, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20, x: 0 }}
                className="absolute bottom-full right-0 mb-4 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2 min-w-[220px] overflow-hidden"
              >
                <div className="flex flex-col">
                  {features.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleOpenFeature(f.id)}
                      className="flex items-center gap-4 w-full p-3.5 hover:bg-slate-50 rounded-[18px] transition-all group text-left"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                        f.iconBg,
                        f.color
                      )}>
                        <f.icon size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">{f.label}</span>
                        <span className="text-[9px] font-bold text-slate-400 capitalize">{f.text.split(' ').slice(0, 3).join(' ')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={cn(
            "w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all relative z-10",
            isMenuOpen ? "bg-slate-900 rotate-45" : "bg-[#1FA463]"
          )}
        >
          <div className="absolute inset-0 bg-[#1FA463] rounded-full animate-pulse opacity-40 -z-10" />
          {isMenuOpen ? <X size={24} /> : <Plus size={28} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {activeFeature && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-10 pointer-events-none">
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
               onClick={() => setActiveFeature(null)}
             />
             <div className="relative z-10 w-full max-w-md pointer-events-auto">
                <AnimatePresence mode="wait">
                  {activeFeature === 'history' && <HistoryMini key="h" onClose={() => setActiveFeature(null)} />}
                  {activeFeature === 'map' && <MapMini key="m" onClose={() => setActiveFeature(null)} />}
                  {activeFeature === 'quiz' && <QuizMini key="q" onClose={() => setActiveFeature(null)} />}
                  {activeFeature === 'diaspora' && <StoryMini key="d" onClose={() => setActiveFeature(null)} />}
                  {activeFeature === 'newsletter' && (
                    <motion.div
                      key="n"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative"
                    >
                      <button 
                        onClick={() => setActiveFeature(null)}
                        className="absolute -top-12 right-0 p-2 bg-white rounded-full shadow-lg text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <X size={20} />
                      </button>
                      <NewsletterSignup variant="sidebar" />
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Activity Pulse Indicator */}
      <div className="fixed left-6 bottom-6 z-50 pointer-events-none hidden lg:block">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white/80 backdrop-blur-md border border-slate-100 px-4 py-2.5 rounded-full flex items-center gap-3 shadow-lg"
         >
            <div className="relative">
               <Activity size={14} className="text-emerald-500" />
               <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kassiri Pulse <span className="text-emerald-500 ml-1">Live</span></span>
         </motion.div>
      </div>
    </>
  );
};
