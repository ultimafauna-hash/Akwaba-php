import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, MapPin, X, Star, ChevronLeft, ChevronRight, Quote, Heart } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export const StoryMini = ({ onClose }: { onClose: () => void }) => {
  const [stories, setStories] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const data = await api.getStories();
      setStories(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentStory = stories[currentIndex];

  const next = () => setCurrentIndex((currentIndex + 1) % stories.length);
  const prev = () => setCurrentIndex((currentIndex - 1 + stories.length) % stories.length);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[600px] max-w-md w-full relative"
      onClick={e => e.stopPropagation()}
    >
      <div className="p-8 bg-indigo-600 text-white relative shrink-0">
        <div className="absolute inset-0 african-pattern opacity-10" />
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-10 text-white">
          <X size={20} />
        </button>
        <div className="relative z-10 space-y-2">
           <div className="flex items-center gap-2 text-indigo-100">
              <Globe size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Diaspora Sucess</span>
           </div>
           <h2 className="text-2xl font-black italic">Nos Talents Fiers</h2>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stories.length > 0 ? (
          <AnimatePresence mode="wait">
             <motion.div 
               key={currentIndex}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="h-full flex flex-col p-8 space-y-6"
             >
                <div className="flex items-center gap-4">
                   <div className="w-20 h-20 rounded-[30px] overflow-hidden shrink-0 border-4 border-slate-50 shadow-xl">
                      <img src={currentStory.image || `https://ui-avatars.com/api/?name=${currentStory.name}`} className="w-full h-full object-cover" />
                   </div>
                   <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <h3 className="text-xl font-black italic truncate">{currentStory.name}</h3>
                         {currentStory.isFeatured && <Star size={14} className="text-amber-400 fill-amber-400" />}
                      </div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                         <MapPin size={10} /> {currentStory.location}
                      </p>
                   </div>
                </div>

                <div className="flex-1 bg-slate-50/50 rounded-[32px] p-6 border border-slate-100 relative overflow-y-auto custom-scrollbar">
                   <Quote size={24} className="text-indigo-200 mb-4" />
                   <div className="text-xs font-medium leading-relaxed text-slate-600 italic">
                      <ReactMarkdown>{currentStory.story}</ReactMarkdown>
                   </div>
                   <Quote size={24} className="text-indigo-200 mt-4 ml-auto rotate-180" />
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="flex gap-2">
                      <button onClick={prev} className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                         <ChevronLeft size={20} />
                      </button>
                      <button onClick={next} className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                         <ChevronRight size={20} />
                      </button>
                   </div>
                   <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest px-4 py-2 bg-indigo-50 rounded-full">
                      {currentStory.category}
                   </div>
                </div>
             </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-20 px-8 opacity-40">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <Heart size={32} />
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Plus de success stories bientôt.</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Propulsé par Kassiri Pulse • Akwaba Info</p>
      </div>
    </motion.div>
  );
};
