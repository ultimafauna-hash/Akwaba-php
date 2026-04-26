import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  ArrowLeft,
  Clock, 
  MapPin, 
  User, 
  Calendar,
  Play,
  Image as ImageIcon,
  Heart,
  Eye,
  Share2
} from 'lucide-react';
import { CulturePost } from '../types';
import { cn, safeFormatDate, optimizeImage, getYoutubeId } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

const categoryConfig: Record<string, { icon: string, bg: string, text: string }> = {
  patrimoine: { icon: '🏛️', bg: 'bg-amber-100', text: 'text-amber-700' },
  traditions: { icon: '🎭', bg: 'bg-purple-100', text: 'text-purple-700' },
  personnages: { icon: '👑', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  civilisations: { icon: '⚱️', bg: 'bg-orange-100', text: 'text-orange-700' },
  art: { icon: '🎨', bg: 'bg-rose-100', text: 'text-rose-700' },
  musique: { icon: '🎵', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  gastronomie: { icon: '🍲', bg: 'bg-red-100', text: 'text-red-700' },
  langues: { icon: '💬', bg: 'bg-cyan-100', text: 'text-cyan-700' }
};

export const CultureCard = ({ post, onClick }: { post: CulturePost, onClick: (p: CulturePost) => void }) => {
  const config = categoryConfig[post.category] || { icon: '📜', bg: 'bg-slate-100', text: 'text-slate-700' };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      onClick={() => onClick(post)}
      className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100 cursor-pointer group hover:shadow-2xl transition-all duration-500 h-full flex flex-col African-card-shadow"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
        {post.image && (
          <img 
            src={optimizeImage(post.image, 800)} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            referrerPolicy="no-referrer"
          />
        )}
        
        {/* Badges on image */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {post.video && (
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              <Play size={10} fill="currentColor" />
              VIDÉO
            </div>
          )}
          {post.gallery && post.gallery.length > 0 && (
            <div className="bg-black/60 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
              <ImageIcon size={10} />
              +{post.gallery.length} PHOTOS
            </div>
          )}
        </div>

        {post.video && (
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 scale-90 group-hover:scale-100 transition-transform duration-500">
                 <Play size={24} fill="white" className="text-white ml-1" />
              </div>
           </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-8 flex flex-col flex-1 space-y-5">
        <div className="flex items-center gap-3">
          <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2", config.bg, config.text)}>
            <span>{config.icon}</span>
            {post.category}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             {post.region}
          </span>
        </div>
        
        <h3 className="font-black text-2xl text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-primary" />
              {post.readingtime}
            </div>
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-primary" />
              {post.period}
            </div>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
             <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const CultureSection = ({ posts, onPostClick, onSeeAll }: { posts: CulturePost[], onPostClick: (p: CulturePost) => void, onSeeAll: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalItems = posts.length;
  const next = () => setCurrentIndex((prev) => (totalItems > 0 ? (prev + 1) % totalItems : 0));
  const prev = () => setCurrentIndex((prev) => (totalItems > 0 ? (prev - 1 + totalItems) % totalItems : 0));

  useEffect(() => {
    if (isPaused || totalItems === 0) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [totalItems, isPaused, itemsPerPage]);

  return (
    <section 
      className="py-24 bg-[#FAF9F6]African-pattern overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 mb-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-12 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/20" />
                <span className="text-secondary font-black text-[10px] uppercase tracking-[0.4em]">Trésors du Continent</span>
             </div>
             <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] African-text-shadow">
               Histoire & <br/> <span className="text-primary">Culture</span>
             </h2>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex gap-3">
                <button 
                  onClick={prev} 
                  className="w-16 h-16 rounded-full bg-white text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-slate-200 shadow-xl active:scale-90"
                >
                  <ChevronLeft size={28} />
                </button>
                <button 
                  onClick={next} 
                  className="w-16 h-16 rounded-full bg-white text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-slate-200 shadow-xl active:scale-90"
                >
                  <ChevronRight size={28} />
                </button>
             </div>
             <button 
               onClick={onSeeAll}
               className="h-16 bg-slate-900 hover:bg-primary text-white px-12 rounded-full font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl active:scale-95 hidden sm:flex items-center gap-3"
             >
               Voir toute la collection
               <ArrowRight size={16} />
             </button>
          </div>
        </div>
      </div>

      <div className="relative px-4 z-10">
        <div className="max-w-7xl mx-auto overflow-visible relative">
          <motion.div 
            animate={{ x: `-${currentIndex * (100 / itemsPerPage)}%` }}
            transition={{ type: "spring", damping: 30, stiffness: 60 }}
            className="flex"
          >
            {posts.map((post) => (
              <div 
                key={post.id}
                className={cn(
                  "flex-shrink-0 px-4 transition-all duration-700",
                  itemsPerPage === 3 ? "w-1/3" : itemsPerPage === 2 ? "w-1/2" : "w-full"
                )}
              >
                <CultureCard post={post} onClick={onPostClick} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mt-20 max-w-7xl mx-auto px-4 z-10">
         {posts.map((_, i) => (
           <button
             key={i}
             onClick={() => setCurrentIndex(i)}
             className={cn(
               "h-2.5 rounded-full transition-all duration-700 shadow-sm",
               currentIndex === i ? "w-16 bg-primary" : "w-2.5 bg-slate-200 hover:bg-slate-300"
             )}
           />
         ))}
      </div>
    </section>
  );
};

export const CultureDetailView = ({ post, onBack }: { post: CulturePost, onBack: () => void }) => {
  if (!post) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#FDFCF0] font-sans text-slate-900 selection:bg-primary/20"
    >
      <div className="max-w-6xl mx-auto py-10 px-4 md:px-8 space-y-12">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 bg-white/50 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-lg transition-all"
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <div className="flex gap-3">
            <button className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm">
              <Heart size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white transition-all shadow-sm">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {post.video && getYoutubeId(post.video) && (
          <div className="w-full rounded-[40px] overflow-hidden shadow-2xl bg-black aspect-video border-[12px] md:border-[20px] border-white shadow-primary/10">
            <iframe 
              src={`https://www.youtube.com/embed/${getYoutubeId(post.video)}?autoplay=0`}
              title={post.title}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}

        <div className="space-y-8 text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <span className={cn("px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-sm", categoryConfig[post.category]?.bg || 'bg-slate-100', categoryConfig[post.category]?.text || 'text-slate-900')}>
              {post.category}
            </span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-[0.9] text-slate-900">
            {post.title}
          </h1>
          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-primary" /> {post.region}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-primary" /> {post.period}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-primary" /> {post.readingtime}
            </div>
          </div>
        </div>

        {!post.video && post.image && (
          <div className="relative group">
            <div className="w-full rounded-[60px] overflow-hidden shadow-2xl border-[12px] md:border-[24px] border-white">
              <img src={post.image} className="w-full h-auto object-cover max-h-[80vh]" alt={post.title} referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-2xl shadow-xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-500 whitespace-nowrap z-10">
              Légende : {post.title} — {post.period}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-12 items-start">
          <div className="lg:col-span-8 space-y-16">
            <div className="bg-white/40 backdrop-blur-sm rounded-[40px] p-8 md:p-12 border border-white/50 shadow-sm">
              <div className="prose prose-slate prose-lg max-w-none text-slate-800 font-sans leading-[1.8]">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </div>

            {/* Timeline Element */}
            <div className="bg-slate-900 rounded-[50px] p-12 text-white relative overflow-hidden">
               <div className="absolute inset-0 african-pattern opacity-10" />
               <div className="relative z-10 space-y-10">
                  <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
                    <div className="w-8 h-1.5 bg-primary rounded-full" />
                    Repères Historiques
                  </h3>
                  <div className="relative space-y-12">
                     <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-white/10" />
                     {[
                       { date: post.period, title: "L'origine de cette tradition", desc: "Les premières traces documentées remontent aux récits oraux de cette époque." },
                       { date: "Moyen-Âge", title: "Expansion régionale", desc: "La culture s'étend à travers les grandes routes commerciales du continent." },
                       { date: "Aujourd'hui", title: "Héritage Vivant", desc: "Cette richesse culturelle continue d'influencer l'art et la mode contemporaine." }
                     ].map((item, i) => (
                       <div key={i} className="flex gap-8 items-start group">
                          <div className={cn(
                            "w-12 h-12 rounded-full border-4 border-slate-900 z-10 flex items-center justify-center shrink-0 transition-colors",
                            i === 0 ? "bg-primary" : "bg-white/10 group-hover:bg-primary/50"
                          )}>
                             <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                          <div className="space-y-1 pt-1">
                             <p className="text-[10px] font-black uppercase tracking-widest text-primary">{item.date}</p>
                             <h4 className="text-lg font-bold">{item.title}</h4>
                             <p className="text-sm text-slate-400">{item.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {post.gallery && post.gallery.length > 0 && (
              <div className="space-y-8">
                <h3 className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
                  <div className="w-12 h-2 bg-primary rounded-full" />
                  Mosaïque Culturelle
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[250px]">
                  {post.gallery.map((img, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "rounded-[40px] overflow-hidden shadow-sm border-[6px] border-white group",
                        i === 0 ? "col-span-2 row-span-2" : i === 1 ? "col-span-2" : ""
                      )}
                    >
                      <img 
                        src={optimizeImage(img, 800)} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={`Art - ${i}`}
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[40px] p-8 border border-white shadow-xl space-y-8 sticky top-24">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Préservé par</p>
                  <div className="flex items-center gap-3 pt-2">
                     <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary text-2xl font-black">
                        {(post.author || 'A')[0]}
                     </div>
                     <div>
                        <h4 className="font-black text-lg">{post.author}</h4>
                        <p className="text-xs font-bold text-slate-400">Curateur de l'histoire</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-4 pt-8 border-t border-slate-50">
                  <div className="flex items-center justify-between text-sm">
                     <span className="font-bold text-slate-400 flex items-center gap-2">
                        <Eye size={16} /> Vues
                     </span>
                     <span className="font-black">{post.views}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                     <span className="font-bold text-slate-400 flex items-center gap-2">
                        <Heart size={16} /> Intérêt
                     </span>
                     <span className="font-black">{post.likes}</span>
                  </div>
               </div>

               <button className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-3 group">
                  Soutenir ce projet
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
};
