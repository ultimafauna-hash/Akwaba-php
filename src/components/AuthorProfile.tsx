import React from 'react';
import { motion } from 'motion/react';
import { Twitter, Linkedin, Facebook, Mail, Instagram, ArrowLeft, FileText, Globe, Award, CheckCircle, Plus, Eye, Clock, ArrowRight } from 'lucide-react';
import { Author, Article } from '../types';
import { cn, optimizeImage } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuthorProfileProps {
  author: Author;
  articles: Article[];
  onBack: () => void;
  onArticleClick: (article: Article) => void;
  isFollowing?: boolean;
  onFollow?: (name: string) => void;
}

export const AuthorProfile: React.FC<AuthorProfileProps> = ({ 
  author, 
  articles, 
  onBack, 
  onArticleClick,
  isFollowing,
  onFollow
}) => {
  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto py-12 px-6 lg:px-12"
    >
      <button 
        onClick={onBack}
        className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-bold text-xs uppercase tracking-widest mb-16"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Retour à l'accueil
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left column: Profile Header & Sidebar */}
        <div className="lg:col-span-4 space-y-12">
          <div className="space-y-8 sticky top-24">
            <div className="relative group">
              <div className="aspect-square rounded-[60px] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-slate-100">
                <img 
                  src={optimizeImage(author.image, 800)} 
                  alt={author.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute -bottom-4 -right-4 bg-primary text-white p-5 rounded-[30px] shadow-2xl shadow-primary/30"
              >
                <Award size={28} />
              </motion.div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                    {author.name}
                  </h1>
                </div>
                <p className="text-primary font-bold text-lg tracking-tight">{author.role} @ Akwaba Info</p>
              </div>

              {onFollow && (
                <button 
                  onClick={() => onFollow(author.name)}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg",
                    isFollowing 
                      ? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500 shadow-slate-100" 
                      : "bg-primary text-white hover:bg-slate-900 shadow-primary/20"
                  )}
                >
                  {isFollowing ? (
                    <>
                      <CheckCircle size={18} /> Suivi
                    </>
                  ) : (
                    <>
                      <Plus size={18} /> S'abonner
                    </>
                  )}
                </button>
              )}

              <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">À propos</h3>
                  <p className="text-slate-600 leading-relaxed font-serif text-lg italic">
                    "{author.bio}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
                  <div className="space-y-1">
                    <p className="text-2xl font-black tracking-tighter text-slate-900">{articles.length}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Articles</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-black tracking-tighter text-slate-900">
                      {totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lectures</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {author.specialties.map(spec => (
                      <span 
                        key={spec}
                        className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-100"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Réseaux Sociaux</h3>
                  <div className="flex gap-3">
                    {author.socials.twitter && (
                      <a href={author.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all border border-slate-100">
                        <Twitter size={18} />
                      </a>
                    )}
                    {author.socials.linkedin && (
                      <a href={author.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100">
                        <Linkedin size={18} />
                      </a>
                    )}
                    {author.socials.instagram && (
                      <a href={author.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-all border border-slate-100">
                        <Instagram size={18} />
                      </a>
                    )}
                    {author.socials.mail && (
                      <a href={`mailto:${author.socials.mail}`} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all border border-slate-100">
                        <Mail size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Articles Feed */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[60px] p-8 md:p-12 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-slate-900">Archives de Publications</h2>
                <p className="text-slate-400 text-sm mt-1">Découvrez tous les articles signés par {author.name}</p>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <FileText size={16} className="text-primary" />
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{articles.length}</span>
              </div>
            </div>

            <div className="space-y-12">
              {articles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onArticleClick(article)}
                  className="group cursor-pointer grid grid-cols-1 md:grid-cols-5 gap-8 items-center"
                >
                  <div className="md:col-span-2">
                    <div className="aspect-[16/10] rounded-[30px] overflow-hidden shadow-lg ring-1 ring-slate-100">
                      <img 
                        src={optimizeImage(article.image || '', 600)} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        {format(new Date(article.date), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight tracking-tight">
                      {article.title}
                    </h3>
                    <p className="text-slate-500 line-clamp-2 text-sm leading-relaxed font-serif">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Eye size={14} className="text-slate-300" /> {article.views} vus
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock size={14} className="text-slate-300" /> {article.readingtime}
                      </div>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                        <ArrowRight size={20} className="text-primary" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {articles.length === 0 && (
                <div className="py-24 text-center space-y-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <Globe size={40} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900 font-black text-xl">Aucune publication trouvée</p>
                    <p className="text-slate-400 text-sm">Cet auteur n'a pas encore publié d'articles.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
