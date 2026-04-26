import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map as MapIcon, Globe, MapPin, X, Info, ChevronRight, Navigation } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';

export const MapMini = ({ onClose }: { onClose: () => void }) => {
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const data = await api.getMapPoints();
      setPoints(data || []);
      if (data && data.length > 0) setSelectedPoint(data[0]);
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
      <div className="p-8 bg-amber-500 text-white relative shrink-0">
        <div className="absolute inset-0 african-pattern opacity-10" />
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-10 text-white">
          <X size={20} />
        </button>
        <div className="relative z-10 space-y-2">
           <div className="flex items-center gap-2 text-white/80">
              <MapIcon size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Interactive Map</span>
           </div>
           <h2 className="text-2xl font-black italic">Carte Akwaba</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : points.length > 0 ? (
          <>
            {selectedPoint && (
              <motion.div 
                key={selectedPoint.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="w-full h-40 bg-slate-100 rounded-3xl overflow-hidden relative shadow-inner">
                   <div className="absolute inset-0 grayscale opacity-20 bg-[url('https://www.transparenttextures.com/patterns/pinstripe-dark.png')]" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center animate-ping absolute" />
                      <MapPin size={32} className="text-amber-500 relative z-10" />
                   </div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase">
                      {selectedPoint.category}
                   </span>
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Globe size={10} /> {selectedPoint.country}
                   </span>
                </div>
                <h3 className="text-xl font-black">{selectedPoint.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed italic">"{selectedPoint.description}"</p>
                
                <div className="pt-4 flex gap-2">
                   <button className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <Navigation size={12} /> Voir plus
                   </button>
                </div>
              </motion.div>
            )}

            <div className="pt-6 border-t border-slate-50 space-y-4">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lieux à découvrir</h4>
               <div className="grid grid-cols-1 gap-2">
                  {points.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setSelectedPoint(p)}
                      className={cn(
                        "w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3",
                        selectedPoint?.id === p.id ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                        selectedPoint?.id === p.id ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                         <MapPin size={16} />
                      </div>
                      <div className="min-w-0">
                         <div className="text-[10px] font-black text-slate-900 truncate">{p.title}</div>
                         <div className="text-[8px] text-slate-400 font-bold uppercase">{p.country}</div>
                      </div>
                    </button>
                  ))}
               </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 px-8 space-y-4">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <Globe size={32} />
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">La carte interactive arrive bientôt.</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Propulsé par Kassiri Pulse • Akwaba Info</p>
      </div>
    </motion.div>
  );
};
