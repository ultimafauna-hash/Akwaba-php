import React from 'react';
import { motion } from 'motion/react';
import { Author } from '../types';
import { optimizeImage } from '../lib/utils';
import { ArrowRight, ChevronRight, FileText, Award } from 'lucide-react';

interface AuthorsListProps {
  authors: Author[];
  onAuthorClick: (name: string) => void;
  onBack: () => void;
}

export const AuthorsList: React.FC<AuthorsListProps> = ({ authors, onAuthorClick, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto py-12 px-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 italic">LA <span className="text-primary">RÉDACTION</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Les visages derrière l'actualité d'Akwaba Info.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {authors.map((author, idx) => (
          <motion.div
            key={author.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onAuthorClick(author.name)}
            className="group cursor-pointer bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
               <Award size={100} />
            </div>
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-[40px] overflow-hidden shadow-xl border-4 border-white ring-1 ring-slate-100">
                  <img 
                    src={optimizeImage(author.image, 400)} 
                    alt={author.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{author.name}</h3>
                <p className="text-primary font-bold text-xs uppercase tracking-widest">{author.role}</p>
              </div>

              <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed font-serif italic">
                "{author.bio}"
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {author.specialties.slice(0, 3).map(spec => (
                  <span key={spec} className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest rounded-full border border-slate-100">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                Voir le profil <ArrowRight size={16} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
