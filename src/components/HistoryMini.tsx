import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Calendar, ChevronRight, Clock, MapPin, X } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export const HistoryMini = ({ onClose }: { onClose: () => void }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    fetchTodayEvents();
  }, []);

  const fetchTodayEvents = async () => {
    try {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateStr = `${day}/${month}`;
      
      const data = await api.getHistoryEvents(dateStr);
      setEvents(data || []);
      if (data && data.length > 0) setSelectedEvent(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[600px] max-w-md w-full relative"
      onClick={e => e.stopPropagation()}
    >
      <div className="p-8 bg-slate-900 text-white relative shrink-0">
        <div className="absolute inset-0 african-pattern opacity-10" />
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-10 text-white">
          <X size={20} />
        </button>
        <div className="relative z-10 space-y-2">
           <div className="flex items-center gap-2 text-primary">
              <History size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Éphéméride Africaine</span>
           </div>
           <h2 className="text-2xl font-black italic">Ce jour dans l'Histoire</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length > 0 ? (
          <>
            {selectedEvent && (
              <motion.div 
                key={selectedEvent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {selectedEvent.image && (
                  <div className="w-full h-48 rounded-3xl overflow-hidden shadow-lg">
                    <img src={selectedEvent.image} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                   <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest">
                      {selectedEvent.year}
                   </div>
                   <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> {selectedEvent.category}
                   </div>
                </div>
                <h3 className="text-xl font-black italic leading-tight text-slate-900">{selectedEvent.title}</h3>
                <div className="markdown-body text-xs leading-relaxed text-slate-600 italic">
                  <ReactMarkdown>{selectedEvent.content}</ReactMarkdown>
                </div>
              </motion.div>
            )}

            {events.length > 1 && (
               <div className="pt-6 border-t border-slate-50 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Autres événements</h4>
                  <div className="space-y-3">
                     {(Array.isArray(events) ? events : []).filter(e => e.id !== selectedEvent?.id).map(e => (
                       <button 
                        key={e.id}
                        onClick={() => setSelectedEvent(e)}
                        className="w-full text-left p-4 rounded-2xl border border-slate-50 hover:border-primary/30 hover:bg-primary/5 transition-all group flex items-center justify-between"
                       >
                         <div>
                            <div className="text-[8px] font-black text-primary uppercase">{e.year}</div>
                            <div className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors line-clamp-1">{e.title}</div>
                         </div>
                         <ChevronRight size={14} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                       </button>
                     ))}
                  </div>
               </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 space-y-4">
             <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
                <Clock size={32} />
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Aucun événement répertorié pour aujourd'hui.</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Propulsé par Kassiri Pulse • Akwaba Info</p>
      </div>
    </motion.div>
  );
};
