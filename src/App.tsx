import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Heart, 
  Share2, 
  Clock, 
  Eye, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
  ArrowUp,
  Home,
  Globe,
  Map,
  MapPin,
  User,
  Mail,
  Camera,
  MessageSquare,
  X,
  Send,
  CreditCard,
  Smartphone,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  TrendingUp,
  Filter,
  Bell,
  BellRing,
  Languages,
  Calendar,
  Lock,
  Plus,
  Trash,
  Edit3,
  Save,
  FileText,
  LogOut,
  LayoutDashboard,
  Settings,
  Copy,
  Check,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  MonitorOff,
  Youtube,
  Music,
  Bookmark,
  Activity,
  Award,
  Flag,
  Sun,
  Moon,
  Headset,
  History as HistoryIcon,
  ChevronDown,
  Map as MapIcon,
  Monitor,
  Video,
  Play,
  Hash,
  Download,
  Printer,
  Smartphone as Phone,
  ChevronUp,
  Star,
  Radio,
  Shield,
  ShoppingBag,
  Info,
  ExternalLink,
  List as ListIcon,
  LayoutGrid,
  LayoutList
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import confetti from 'canvas-confetti';
import { MOCK_ARTICLES, MOCK_EVENTS, MOCK_AUTHORS, MOCK_CULTURE } from './constants';
import { Article, Comment, Event, UserProfile, SiteSettings, Subscriber, MediaAsset, Poll, Classified, LiveBlog, AppNotification, SupportMessage, ChatMessage, Transaction, Author, WebTV, CulturePost, AdminActivityLog } from './types';
import { cn, optimizeImage, getYoutubeId, safeFormatDate } from './lib/utils';
import { AdminLogin, AdminDashboard, AdminEditor, ExportModal, PollEditor, LiveBlogEditor, WebTVEditor, ClassifiedEditor, CulturePostEditor, AuthorEditor } from './components/Admin';
import { ArticleSkeleton, Skeleton } from './components/Skeleton';
import { PulseSidebar } from './components/PulseSidebar';
import { AuthModal } from './components/AuthModal';
import { AuthorProfile } from './components/AuthorProfile';
import { AuthorsList } from './components/AuthorsList';
import { CultureSection, CultureDetailView, CultureCard } from './components/Culture';
import { PreferenceSelector } from './components/PreferenceSelector';
import { UserProfileTabs } from './components/Profile/UserProfileTabs';
import { NewsletterSignup } from './components/NewsletterSignup';
import { NewsletterModal } from './components/NewsletterModal';
import api, { onAuthStateChanged } from './lib/api';
import { AdminLoginModal } from './components/AdminLoginModal';
// type FirebaseUser = any; 

// --- Components ---


const WeatherWidget = () => {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:flex flex-col items-end gap-0.5 text-[10px] font-black uppercase tracking-widest text-slate-600 border-r border-slate-100 pr-4 mr-4">
      <div className="flex items-center gap-1.5 text-slate-900">
        <Clock size={12} className="text-primary" />
        {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div>{date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
    </div>
  );
};

const TopNotice = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <motion.div 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    exit={{ y: -100 }}
    className="bg-primary text-slate-950 py-2.5 px-4 relative z-[200] flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg"
  >
    <div className="flex items-center gap-2">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <TrendingUp size={12} />
      </motion.div>
      <span>{message}</span>
    </div>
    <motion.button 
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClose} 
      className="absolute right-4 text-slate-900/40 hover:text-slate-900 transition-colors"
    >
      <X size={14} />
    </motion.button>
  </motion.div>
);

const Breadcrumb = ({ items }: { items: { label: string; onClick?: () => void; active?: boolean }[] }) => (
  <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
    <button onClick={() => items && items[0] && items[0].onClick && items[0].onClick()} className="hover:text-primary transition-colors flex items-center gap-1 text-slate-900">
      <Home size={10} /> ACCUEIL
    </button>
    {items.slice(1).map((item, i) => (
      <React.Fragment key={i}>
        <ChevronRight size={10} className="shrink-0 text-slate-300" />
        {item.onClick && !item.active ? (
          <button onClick={item.onClick} className="hover:text-primary transition-colors">
            {item.label}
          </button>
        ) : (
          <span className={cn(item.active ? "text-primary px-2 bg-primary/5 rounded-lg py-0.5" : "text-slate-900")}>{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

const ShareFloatingButtons = ({ title, url }: { title: string, url: string }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTw = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  const shareFb = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  const shareLi = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-4">
      <div className="bg-white rounded-full shadow-2xl p-2 border border-slate-100 flex flex-col gap-4">
        {[
          { icon: Facebook, color: 'text-blue-600', onClick: shareFb, label: 'Facebook' },
          { icon: Twitter, color: 'text-sky-500', onClick: shareTw, label: 'Twitter' },
          { icon: Linkedin, color: 'text-blue-700', onClick: shareLi, label: 'LinkedIn' },
          { icon: copied ? Check : Copy, color: copied ? 'text-green-500' : 'text-slate-400', onClick: handleCopy, label: 'Copier' }
        ].map((btn, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={btn.onClick}
            className={cn("p-3 rounded-full hover:bg-slate-50 transition-colors", btn.color)}
            title={btn.label}
          >
            <btn.icon size={20} />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const Footer = ({ onNavigate, categories }: { onNavigate: (v: any) => void, categories: string[] }) => (
  <footer className="bg-slate-900 text-white pt-20 pb-10 mt-20 relative overflow-hidden">
    <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
       <img src="https://raw.githubusercontent.com/Akwabanews/Sources/main/images/2DB685A1-EE6B-478E-B70B-58F490D2948A.jpeg" className="w-96 h-96 grayscale invert" alt="" />
    </div>
    
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <img 
               src="https://raw.githubusercontent.com/Akwabanews/Sources/main/images/2DB685A1-EE6B-478E-B70B-58F490D2948A.jpeg" 
               className="w-16 h-16 rounded-2xl border border-white/10 p-2 object-contain" 
               alt="Logo" 
             />
             <h2 className="text-2xl font-black tracking-tighter text-white">AKWABA <span className="text-primary">INFO</span></h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            Le portail d'information de référence sur l'Afrique et le monde. Indépendance, véracité et proximité au cœur de notre rédaction.
          </p>
          <div className="flex gap-4">
             {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
               <button key={i} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all text-slate-300 hover:text-white">
                 <Icon size={18} />
               </button>
             ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-black uppercase tracking-widest text-primary italic">Navigation</h3>
          <ul className="space-y-3">
            {['Home', 'Politique', 'Afrique', 'Monde', 'Tech', 'Culture', 'Santé', 'Sport'].map(item => (
              <li key={item}>
                <button 
                  onClick={() => onNavigate(item === 'Home' ? 'home' : 'categories')} 
                  className="text-slate-300 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 group"
                >
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-black uppercase tracking-widest text-primary italic">Services</h3>
          <ul className="space-y-3">
            {['Annonces', 'Web TV', 'Agenda Culturel', 'Direct (Live)', 'Faire un don', 'Auteurs'].map(item => (
              <li key={item}>
                <button 
                  onClick={() => onNavigate(item)} 
                  className="text-slate-300 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 group"
                >
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-black uppercase tracking-widest text-primary italic">Newsletter</h3>
          <p className="text-slate-300 text-sm font-medium">Restez informé des dernières actualités africaines chaque matin.</p>
          <NewsletterSignup 
            variant="minimal" 
            className="mt-4" 
            onPrivacyClick={() => onNavigate('privacy')}
          />
        </div>
      </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
         <p>© 2024 <span className="text-white">AKWABA</span> <span className="text-primary">INFO</span>. TOUS DROITS RÉSERVÉS.</p>
         <div className="flex gap-8">
            <button className="hover:text-primary transition-colors">Mentions Légales</button>
            <button className="hover:text-primary transition-colors">Confidentialité</button>
            <button className="hover:text-primary transition-colors">Contact</button>
         </div>
      </div>
    </div>
  </footer>
);

// --- Helper Functions ---

const playNotificationSound = (type: 'info' | 'urgent' | 'message' | 'payment' = 'info') => {
  const soundUrls = {
    info: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    urgent: 'https://www.soundjay.com/buttons/sounds/button-10.mp3',
    message: 'https://www.soundjay.com/communication/sounds/pda-text-1.mp3',
    payment: 'https://www.soundjay.com/misc/sounds/cash-register-05.mp3'
  };
  const audio = new Audio(soundUrls[type] || soundUrls.info);
  audio.volume = 0.3;
  audio.play().catch(e => console.warn("Audio play blocked by browser:", e));
};

const Badge = ({ children, category, icon }: { children: React.ReactNode; category?: string; icon?: string }) => {
  const colors: Record<string, string> = {
    'Afrique': 'bg-orange-500 text-white shadow-orange-500/20',
    'Monde': 'bg-blue-500 text-white shadow-blue-500/20',
    'Tech': 'bg-slate-500 text-white shadow-slate-500/20',
    'Économie': 'bg-emerald-600 text-white shadow-emerald-600/20',
    'Politique': 'bg-red-600 text-white shadow-red-600/20',
    'Culture': 'bg-amber-500 text-white shadow-amber-500/20',
    'Urgent': 'bg-red-700 text-white animate-pulse shadow-red-700/20',
    'Science': 'bg-purple-600 text-white shadow-purple-600/20',
    'Santé': 'bg-teal-500 text-white shadow-teal-500/20',
    'Sport': 'bg-indigo-600 text-white shadow-indigo-600/20',
  };

  return (
    <motion.span 
      whileHover={{ scale: 1.05 }}
      className={cn(
      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit relative overflow-hidden shadow-sm backdrop-blur-[2px] border border-white/10",
      category ? colors[category] || 'bg-slate-200 text-slate-700 shadow-slate-200/20' : 'bg-slate-200 text-slate-700 shadow-slate-200/20'
    )}>
      {icon && <span className="text-xs">{icon}</span>}
      {children}
    </motion.span>
  );
};const HeroSlideshow = ({ 
  articles, 
  onArticleClick, 
  onBookmark, 
  bookmarkedIds,
  onAuthorClick,
  categoryIcons
}: { 
  articles: Article[]; 
  onArticleClick: (a: Article) => void; 
  onBookmark: (id: string, e: React.MouseEvent) => void;
  bookmarkedIds: Set<string>;
  onAuthorClick?: (name: string) => void;
  categoryIcons?: Record<string, string>;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!articles || articles.length === 0) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [articles.length]);

  return (
    <div className="relative h-[300px] md:h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl group">
      <AnimatePresence mode="wait">
        <motion.div
          key={articles[currentIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 cursor-pointer"
          onClick={() => onArticleClick(articles[currentIndex])}
        >
          {articles[currentIndex].image && (
            <img 
              src={optimizeImage(articles[currentIndex].image, 1200)} 
              alt={articles[currentIndex].title}
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="async"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute top-6 right-6 z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); onBookmark(articles[currentIndex].id, e); }}
              className={cn(
                "p-3 rounded-full backdrop-blur-md transition-all shadow-xl",
                bookmarkedIds.has(articles[currentIndex].id) ? "bg-primary text-white" : "bg-white/20 text-white hover:bg-white/40"
              )}
            >
              <Bookmark size={24} fill={bookmarkedIds.has(articles[currentIndex].id) ? "currentColor" : "none"} />
            </button>
          </div>
          
          {/* Slider Arrows */}
          <div className="absolute inset-y-0 left-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handlePrev}
              className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleNext}
              className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-3/4">
            <Badge category={articles[currentIndex].category} icon={categoryIcons?.[articles[currentIndex].category]}>{articles[currentIndex].category}</Badge>
            <h2 className="text-white font-display font-black text-2xl md:text-4xl mt-4 leading-[1.1] tracking-tight">
              {articles[currentIndex].title}
            </h2>
            <div className="flex items-center gap-4 mt-4 text-white/70 text-sm font-medium">
              <span>{safeFormatDate(articles[currentIndex].date, 'dd MMM yyyy')}</span>
              <span>•</span>
              <span 
                onClick={(e) => { e.stopPropagation(); onAuthorClick?.(articles[currentIndex].author); }}
                className="hover:text-white cursor-pointer transition-colors"
              >
                {articles[currentIndex].author}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        {articles.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              idx === currentIndex ? "bg-primary w-6" : "bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};

const TrendingSection = ({ 
  articles, 
  onArticleClick, 
  onBookmark, 
  bookmarkedIds,
  onAuthorClick,
  categoryIcons,
  onSeeMore
}: { 
  articles: Article[]; 
  onArticleClick: (a: Article) => void; 
  onBookmark: (id: string, e: React.MouseEvent) => void;
  bookmarkedIds: Set<string>;
  onAuthorClick?: (name: string) => void;
  categoryIcons?: Record<string, string>;
  onSeeMore?: () => void;
}) => {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary flex items-center gap-1.5">
            <TrendingUp size={20} />
          </div>
          <h2 className="font-black text-2xl uppercase tracking-tighter italic">Tendances</h2>
        </div>
        {onSeeMore && (
          <button 
            onClick={onSeeMore}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-primary tracking-widest hover:translate-x-1 transition-all"
          >
            Voir plus <ChevronRight size={14} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <motion.div 
            key={article.id} 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ x: 5 }}
            onClick={() => onArticleClick(article)}
            className="flex gap-4 items-start cursor-pointer group relative bg-white/50 p-2 rounded-2xl hover:bg-white transition-colors"
          >
            <span className="text-4xl font-black text-slate-100 group-hover:text-primary transition-colors leading-none">
              {(idx + 1).toString().padStart(2, '0')}
            </span>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between items-start">
                <Badge category={article.category} icon={categoryIcons?.[article.category]}>{article.category}</Badge>
                <button 
                  onClick={(e) => { e.stopPropagation(); onBookmark(article.id, e); }}
                  className={cn(
                    "transition-all hover:scale-110",
                    bookmarkedIds.has(article.id) ? "text-primary" : "text-slate-300 hover:text-primary"
                  )}
                >
                  <Bookmark size={14} fill={bookmarkedIds.has(article.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <h3 className="font-display font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors leading-tight line-clamp-2 uppercase italic text-sm">
                {article.title}
              </h3>
              <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                <span 
                  onClick={(e) => { e.stopPropagation(); onAuthorClick?.(article.author); }}
                  className="hover:text-primary cursor-pointer transition-colors"
                >
                  {article.author}
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5"><Eye size={10} /> {article.views}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const ArticleCard = ({ article, onClick, variant = 'horizontal', onBookmark, isBookmarked, onAuthorClick, categoryIcon }: { 
  article: Article; 
  onClick: () => void; 
  variant?: 'horizontal' | 'vertical' | 'hero';
  onBookmark?: (id: string, e: React.MouseEvent) => void;
  isBookmarked?: boolean;
  onAuthorClick?: (name: string) => void;
  categoryIcon?: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  if (!article) return null;

  const cardMotionProps = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { type: "spring", stiffness: 100, damping: 20 } as any,
    whileHover: { y: -10 }
  };

  if (variant === 'hero') {
    return (
      <motion.div 
        ref={cardRef}
        id={`article-card-hero-${article.id}`}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative h-[240px] w-full rounded-2xl overflow-hidden shadow-xl cursor-pointer group bg-slate-100"
      >
        {article.image && (
          <motion.img 
            style={{ y, scale: 1.2 }}
            id={`article-img-hero-${article.id}`}
            src={optimizeImage(article.image, 600)} 
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-125"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={(e) => onBookmark?.(article.id, e)}
            className={cn(
              "p-2 rounded-full backdrop-blur-md transition-all",
              isBookmarked ? "bg-primary text-white" : "bg-black/20 text-white hover:bg-black/40"
            )}
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <Badge category={article.category} icon={categoryIcon}>{article.category}</Badge>
          <h2 className="text-white font-display font-bold text-xl mt-2 leading-tight line-clamp-2">
            {article.title}
          </h2>
          <div className="flex items-center gap-3 mt-2 text-white/70 text-xs">
            <span>{safeFormatDate(article.date, 'dd MMM yyyy')}</span>
            <span>•</span>
            <span 
              onClick={(e) => { e.stopPropagation(); onAuthorClick?.(article.author); }}
              className="hover:text-white cursor-pointer transition-colors font-bold"
            >
              {article.author}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      ref={cardRef}
      id={`article-card-${variant}-${article.id}`}
      {...cardMotionProps}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer flex transition-all duration-300 hover:shadow-md",
        variant === 'vertical' ? 'flex-col' : 'flex-row'
      )}
    >
      {article.image && (
        <div className={cn(
          "relative overflow-hidden",
          variant === 'vertical' ? 'w-full h-40' : 'w-24 h-24 shrink-0'
        )}>
          <motion.img 
            style={{ y, scale: 1.2 }}
            id={`article-img-${variant}-${article.id}`}
            src={optimizeImage(article.image, variant === 'vertical' ? 500 : 200)} 
            alt={article.title}
            className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-125"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          {variant === 'vertical' && (
             <div className="absolute top-2 right-2 z-10">
                <button 
                  onClick={(e) => onBookmark?.(article.id, e)}
                  className={cn(
                    "p-1.5 rounded-full backdrop-blur-md transition-all",
                    isBookmarked ? "bg-primary text-white" : "bg-black/20 text-white hover:bg-black/40"
                  )}
                >
                  <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
             </div>
          )}
        </div>
      )}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start mb-1">
            <Badge category={article.category} icon={categoryIcon}>{article.category}</Badge>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600 font-bold">{article.readingtime}</span>
              {variant === 'horizontal' && (
                <button 
                  onClick={(e) => onBookmark?.(article.id, e)}
                  className={cn(
                    "transition-colors",
                    isBookmarked ? "text-primary" : "text-slate-300 hover:text-primary"
                  )}
                >
                  <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
              )}
            </div>
          </div>
          <h3 className={cn(
            "font-display font-bold text-slate-900 leading-snug line-clamp-2",
            variant === 'vertical' ? 'text-base' : 'text-sm'
          )}>
            {article.title}
          </h3>
          {variant === 'vertical' && article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {article.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-200">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-600">
          <div className="flex items-center gap-2">
            <span 
              onClick={(e) => { e.stopPropagation(); onAuthorClick?.(article.author); }}
              className="font-black italic hover:text-primary cursor-pointer transition-colors text-slate-900"
            >
              {article.author}
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-bold">{safeFormatDate(article.date, 'dd MMM yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 font-bold">
            <span className="flex items-center gap-0.5"><Eye size={10} /> {article.views}</span>
            <span className="flex items-center gap-0.5"><Heart size={10} /> {article.likes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ArticleCarousel = ({ 
  articles, 
  onArticleClick, 
  onBookmark, 
  bookmarkedIds,
  onAuthorClick,
  categoryIcons
}: { 
  articles: Article[], 
  onArticleClick: (a: Article) => void,
  onBookmark: (id: string, e: React.MouseEvent) => void,
  bookmarkedIds: Set<string>,
  onAuthorClick?: (name: string) => void,
  categoryIcons?: Record<string, string>
}) => {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, articles.length - itemsPerPage);
  const next = () => setScrollIndex(prev => Math.min(prev + 1, maxIndex));
  const prev = () => setScrollIndex(prev => Math.max(prev - 1, 0));

  return (
    <div className="mt-16 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-black uppercase tracking-tighter italic">Continuer la lecture</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={prev} 
            disabled={scrollIndex === 0}
            className="p-2 rounded-full bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors flex items-center gap-1"
          >
            <span className="text-[8px] opacity-30">·</span>
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={next} 
            disabled={scrollIndex === maxIndex}
            className="p-2 rounded-full bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors flex items-center gap-1"
          >
            <span className="text-[8px] opacity-30">·</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden -mx-4 px-4">
        <motion.div 
          animate={{ x: `-${scrollIndex * (100 / itemsPerPage)}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex gap-6"
        >
          {articles.map((article) => (
            <div 
              key={article.id} 
              className={cn(
                "shrink-0",
                itemsPerPage === 1 ? "w-full" : 
                itemsPerPage === 2 ? "w-[calc(50%-12px)]" : 
                "w-[calc(25%-18px)]"
              )}
            >
              <ArticleCard 
                article={article} 
                variant="vertical" 
                onClick={() => onArticleClick(article)} 
                onBookmark={onBookmark}
                isBookmarked={bookmarkedIds.has(article.id)}
                onAuthorClick={onAuthorClick}
                categoryIcon={categoryIcons?.[article.category]}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 pt-2">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setScrollIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              scrollIndex === i 
                ? "w-6 bg-primary" 
                : "w-1.5 bg-slate-200 hover:bg-slate-300"
            )}
            title={`Page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const getCategoryEmoji = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('concert') || c.includes('musique')) return '🎵';
  if (c.includes('politique')) return '🏛️';
  if (c.includes('économie') || c.includes('business')) return '💼';
  if (c.includes('sport')) return '⚽';
  if (c.includes('culture') || c.includes('art')) return '🎨';
  if (c.includes('conférence') || c.includes('débat')) return '📢';
  return '📅';
};

const EventCard = ({ event, onClick }: { event: Event, onClick: (e: Event) => void }) => {
  return (
    <div 
      onClick={() => onClick(event)}
      className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 cursor-pointer group hover:shadow-2xl transition-all duration-500 h-full flex flex-col group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        {event.image && (
          <img 
            src={optimizeImage(event.image, 800)} 
            alt={event.title} 
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </div>
      <div className="p-8 flex flex-col flex-1 space-y-5">
        <div>
          <span className="bg-slate-100 text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            {event.category}
          </span>
        </div>
        
        <h3 className="font-black text-2xl text-slate-900 leading-tight group-hover:text-primary transition-colors flex items-start justify-between gap-2">
          <span className="line-clamp-2">{event.title}</span>
          <div className="p-2 bg-slate-900 text-white rounded-full opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0">
             <ArrowRight size={16} />
          </div>
        </h3>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 mt-auto">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span>{safeFormatDate(event.date, 'dd MMM')} <span className="mx-1 opacity-30">|</span> {safeFormatDate(event.date, 'HH:mm')}</span>
          </div>
          <div className="flex items-center gap-2 max-w-[50%]">
            <MapPin size={16} className="text-primary" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventSection = ({ events, onEventClick, onSeeAll }: { events: Event[], onEventClick: (e: Event) => void, onSeeAll: () => void }) => {
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

  const totalItems = events.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  useEffect(() => {
    if (isPaused || totalItems === 0) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [totalItems, isPaused, itemsPerPage]);

  return (
    <section 
      className="py-16 border-t border-slate-100 overflow-hidden bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-12 h-1 bg-primary rounded-full" />
                <span className="text-secondary font-black text-[10px] uppercase tracking-[0.3em]">Événements Immédiats</span>
             </div>
             <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
               L'Agenda <br/> <span className="text-primary">Culturel</span>
             </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex gap-2">
                <button 
                  onClick={prev} 
                  className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-slate-100 shadow-sm active:scale-95"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={next} 
                  className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-slate-100 shadow-sm active:scale-95"
                >
                  <ChevronRight size={24} />
                </button>
             </div>
             <button 
               onClick={onSeeAll}
               className="h-14 bg-slate-900 hover:bg-primary text-white px-10 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 hidden sm:block"
             >
               Explorer Tout
             </button>
          </div>
        </div>
      </div>

      <div className="relative px-4">
        <div className="max-w-7xl mx-auto overflow-visible relative">
          <motion.div 
            animate={{ x: `-${currentIndex * (100 / itemsPerPage)}%` }}
            transition={{ type: "spring", damping: 25, stiffness: 80 }}
            className="flex"
          >
            {events.map((event) => (
              <div 
                key={event.id}
                className={cn(
                  "flex-shrink-0 px-3 transition-opacity duration-300",
                  itemsPerPage === 3 ? "w-1/3" : itemsPerPage === 2 ? "w-1/2" : "w-full"
                )}
              >
                <EventCard event={event} onClick={onEventClick} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      
      <div className="flex justify-center gap-3 mt-16 max-w-7xl mx-auto px-4">
         {Array.from({ length: totalItems }).map((_, i) => (
           <button
             key={i}
             onClick={() => setCurrentIndex(i)}
             className={cn(
               "h-2 rounded-full transition-all duration-500",
               currentIndex === i ? "w-12 bg-primary" : "w-2 bg-slate-100 hover:bg-slate-200"
             )}
           />
         ))}
      </div>
    </section>
  );
};

const EventDetailView = ({ event, onBack }: { event: Event, onBack: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const target = new Date(event.date).getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [event.date]);

  if (!event) return null;

  const addToCalendar = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.excerpt);
    const location = encodeURIComponent(event.location);
    const date = new Date(event.date);
    const startDate = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startDate}/${endDate}`;
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto py-10 px-4 space-y-12"
    >
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-sm border border-slate-100 text-slate-900 hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={addToCalendar}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          <Calendar size={16} /> Ajouter au calendrier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {event.category}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-slate-900">
              {event.title}
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              {event.excerpt}
            </p>
          </div>

          {(event.image || event.video) && (
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl group border-8 border-white">
              {event.video && getYoutubeId(event.video) ? (
                <div className="aspect-video">
                  <iframe 
                    src={`https://www.youtube.com/embed/${getYoutubeId(event.video)}`}
                    title={event.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img 
                  src={optimizeImage(event.image || '', 1200)} 
                  alt={event.title}
                  className="w-full h-auto object-cover max-h-[600px]"
                />
              )}
            </div>
          )}

          <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-8">
            <div className="flex flex-wrap gap-8 py-6 border-y border-slate-50 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date de l'événement</p>
                  <p className="text-lg font-black text-slate-900">{safeFormatDate(event.date, 'dd MMMM yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Lieu & Adresse</p>
                  <p className="text-lg font-black text-slate-900">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="markdown-body text-slate-600 leading-relaxed text-lg">
              <ReactMarkdown>{event.content}</ReactMarkdown>
            </div>

            {event.gallery && event.gallery.length > 0 && (
              <div className="space-y-6 pt-8 border-t border-slate-50">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Camera size={20} className="text-primary" /> Galerie Photo
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.gallery.map((img, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100"
                    >
                      <img 
                        src={optimizeImage(img, 400)} 
                        alt={`${event.title} gallery ${i}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {timeLeft && (
            <div className="bg-slate-900 rounded-[40px] p-8 text-white space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 african-pattern opacity-10" />
              <h4 className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-primary relative z-10">L'événement commence dans</h4>
              <div className="grid grid-cols-4 gap-2 relative z-10">
                {[
                  { label: 'J', val: timeLeft.d },
                  { label: 'H', val: timeLeft.h },
                  { label: 'M', val: timeLeft.m },
                  { label: 'S', val: timeLeft.s }
                ].map((item, i) => (
                  <div key={i} className="text-center p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                    <p className="text-2xl font-black tracking-tighter">{item.val.toString().padStart(2, '0')}</p>
                    <p className="text-[8px] font-black text-primary uppercase">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-[40px] p-2 overflow-hidden shadow-xl border border-slate-100 aspect-square">
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0, borderRadius: '32px' }}
              loading="lazy" 
              allowFullScreen 
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=REPLACE_WITH_YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(event.location)}`}
            />
          </div>

          <div className="bg-primary/5 rounded-[40px] p-8 space-y-4 border border-primary/10">
            <h4 className="font-black text-primary uppercase tracking-widest text-xs">Informations Pratiques</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm font-bold text-slate-600">
                <Check className="text-primary shrink-0" size={18} />
                Entrée libre pour les abonnés Premium
              </li>
              <li className="flex gap-3 text-sm font-bold text-slate-600">
                <Check className="text-primary shrink-0" size={18} />
                Places limitées, premier arrivé premier servi
              </li>
              <li className="flex gap-3 text-sm font-bold text-slate-600">
                <Check className="text-primary shrink-0" size={18} />
                Sécurité assurée sur place
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GoogleAd = ({ className, label = "Annonce Google" }: { className?: string, label?: string }) => (
  <div className={cn("bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[100px]", className)}>
    <div className="absolute top-0 right-0 bg-slate-200 px-2 py-0.5 text-[8px] font-bold text-slate-500 uppercase">Ad</div>
    <span className="text-[9px] text-slate-400 uppercase font-bold mb-1">{label}</span>
    <div className="w-12 h-px bg-slate-200 mb-2" />
    <div className="text-slate-300 font-bold text-sm">Espace Publicitaire</div>
  </div>
);

const SkeletonArticleCard = () => (
  <div className="bg-white rounded-[40px] p-6 space-y-4 shadow-sm border border-slate-100 animate-pulse">
    <div className="w-full aspect-[16/10] bg-slate-100 rounded-3xl" />
    <div className="space-y-3">
      <div className="h-4 bg-slate-100 rounded-full w-1/4" />
      <div className="h-6 bg-slate-100 rounded-full w-full" />
      <div className="h-6 bg-slate-100 rounded-full w-2/3" />
      <div className="flex justify-between items-center pt-4">
        <div className="h-4 bg-slate-100 rounded-full w-20" />
        <div className="flex gap-2">
           <div className="h-4 w-4 bg-slate-100 rounded-full" />
           <div className="h-4 w-4 bg-slate-100 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonArticleDetail = () => (
  <div className="max-w-4xl mx-auto space-y-8 py-10 animate-pulse">
    <div className="h-4 w-20 bg-slate-200 rounded-full mx-auto" />
    <div className="h-12 w-3/4 bg-slate-200 rounded-2xl mx-auto" />
    <div className="h-4 w-1/4 bg-slate-200 rounded-full mx-auto" />
    <div className="w-full aspect-video bg-slate-200 rounded-[40px]" />
    <div className="space-y-4">
       <div className="h-4 bg-slate-200 rounded-full w-full" />
       <div className="h-4 bg-slate-200 rounded-full w-full" />
       <div className="h-4 bg-slate-200 rounded-full w-4/5" />
    </div>
  </div>
);

const GalleryLightbox = ({ images, initialIndex, onClose }: { images: string[], initialIndex: number, onClose: () => void }) => {
  const [index, setIndex] = useState(initialIndex);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-4 md:p-10"
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white p-4 hover:bg-white/10 rounded-full transition-colors z-[1001]">
        <X size={32} />
      </button>
      
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img 
            key={index}
            src={images[index]}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-full max-h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        {images.length > 1 && (
          <>
            <button 
              onClick={() => setIndex(prev => (prev - 1 + images.length) % images.length)}
              className="absolute left-6 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={() => setIndex(prev => (prev + 1) % images.length)}
              className="absolute right-6 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>
      
      <div className="absolute bottom-10 flex gap-2 overflow-x-auto p-4 max-w-full">
        {images.map((img, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)}
            className={cn(
              "w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all",
              index === i ? "border-primary scale-110" : "border-transparent opacity-50"
            )}
          >
            <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const ExchangeRatesWidget = ({ rates }: { rates: Record<string, number> }) => (
  <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl border border-white/10 overflow-hidden relative group">
    <div className="absolute top-0 right-0 p-3 opacity-10">
      <Globe size={80} />
    </div>
    <div className="flex items-center gap-2 mb-2">
      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
        <Languages size={18} />
      </div>
      <h3 className="font-black text-xs uppercase tracking-widest">Marché des Changes</h3>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(rates).map(([pair, rate]) => (
        <div key={pair} className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400">{pair}</div>
          <div className="text-lg font-black tracking-tight">
            {typeof rate === 'number' ? rate.toFixed(2) : Number(rate).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
    <div className="pt-2 flex items-center gap-1 text-[8px] font-bold text-emerald-400 animate-pulse">
       <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> EN DIRECT
    </div>
  </div>
);

const AudioPlayer = ({ article }: { article: Article }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const title = article?.title || "Article";
      const author = article?.author || "Auteur inconnu";
      const excerpt = article?.excerpt || "";
      const content = article?.content || "";
      const textToSpeak = `${title}. Par ${author}. ${excerpt}. ${content.substring(0, 1000)}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'fr-FR';
      utterance.onend = () => setIsPlaying(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 group">
      <button 
        onClick={togglePlay}
        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform"
      >
        {isPlaying ? <Bell size={24} className="animate-pulse" /> : <TrendingUp size={24} className="rotate-90" />}
      </button>
      <div className="flex-1 space-y-1">
         <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Écouter l'article</div>
         <div className="text-sm font-bold text-slate-700">{isPlaying ? 'Lecture en cours...' : 'Version audio disponible'}</div>
      </div>
      {isPlaying && (
        <div className="flex items-center gap-half h-4">
           {[...Array(4)].map((_, i) => (
             <motion.div 
               key={i}
               animate={{ height: [8, 16, 8] }}
               transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
               className="w-1 bg-primary rounded-full"
             />
           ))}
        </div>
      )}
    </div>
  );
};

const ClassifiedsView = ({ classifieds, onBack, onAddClick }: { classifieds: Classified[], onBack: () => void, onAddClick: () => void }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  const safeClassifieds = classifieds || [];
  const filtered = activeTab === 'all' ? safeClassifieds : safeClassifieds.filter(c => c.category === activeTab);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto py-10 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <button onClick={onBack} className="text-primary text-xs font-bold flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Retour
          </button>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">Petites <span className="text-primary">Annonces</span></h2>
          <p className="text-slate-500 font-medium">Le marché communautaire d'Akwaba Info.</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-primary text-white px-8 py-4 rounded-3xl font-bold shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus size={20} /> Publier une annonce
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {['all', 'emploi', 'immobilier', 'véhicules', 'services', 'divers'].map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
               "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
               activeTab === cat ? "bg-slate-900 text-white" : "bg-white text-slate-400 border border-slate-100 hover:border-slate-300"
            )}
          >
            {cat === 'all' ? 'Toutes' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.length > 0 ? filtered.map(item => (
          <div key={item.id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
               {item.imageurl && (
                 <img src={item.imageurl} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
               )}
               <div className="absolute top-4 left-4">
                 <Badge category={item.category}>{item.category}</Badge>
               </div>
               {item.price && (
                 <div className="absolute bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-2xl font-black text-sm">
                   {item.price}
                 </div>
               )}
            </div>
            <div className="p-6 space-y-4">
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                <div className="flex items-center gap-1"><Map size={14} /> {item.location}</div>
                <div className="flex items-center gap-1"><Clock size={14} /> {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</div>
              </div>
              <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{item.description}</p>
              <div className="h-px bg-slate-50" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {(item.username || 'A')[0]}
                  </div>
                  <span className="text-xs font-bold text-slate-600">{item.username || 'Anonyme'}</span>
                </div>
                <button className="text-primary font-black text-xs uppercase tracking-widest hover:underline">Détails</button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="p-8 bg-slate-50 rounded-[40px] max-w-sm mx-auto border-2 border-dashed border-slate-200">
                <Search size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">Aucune annonce trouvée dans cette catégorie.</p>
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const LiveBlogView = ({ blog, onBack }: { blog: LiveBlog, onBack: () => void }) => {
  if (!blog) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-10 space-y-8"
    >
       <div className="space-y-4">
        <button onClick={onBack} className="text-primary text-xs font-bold flex items-center gap-1 mb-2">
          <ArrowLeft size={14} /> Retour à l'accueil
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" /> EN DIRECT
          </div>
          <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Live Blog</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight italic">{blog.title || 'Live Blog'}</h1>
      </div>

      <div className="space-y-12 relative before:absolute before:left-6 before:top-2 before:bottom-0 before:w-px before:bg-slate-100">
        {(blog.updates || []).map((update, idx) => (
          <motion.div 
            key={update.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-16 space-y-3"
          >
            <div className="absolute left-[18px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/10" />
            <div className="flex items-center gap-3">
               <span className="text-sm font-black text-primary">
                 {(() => {
                   try {
                     return safeFormatDate(update.date, 'HH:mm');
                   } catch {
                     return '--:--';
                   }
                 })()}
               </span>
               {update.type === 'urgent' && (
                 <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100">Urgent</span>
               )}
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="markdown-body prose prose-slate max-w-none">
                <ReactMarkdown>{update.content || ''}</ReactMarkdown>
              </div>
              {update.imageurl && (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img src={update.imageurl} className="w-full h-auto" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <User size={12} /> Par {update.author || 'Rédaction'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const PollCard = ({ poll, onVote, hasVoted }: { poll: Poll, onVote: (optionId: string) => void, hasVoted: boolean }) => {
  if (!poll) return null;
  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <div className="bg-white border-2 border-primary/10 rounded-[35px] p-8 shadow-2xl space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 bg-primary/10 rounded-bl-[20px] text-primary font-black text-[10px] tracking-widest uppercase">Sondage</div>
      <div className="flex gap-4">
        <div className="p-3 bg-primary rounded-2xl text-white h-fit shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
          <TrendingUp size={24} />
        </div>
        <h3 className="font-display font-black text-xl leading-tight">{poll.question}</h3>
      </div>
      
      <div className="space-y-3">
        {poll.options.map(option => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          return (
            <button 
              key={option.id}
              disabled={hasVoted}
              onClick={() => onVote(option.id)}
              className="w-full text-left relative group/opt overflow-hidden rounded-2xl border border-slate-100 hover:border-primary/30 transition-all p-4"
            >
              <div 
                className={cn(
                  "absolute inset-0 transition-all duration-1000",
                  hasVoted ? "bg-primary/5" : "bg-transparent group-hover/opt:bg-slate-50"
                )}
                style={{ width: hasVoted ? `${percentage}%` : '0%' }}
              />
              <div className="relative flex justify-between items-center text-sm">
                <span className={cn("font-bold", hasVoted && "text-primary")}>{option.text}</span>
                {hasVoted && <span className="font-black text-slate-400">{percentage}%</span>}
              </div>
            </button>
          );
        })}
      </div>
      {hasVoted && (
        <p className="text-[10px] text-slate-400 font-bold text-center italic">
          Merci pour votre participation ! ({totalVotes} votes au total)
        </p>
      )}
    </div>
  );
};

const WebTVView = ({ videos, onVideoClick }: { videos: WebTV[], onVideoClick: (v: WebTV) => void }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-5xl font-display font-black tracking-tighter italic">WEB <span className="text-secondary">TV</span></h2>
          <p className="text-slate-500 font-medium">L'actualité décryptée en images et en vidéos.</p>
        </div>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map(video => (
            <motion.div 
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-slate-100 group cursor-pointer"
              onClick={() => onVideoClick(video)}
            >
              <div className="relative aspect-video">
                <img 
                  src={optimizeImage(video.thumbnail || '', 800)} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500">
                    <TrendingUp size={32} />
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <Badge category={video.category}>{video.category}</Badge>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <h3 className="font-display font-black text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
                {video.description && (
                  <p className="text-slate-500 text-sm line-clamp-2 h-10">{video.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <Clock size={14} />
                  <span>{safeFormatDate(video.date, 'dd MMMM yyyy')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dotted border-slate-200">
           <div className="flex flex-col items-center gap-4 opacity-50">
            <MonitorOff size={64} className="text-slate-300" />
            <p className="font-black text-slate-400 uppercase tracking-widest">Aucune vidéo disponible pour le moment</p>
          </div>
        </div>
      )}
    </div>
  );
};
const ReadAlso = ({ currentArticle, articles, onArticleClick, onAuthorClick }: { currentArticle: Article, articles: Article[], onArticleClick: (a: Article) => void, onAuthorClick?: (name: string) => void }) => {
  const related = articles
    .filter(a => a.id !== currentArticle.id && a.category === currentArticle.category)
    .slice(0, 2);
  
  if (related.length === 0) return null;

  return (
    <div className="my-10 p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <FileText size={18} />
        </div>
        <h4 className="font-display font-black text-slate-900 uppercase tracking-widest text-xs">À lire aussi</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
        {related.map(article => (
          <button 
            key={article.id}
            id={`read-also-${article.id}`}
            onClick={() => onArticleClick(article)}
            className="flex gap-4 group text-left w-full items-start"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
              <img 
                src={optimizeImage(article.image, 300)} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                referrerPolicy="no-referrer" 
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter bg-primary/5 px-2 py-0.5 rounded-full">
                  {article.category}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">{article.readingtime}</span>
              </div>
              <h5 className="font-display font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight line-clamp-3 text-sm md:text-base">
                {article.title}
              </h5>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const RelatedArticles = ({ currentArticle, articles, onArticleClick, onBookmark, bookmarkedIds, onAuthorClick, categoryIcons }: { 
  currentArticle: Article, 
  articles: Article[], 
  onArticleClick: (a: Article) => void,
  onBookmark: (id: string, e: React.MouseEvent) => void,
  bookmarkedIds: Set<string>,
  onAuthorClick?: (name: string) => void,
  categoryIcons?: Record<string, string>
}) => {
  const related = React.useMemo(() => {
    return (articles || [])
      .filter(a => a.id !== currentArticle.id)
      .map(article => {
        let score = 0;
        if (article.category === currentArticle.category) score += 5;
        
        if (article.tags && Array.isArray(article.tags) && currentArticle.tags && Array.isArray(currentArticle.tags)) {
          const commonTags = article.tags.filter(tag => currentArticle.tags?.includes(tag));
          score += commonTags.length * 2;
        }
        
        return { article, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.article);
  }, [currentArticle, articles]);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 space-y-8 pt-8 relative border-t border-slate-100">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-secondary/10 rounded-2xl text-secondary flex items-center gap-2">
          <FileText size={24} />
        </div>
        <h3 className="text-2xl font-black italic tracking-tighter uppercase">Articles <span className="text-secondary">Similaires</span></h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            variant="vertical" 
            onClick={() => onArticleClick(article)} 
            onBookmark={onBookmark}
            isBookmarked={bookmarkedIds.has(article.id)}
            onAuthorClick={onAuthorClick}
            categoryIcon={categoryIcons?.[article.category]}
          />
        ))}
      </div>
    </section>
  );
};

const UnsubscribeView = ({ onHome }: { onHome: () => void }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      handleUnsubscribe(emailParam);
    }
  }, []);

  const handleUnsubscribe = async (targetEmail: string) => {
    if (!targetEmail) return;
    setStatus('loading');
    try {
      await api.unsubscribe(targetEmail);
      setStatus('success');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto py-20 px-6 text-center space-y-8"
    >
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-100 shadow-xl shadow-red-500/10">
        <MonitorOff size={40} />
      </div>
      
      {status === 'success' ? (
        <div className="space-y-6">
          <h2 className="text-4xl font-black tracking-tighter">Désabonnement réussi</h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            L'adresse <span className="text-slate-900 font-black">{email}</span> a été retirée de notre liste de diffusion. Nous sommes désolés de vous voir partir.
          </p>
          <button 
            onClick={onHome}
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <ArrowLeft size={16} /> Retour à l'accueil
          </button>
        </div>
      ) : status === 'error' ? (
        <div className="space-y-6">
          <h2 className="text-4xl font-black tracking-tighter text-red-500">Oups !</h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Une erreur est survenue lors de la tentative de désabonnement. Veuillez réessayer plus tard ou nous contacter directement.
          </p>
          <button 
            onClick={onHome}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-slate-900/20"
          >
            Retour à l'accueil
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-4xl font-black tracking-tighter">Traitement en cours...</h2>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}
    </motion.div>
  );
};

const FlashInfo = ({ articles }: { articles: string[] }) => {
  return (
    <div className="bg-slate-900 text-white overflow-hidden h-10 flex items-center relative z-[60]">
      <div className="bg-red-600 px-4 h-full flex items-center font-black text-[10px] uppercase tracking-widest shrink-0 relative z-10 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
        Dernières Nouvelles
      </div>
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex whitespace-nowrap gap-12 items-center"
        >
          {articles.map((text, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-bold tracking-tight">{text}</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {articles.map((text, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-bold tracking-tight">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const NotificationCenter = ({ 
  notifications, 
  onClose, 
  onMarkRead,
  onNavigate 
}: { 
  notifications: AppNotification[], 
  onClose: () => void,
  onMarkRead: (id: string) => void,
  onNavigate: (link: string) => void
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-20 right-4 md:right-6 z-[200] w-[calc(100vw-32px)] md:w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[70vh]"
    >
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Bell className="text-primary" size={20} /> Centre d'Alertes
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-50">
        {(notifications || []).length > 0 ? (notifications || []).map((notif) => (
          <div 
            key={notif.id}
            onClick={() => {
              if (notif.link) onNavigate(notif.link);
              onMarkRead(notif.id);
            }}
            className={cn(
              "p-5 cursor-pointer hover:bg-slate-50 transition-colors group relative",
              !notif.read && "bg-primary/[0.03]"
            )}
          >
            {!notif.read && (
              <div className="absolute top-6 left-2 w-2 h-2 bg-primary rounded-full" />
            )}
            <div className="space-y-1 ml-4">
              <div className="flex justify-between items-start gap-4">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                  notif.type === 'urgent' ? "bg-red-50 text-red-500 border-red-100" : "bg-slate-100 text-slate-400 border-slate-200"
                )}>
                  {notif.topic || notif.type}
                </span>
                <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                  {safeFormatDate(notif.date, 'HH:mm')}
                </span>
              </div>
              <h4 className={cn("text-sm font-bold leading-tight group-hover:text-primary transition-colors", !notif.read ? "text-slate-900" : "text-slate-500")}>
                {notif.title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2">
                {notif.message}
              </p>
            </div>
          </div>
        )) : (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <Bell size={32} />
            </div>
            <p className="text-sm font-bold text-slate-400">Aucune notification pour le moment.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
        <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70">
          Effacer tout l'historique
        </button>
      </div>
    </motion.div>
  );
};

const NewsletterPopup = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-white rounded-[40px] shadow-2xl max-w-lg w-full overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2 bg-slate-100/50 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-500" />
        </button>

        <div className="relative aspect-video">
          <img 
            src="https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=2069&auto=format&fit=crop" 
            alt="Newsletter" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        </div>

        <div className="p-10 -mt-20 relative z-10">
          <NewsletterSignup 
            variant="sidebar" 
            className="shadow-3xl"
            onPrivacyClick={() => { onClose(); /* Handle navigation separately */ }} 
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

const SupportChatWidget = ({ user, isDarkMode }: { user: UserProfile | null, isDarkMode: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      const unsub = api.subscribeToSupportMessages(user.uid, (msgs) => {
        setMessages(msgs);
      });
      return () => unsub();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      const isRecent = new Date(last.date).getTime() > Date.now() - 5000;
      if (last.isadmin && isRecent) {
        playNotificationSound('message');
      }
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    const msg: SupportMessage = {
      id: Date.now().toString(),
      userid: user.uid,
      username: user.displayname || 'Utilisateur',
      userphoto: user.photourl || undefined,
      content: text,
      date: new Date().toISOString(),
      isadmin: false
    };
    setText('');
    try {
      await api.sendSupportMessage(msg);
    } catch (e) {
      console.error("Support chat error:", e);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-[200] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "w-[calc(100vw-48px)] max-w-[400px] h-[500px] md:h-[550px] max-h-[80vh] rounded-[40px] shadow-2xl border flex flex-col overflow-hidden",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
            )}
          >
            {/* Header */}
            <div className="p-6 md:p-8 bg-primary text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl">
                  <Headset size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-display font-black leading-tight text-lg">Support Akwaba</h4>
                    <div className="bg-blue-500 text-white rounded-full p-0.5 shadow-sm">
                      <Check size={10} strokeWidth={4} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-70">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-[10px] uppercase font-black tracking-widest">En ligne</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <ChevronDown size={24} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 african-pattern no-scrollbar">
              {!user ? (
                <div className="text-center py-10 space-y-6">
                   <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/20">
                     <User size={40} />
                   </div>
                   <div className="space-y-4">
                     <p className="text-base font-black text-slate-800">Connectez-vous pour parler au support</p>
                     <p className="text-xs text-slate-400 font-bold max-w-[200px] mx-auto">Vous devez être identifié pour envoyer des messages en direct.</p>
                     <button 
                       onClick={() => {
                         setIsOpen(false);
                         document.querySelector<HTMLButtonElement>('[data-login-btn]')?.click();
                       }}
                       className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-xs"
                     >
                       Se connecter
                     </button>
                   </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 space-y-6">
                   <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/20">
                     <MessageSquare size={40} />
                   </div>
                   <div className="space-y-2">
                     <p className="text-base font-black text-slate-800">Besoin d'aide ?</p>
                     <p className="text-xs text-slate-400 font-bold max-w-[200px] mx-auto">Posez votre question, notre équipe vous répondra dès que possible.</p>
                   </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-2", msg.isadmin ? "items-start" : "items-end")}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                      msg.isadmin 
                        ? "bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm" 
                        : "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10"
                    )}>
                      {msg.content}
                    </div>
                    <div className={cn("flex items-center gap-1.5 mt-2 opacity-60", msg.isadmin ? "flex-row" : "flex-row-reverse")}>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">
                        {msg.isadmin ? "Support Akwaba" : "Moi"} • {safeFormatDate(msg.date, 'HH:mm')}
                      </span>
                      {msg.isadmin && (
                        <div className="bg-blue-500 text-white rounded-full p-px shadow-sm">
                          <Check size={8} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className={cn(
              "p-5 border-t flex gap-3",
              isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-100"
            )}>
              <input 
                type="text" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Écrivez ici..."
                className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-base font-medium focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-400"
              />
              <button 
                onClick={handleSend}
                disabled={!text.trim() || !user}
                className="p-3.5 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(255,103,33,0.3)] transition-all hover:scale-110 active:scale-90 relative",
          isOpen ? "bg-slate-900 text-white" : "bg-primary text-white"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X size={24} /> : <Headset size={24} />}
          </motion.div>
        </AnimatePresence>
        {!isOpen && (
          <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </div>
  );
};

const LiveChat = ({ articleId, user, isAdmin }: { articleId: string, user: UserProfile | null, isAdmin: boolean }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = api.subscribeToChat(articleId, (msgs: ChatMessage[]) => {
      setMessages(msgs);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });
    return unsub;
  }, [articleId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    const msg: Partial<ChatMessage> = {
      articleid: articleId,
      userid: user.uid,
      username: user.displayname || "Anonyme",
      userphoto: user.photourl || undefined,
      content: newMessage,
      date: new Date().toISOString(),
      isadmin: isAdmin
    };
    await api.sendChatMessage(msg);
    setNewMessage("");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h4 className="font-black text-xs uppercase tracking-widest">Chat en Direct</h4>
        </div>
        <span className="text-[10px] font-bold text-slate-400">{messages.length} messages</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex items-start gap-3", msg.userid === user?.uid ? "flex-row-reverse" : "")}>
            <img src={msg.userphoto || "https://ui-avatars.com/api/?name="+msg.username} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
            <div className={cn("max-w-[80%] p-3 rounded-2xl text-sm", msg.userid === user?.uid ? "bg-primary text-white rounded-tr-none" : "bg-white text-slate-700 shadow-sm rounded-tl-none")}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="text-[10px] font-black opacity-50">{msg.username}</div>
                {msg.isadmin && (
                  <div className="bg-blue-500 text-white rounded-full p-px shadow-sm">
                    <Check size={8} strokeWidth={4} />
                  </div>
                )}
              </div>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={user ? "Écrire un message..." : "Connectez-vous pour chatter"}
          disabled={!user}
          className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={!user} className="p-2 bg-primary text-white rounded-xl shadow-lg disabled:opacity-50">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

const RecommendedForYou = ({ articles, history, onArticleClick, onAuthorClick }: { articles: Article[], history: any[], onArticleClick: (a: Article) => void, onAuthorClick?: (name: string) => void }) => {
  const historySet = new Set(history.map(h => h.articleId));
  const recommended = articles
    .filter(a => !historySet.has(a.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  if (recommended.length === 0) return null;

  return (
    <div className="space-y-6 pt-10 border-t border-slate-100">
       <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
         <TrendingUp size={16} /> Recommandés pour vous
       </h4>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommended.map(a => (
            <div key={a.id} onClick={() => onArticleClick(a)} className="flex gap-4 group cursor-pointer" id={`rec-article-${a.id}`}>
               <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                  <img src={optimizeImage(a.image || "", 200)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
               </div>
               <div className="space-y-1">
                  <Badge category={a.category}>{a.category}</Badge>
                  <h5 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">{a.title}</h5>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

const PostClassifiedModal = ({ onClose, onPost }: { onClose: () => void, onPost: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'emploi',
    location: '',
    imageurl: '', // Normalized
    contact: '',
    contactMethod: 'email' as 'email' | 'phone'
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[40px] max-w-lg w-full p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-2xl font-black">Publier une annonce</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-2"><X size={24}/></button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-6 flex-1">
          <input 
            type="text" 
            placeholder="Titre de l'annonce"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <select 
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-xs"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value as any})}
            >
              <option value="emploi">Emploi</option>
              <option value="immobilier">Immobilier</option>
              <option value="véhicules">Véhicules</option>
              <option value="services">Services</option>
              <option value="divers">Divers</option>
            </select>
            <input 
              type="text" 
              placeholder="Prix (ex: 5000 F)"
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-xs"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>
          <input 
            type="text" 
            placeholder="Localisation"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-xs"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="URL de l'image"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-xs"
            value={formData.imageurl}
            onChange={e => setFormData({...formData, imageurl: e.target.value})}
          />
          
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Moyen de contact préféré</label>
             <div className="flex gap-4">
                <button 
                  onClick={() => setFormData({...formData, contactMethod: 'email'})}
                  className={cn(
                    "flex-1 py-3 rounded-xl border-2 text-[10px] font-black transition-all",
                    formData.contactMethod === 'email' ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-slate-400"
                  )}
                >
                  📧 EMAIL
                </button>
                <button 
                  onClick={() => setFormData({...formData, contactMethod: 'phone'})}
                  className={cn(
                    "flex-1 py-3 rounded-xl border-2 text-[10px] font-black transition-all",
                    formData.contactMethod === 'phone' ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-slate-400"
                  )}
                >
                  📱 TÉLÉPHONE
                </button>
             </div>
             <input 
                type={formData.contactMethod === 'email' ? 'email' : 'tel'} 
                placeholder={formData.contactMethod === 'email' ? "Votre email de contact" : "Votre numéro (ex: +225...)"}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                value={formData.contact}
                onChange={e => setFormData({...formData, contact: e.target.value})}
             />
          </div>

          <textarea 
            placeholder="Description détaillée..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 h-32 resize-none text-xs"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <button 
          onClick={() => onPost(formData)}
          className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
        >
          PUBLIER L'ANNONCE
        </button>
      </motion.div>
    </motion.div>
  );
};

// --- Main App ---

const SplashScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className={cn(
        "fixed inset-0 z-[1000] flex flex-col items-center justify-center p-6 bg-[#F5F1EB]"
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center gap-8"
      >
        <img 
          src="https://raw.githubusercontent.com/Akwabanews/Sources/main/images/2DB685A1-EE6B-478E-B70B-58F490D2948A.jpeg" 
          alt="Akwaba Info Logo" 
          className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-[40px] shadow-2xl border border-white/20"
          referrerPolicy="no-referrer"
        />
        
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl md:text-6xl font-black tracking-tighter uppercase"
          >
            <span className="text-[#000000]">AKWABA</span> <span className="text-[#1FA463]">INFO</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm"
          >
            L’info du monde en un clic
          </motion.p>
        </div>

        <div className="relative mt-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-slate-400 text-[10px] font-black uppercase tracking-widest"
        >
          Chargement de l'actualité...
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// State persistence helpers
const safeStorage = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch { return null; }
  },
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch { /* Ignore */ }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch { /* Ignore */ }
  }
};

const safeSession = {
  get: (key: string) => {
    try {
      return sessionStorage.getItem(key);
    } catch { return null; }
  },
  set: (key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch { /* Ignore */ }
  }
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState<'home' | 'article' | 'search' | 'donate' | 'about' | 'privacy' | 'terms' | 'contact' | 'cookies' | 'event' | 'all-events' | 'admin' | 'admin-login' | 'webtv' | 'profile' | 'classifieds' | 'live-blog' | 'author-profile' | 'authors' | 'unsubscribe' | 'culture-detail' | 'all-culture'>(() => {
    const saved = safeStorage.get('akwaba_current_view');
    if (saved === 'article') {
      // Only allow article view if we have an article ID saved
      return safeStorage.get('akwaba_selected_article_id') ? 'article' : 'home';
    }
    return (saved as any) || 'home';
  });

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(() => {
    const savedId = safeStorage.get('akwaba_selected_article_id');
    if (savedId) {
      try {
        const savedArticlesStr = safeStorage.get('akwaba_admin_articles');
        const articles = savedArticlesStr ? JSON.parse(savedArticlesStr) : MOCK_ARTICLES;
        // Search by ID first, then by slug
        return articles.find((a: Article) => a.id === savedId || a.slug === savedId) || 
               MOCK_ARTICLES.find(a => a.id === savedId || a.slug === savedId) || 
               null;
      } catch (e) {
        console.error("Error loading selected article:", e);
        return MOCK_ARTICLES.find(a => a.id === savedId || a.slug === savedId) || null;
      }
    }
    return null;
  });
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [adminArticles, setAdminArticles] = useState<Article[]>(() => {
    try {
      const saved = safeStorage.get('akwaba_admin_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_ARTICLES;
      }
      return MOCK_ARTICLES;
    } catch {
      return MOCK_ARTICLES;
    }
  });
  const [adminEvents, setAdminEvents] = useState<Event[]>(() => {
    try {
      const saved = safeStorage.get('akwaba_admin_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_EVENTS;
      }
      return MOCK_EVENTS;
    } catch {
      return MOCK_EVENTS;
    }
  });

  const [adminCulturePosts, setAdminCulturePosts] = useState<CulturePost[]>(() => {
    try {
      const saved = safeStorage.get('akwaba_admin_culture');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_CULTURE;
      }
      return MOCK_CULTURE;
    } catch {
      return MOCK_CULTURE;
    }
  });

  const [selectedCulturePost, setSelectedCulturePost] = useState<CulturePost | null>(null);
  const [editingCulturePost, setEditingCulturePost] = useState<CulturePost | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [adminPolls, setAdminPolls] = useState<Poll[]>([]);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [adminLiveBlogs, setAdminLiveBlogs] = useState<LiveBlog[]>([]);
  const [editingLiveBlog, setEditingLiveBlog] = useState<LiveBlog | null>(null);
  const [editingClassified, setEditingClassified] = useState<Classified | null>(null);
  const [adminWebTV, setAdminWebTV] = useState<WebTV[]>([]);
  const [adminAuthors, setAdminAuthors] = useState<Author[]>([]);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [editingWebTV, setEditingWebTV] = useState<WebTV | null>(null);
  const [isCloudLoaded, setIsCloudLoaded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeCategory, setActiveCategory] = useState('À la une');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only once per session
    return !safeSession.get('akwaba_splash_shown');
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string>('5000');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [showClassifiedsModal, setShowClassifiedsModal] = useState(false);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<string>('articles');
  
  const [activeNotification, setActiveNotification] = useState<string | {message: string, type: 'success' | 'urgent' | 'info'} | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    abouttext: "Akwaba Info est votre source de référence pour l'actualité en Afrique et dans le monde.",
    email: "contact@akwabainfo.com",
    phone: "+225 00 00 00 00",
    address: "Abidjan, Côte d'Ivoire",
    facebookurl: "https://facebook.com",
    twitterurl: "https://twitter.com",
    instagramurl: "https://instagram.com",
    tiktokurl: "https://tiktok.com",
    linkedinurl: "https://linkedin.com",
    youtubeurl: "https://youtube.com",
    categories: ['À la une', 'Urgent', 'Politique', 'Économie', 'Science', 'Santé', 'Culture', 'Sport', 'Afrique', 'Monde', 'Tech'],
    maintenancemode: false,
    urgentbanneractive: false,
    urgentbannertext: "",
    flashnews: "Côte d'Ivoire : Lancement d'un nouveau programme de soutien aux startups technologiques à Abidjan.;Économie : La ZLECAf annonce une progression record des échanges intra-africains pour le premier trimestre.;Sport : Les préparatifs de la prochaine CAN avancent à grands pas, inspection des stades terminée.;Culture : Le festival des musiques urbaines d'Anoumabo (FEMUA) dévoile sa programmation internationale.;Monde : Sommet extraordinaire de l'Union Africaine sur la sécurité alimentaire prévu le mois prochain.",
    // Donations & Premium
    donationamounts: [5000, 10000, 25000],
    donationpaymentmethods: ['PayPal', 'Orange Money', 'Wave', 'MTN', 'Moov', 'Stripe', 'Flutterwave'],
    premiumprice: 5000,
    isdonationactive: true,
    ispremiumactive: true,
    activepaymentmethods: {
      paypal: true,
      stripe: true,
      flutterwave: true,
      orangeMoney: true,
      mtn: true,
      moov: true,
      wave: true
    },
    paymentlinks: {
      paypal: "",
      stripe: "",
      flutterwave: "",
      orangeMoney: "",
      mtn: "",
      moov: "",
      wave: ""
    },
    orangemoneynumber: "0707070707",
    mtnmoneynumber: "0505050505",
    moovmoneynumber: "0101010101",
    wavenumber: "0708091011",
    premiumdurationmonths: 1
  });
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminActivityLog[]>([]);

  useEffect(() => {
    // Pick first active payment method as default for donation view
    if (siteSettings.activepaymentmethods) {
      const firstActive = Object.entries(siteSettings.activepaymentmethods).find(([_, active]) => active)?.[0];
      if (firstActive && !selectedPayment) setSelectedPayment(firstActive);
    }
  }, [siteSettings.activepaymentmethods, selectedPayment]);

  const getPaymentIcon = (method: string, isSelected: boolean) => {
    const className = isSelected ? "text-primary" : "text-slate-400";
    switch(method) {
      case 'paypal': return <Globe size={24} className={className} />;
      case 'stripe': return <CreditCard size={24} className={className} />;
      case 'flutterwave': return <CreditCard size={24} className={className} />;
      case 'orangeMoney': return <Smartphone size={24} className={className} />;
      case 'wave': return <Smartphone size={24} className={className} />;
      case 'mtn': return <Smartphone size={24} className={className} />;
      case 'moov': return <Smartphone size={24} className={className} />;
      default: return <CreditCard size={24} className={className} />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch(method) {
      case 'paypal': return 'PayPal';
      case 'stripe': return 'Stripe';
      case 'flutterwave': return 'Flutterwave';
      case 'orangeMoney': return 'Orange Money';
      case 'wave': return 'Wave';
      case 'mtn': return 'MTN Money';
      case 'moov': return 'Moov Money';
      default: return method;
    }
  };
  const [mediaLibrary, setMediaLibrary] = useState<MediaAsset[]>([]);
  const [classifieds, setClassifieds] = useState<Classified[]>([]);
  const [liveBlogs, setLiveBlogs] = useState<LiveBlog[]>([]);
  const [activeLiveBlog, setActiveLiveBlog] = useState<LiveBlog | null>(null);
  const [exchangeRates, setExchangeRates] = useState<any>({
    "EUR/XOF": 655.95,
    "USD/XOF": 612.45,
    "GBP/XOF": 774.20,
    "NGN/XOF": 0.42
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/EUR');
        const data = await res.json();
        if (data && data.rates && data.rates.XOF) {
          setExchangeRates({
            'EUR/XOF': data.rates.XOF,
            'USD/XOF': data.rates.XOF / data.rates.USD,
            'GBP/XOF': data.rates.XOF / data.rates.GBP,
            'NGN/XOF': data.rates.XOF / data.rates.NGN
          });
        }
      } catch (e) {
        console.error("Exchange rate fetch error:", e);
      }
    };
    fetchRates();
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, []);
  const [activePoll, setActivePoll] = useState<Poll | null>({
    id: 'poll-1',
    question: "Pensez-vous que la technologie peut transformer l'éducation en Afrique ?",
    options: [
      { id: '1', text: "Oui, absolument", votes: 450 },
      { id: '2', text: "Peut-être, avec des moyens", votes: 230 },
      { id: '3', text: "Non, pas encore", votes: 120 }
    ],
    startdate: new Date().toISOString(),
    active: true
  });
  const [hasVoted, setHasVoted] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const unreadNotifsCount = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;

  // Persist important state
  useEffect(() => {
    safeStorage.set('akwaba_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    safeStorage.set('akwaba_is_admin', isAdminAuthenticated.toString());
  }, [isAdminAuthenticated]);

  useEffect(() => {
    safeStorage.set('akwaba_admin_articles', JSON.stringify(adminArticles));
  }, [adminArticles]);

  useEffect(() => {
    safeStorage.set('akwaba_admin_events', JSON.stringify(adminEvents));
  }, [adminEvents]);

  useEffect(() => {
    if (selectedArticle) {
      safeStorage.set('akwaba_selected_article_id', selectedArticle.id);
    } else {
      safeStorage.remove('akwaba_selected_article_id');
    }
  }, [selectedArticle]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      api.getPolls().then(data => setAdminPolls(Array.isArray(data) ? data : [])).catch(console.error);
      api.getLiveBlogs().then(data => setAdminLiveBlogs(Array.isArray(data) ? data : [])).catch(console.error);
      api.getWebTV().then(data => setAdminWebTV(Array.isArray(data) ? data : [])).catch(console.error);
      api.getAdminStats()
        .then(data => setAdminStats(data && !Array.isArray(data) ? data : { error: true }))
        .catch(err => {
          console.error("Erreur stats:", err);
          setAdminStats({ error: true });
        });
      api.getAdminActivityLog().then(data => setAdminLogs(Array.isArray(data) ? data : [])).catch(console.error);
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    // Sync active poll for public view
    if (adminPolls.length > 0) {
      const latestActive = adminPolls.find(p => p.active);
      if (latestActive) setActivePoll(latestActive);
    }
  }, [adminPolls]);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = api.subscribeToNotifications(currentUser.uid, (notifs: any) => {
        if (!Array.isArray(notifs)) {
          setNotifications([]);
          return;
        }
        setNotifications(notifs);
        // Show the latest unread notification as a toast if it's new
        const latest = notifs.find(n => !n.read);
        if (latest && latest.date > new Date(Date.now() - 1000 * 60).toISOString()) {
            setActiveNotification({ message: latest.title, type: latest.type === 'urgent' ? 'urgent' : 'info' });
            playNotificationSound(latest.type === 'urgent' ? 'urgent' : 'info');
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = api.subscribeToArticles((article) => {
      if (article.category === 'Urgent') {
        playNotificationSound('urgent');
        setActiveNotification({ message: `URGENT : ${article.title}`, type: 'urgent' });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      setActiveNotification({ 
        message: "Paiement réussi ! Un administrateur va valider votre transaction sous peu.", 
        type: 'success' 
      });
      setTimeout(() => setActiveNotification(null), 5000);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleMarkNotificationAsRead = async (id: string) => {
    await api.markNotificationAsRead(id);
  };

  const handlePostClassified = async (data: any) => {
    if (!currentUser) return;
    const newAd: Classified = {
      id: Date.now().toString(),
      userid: currentUser.uid,
      username: currentUser.displayname || 'Anonyme',
      title: data.title || '',
      description: data.description || '',
      price: data.price,
      category: data.category as any || 'divers',
      location: data.location || '',
      contact: data.contact || currentUser.email || 'N/A',
      imageurl: data.imageurl,
      date: new Date().toISOString(),
      status: 'active'
    };
    
    try {
      await api.saveClassified(newAd);
      setClassifieds(prev => [newAd, ...prev]);
      setShowClassifiedsModal(false);
      setActiveNotification("Annonce publiée avec succès !");
      setTimeout(() => setActiveNotification(null), 3000);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la publication de l'annonce.");
    }
  };

  const handleVote = async (optionId: string) => {
    if (!activePoll || !currentUser) {
      if (!currentUser) handleUserLogin();
      return;
    }

    // Check if user has already voted
    const profile = await api.getUserProfile(currentUser.uid);
    if (profile && profile.votedpolls?.includes(activePoll.id)) {
      alert("Vous avez déjà voté pour ce sondage.");
      setHasVoted(true);
      return;
    }
    
    try {
      await api.submitVote(activePoll.id, optionId);
      
      const updatedOptions = activePoll.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      setActivePoll({ ...activePoll, options: updatedOptions });
      setHasVoted(true);
      setActiveNotification("Vote enregistré ! Merci.");
    } catch (error) {
      console.error("Poll vote error:", error);
    }
  };
  
  // Persistence Logic
  const [articleComments, setArticleComments] = useState<Record<string, Comment[]>>(() => {
    const saved = safeStorage.get('akwaba_comments');
    try {
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  
  const [articleLikes, setArticleLikes] = useState<Record<string, number>>(() => {
    const saved = safeStorage.get('akwaba_likes');
    try {
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [userLikedArticles, setUserLikedArticles] = useState<Set<string>>(() => {
    const saved = safeStorage.get('akwaba_user_likes');
    try {
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [userBookmarkedArticles, setUserBookmarkedArticles] = useState<Set<string>>(() => {
    const saved = safeStorage.get('akwaba_user_bookmarks');
    try {
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [userFollowedAuthors, setUserFollowedAuthors] = useState<Set<string>>(() => {
    const saved = safeStorage.get('akwaba_user_followed_authors');
    try {
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [userFollowedCategories, setUserFollowedCategories] = useState<Set<string>>(() => {
    const saved = safeStorage.get('akwaba_user_followed_categories');
    try {
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [userInterests, setUserInterests] = useState<string[]>(() => {
    const saved = safeStorage.get('akwaba_user_interests');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [userPoints, setUserPoints] = useState(0);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchViewMode, setSearchViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearching, setIsSearching] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string, username: string } | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentAuthorName, setCommentAuthorName] = useState('');

  useEffect(() => {
    safeStorage.set('akwaba_comments', JSON.stringify(articleComments));
  }, [articleComments]);

  useEffect(() => {
    safeStorage.set('akwaba_likes', JSON.stringify(articleLikes));
  }, [articleLikes]);

  useEffect(() => {
    safeStorage.set('akwaba_user_likes', JSON.stringify(Array.from(userLikedArticles)));
  }, [userLikedArticles]);

  useEffect(() => {
    safeStorage.set('akwaba_user_followed_categories', JSON.stringify(Array.from(userFollowedCategories)));
  }, [userFollowedCategories]);

  useEffect(() => {
    safeStorage.set('akwaba_user_interests', JSON.stringify(userInterests));
  }, [userInterests]);

  useEffect(() => {
    safeStorage.set('akwaba_admin_articles', JSON.stringify(adminArticles));
  }, [adminArticles]);

  useEffect(() => {
    safeStorage.set('akwaba_admin_events', JSON.stringify(adminEvents));
  }, [adminEvents]);

  const currentViewRef = useRef(currentView);
  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  // Sync state with URL for deep linking and back button support
  useEffect(() => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    
    if (path === '/') {
      setCurrentView('home');
    } else if (path.startsWith('/article/')) {
      const slug = parts[1];
      if (slug) {
        // Always switch to article view when path matches
        setCurrentView('article');
        const article = adminArticles.find(a => (a.slug || a.id) === slug);
        if (article) {
          setSelectedArticle(article);
        }
      }
    } else if (path.startsWith('/evenement/')) {
      const slug = parts[1];
      if (slug) {
        setCurrentView('event');
        const event = adminEvents.find(e => (e.slug || e.id) === slug);
        if (event) {
          setSelectedEvent(event);
        }
      }
    } else if (path.startsWith('/culture/')) {
      const slug = parts[1];
      if (slug) {
        setCurrentView('culture-detail');
        const culture = adminCulturePosts.find(c => (c.slug || c.id) === slug);
        if (culture) {
          setSelectedCulturePost(culture);
        } else {
          setCurrentView('all-culture');
        }
      } else {
        setCurrentView('all-culture');
      }
    } else if (path === '/profil') {
      setCurrentView('profile');
    } else if (path === '/admin') {
      setCurrentView('admin');
    } else if (path === '/recherche') {
      setCurrentView('search');
    } else if (path === '/agenda') {
      setCurrentView('all-events');
    } else if (path === '/a-propos') {
      setCurrentView('about');
    } else if (path === '/contact') {
      setCurrentView('contact');
    } else if (path === '/donate') {
      setCurrentView('donate');
    } else if (path === '/webtv') {
      setCurrentView('webtv');
    } else if (path === '/annonces') {
      setCurrentView('classifieds');
    } else if (path === '/live') {
      setCurrentView('live-blog');
    } else if (path === '/auteurs') {
      setCurrentView('authors');
    } else if (path === '/politique-confidentialite') {
      setCurrentView('privacy');
    } else if (path === '/conditions-utilisation') {
      setCurrentView('terms');
    } else if (path === '/cookies') {
      setCurrentView('cookies');
    } else if (path === '/unsubscribe') {
      setCurrentView('unsubscribe');
    }
  }, [location.pathname, adminArticles, adminEvents, adminCulturePosts]);

  // Auth Listener & Data Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      // Use Ref to get current state without re-running effect
      const currentV = currentViewRef.current;

      if (user) {
        setCurrentUser(user);
        
        // Profile load & Premium check
        try {
          const profile = await api.getUserProfile(user.uid);
          if (profile) {
            const isActuallyPremium = await api.checkPremiumStatus(user.uid);
            
            setCurrentUser(prev => ({ 
              ...prev, 
              ispremium: isActuallyPremium,
              premiumuntil: profile.premiumuntil,
              paymentmethod: profile.paymentmethod,
              points: profile.points || 0,
              badges: profile.badges || [],
              history: profile.history || [],
              likedarticles: profile.likedarticles || [],
              bookmarkedarticles: profile.bookmarkedarticles || [],
              followedauthors: profile.followedauthors || [],
              followedcategories: profile.followedcategories || [],
              interests: profile.interests || []
            }));

            setUserPoints(profile.points || 0);
            setUserBadges(profile.badges || []);
            setUserBookmarkedArticles(new Set(profile.bookmarkedarticles || []));
            setUserFollowedAuthors(new Set(profile.followedauthors || []));
            setUserFollowedCategories(new Set(profile.followedcategories || []));
            setUserInterests(profile.interests || []);

            // Admin Detection via role
            if (profile.role === 'admin') {
              setIsAdminAuthenticated(true);
              safeStorage.set('akwaba_is_admin', 'true');
            } else {
              setIsAdminAuthenticated(false);
              safeStorage.set('akwaba_is_admin', 'false');
            }
          }
        } catch (e) {
          console.error("Profile sync error:", e);
        }
      } else {
        setCurrentUser(null);
        setIsAdminAuthenticated(false);
        safeStorage.set('akwaba_is_admin', 'false');
      }
      setIsAuthChecked(true);
    });

    // Initial Data Fetch
    const fetchData = async () => {
      try {
        const [cloudArticles, cloudEvents, cloudSettings, cloudComments, cloudSubs, cloudMedia, cloudClassifieds, cloudLiveBlogs, cloudCulture, cloudAuthors] = await Promise.all([
          api.getArticles().catch(() => []),
          api.getEvents().catch(() => []),
          api.getSettings().catch(() => null),
          api.getAllComments().catch(() => []),
          api.getSubscribers().catch(() => []),
          api.getMediaLibrary().catch(() => []),
          api.getClassifieds().catch(() => []),
          api.getLiveBlogs().catch(() => []),
          api.getCulturePosts().catch(() => []),
          api.getAuthors().catch(() => [])
        ]);
        
        if (Array.isArray(cloudArticles)) setAdminArticles(cloudArticles);
        if (Array.isArray(cloudEvents)) setAdminEvents(cloudEvents);
        if (cloudSettings && !Array.isArray(cloudSettings)) setSiteSettings(cloudSettings);
        if (Array.isArray(cloudComments)) setAllComments(cloudComments);
        if (Array.isArray(cloudSubs)) setSubscribers(cloudSubs);
        if (Array.isArray(cloudMedia)) setMediaLibrary(cloudMedia);
        if (Array.isArray(cloudClassifieds)) setClassifieds(cloudClassifieds);
        if (Array.isArray(cloudLiveBlogs)) setLiveBlogs(cloudLiveBlogs);
        if (Array.isArray(cloudCulture)) setAdminCulturePosts(cloudCulture);
        if (Array.isArray(cloudAuthors)) setAdminAuthors(cloudAuthors.length > 0 ? cloudAuthors : MOCK_AUTHORS);
      } catch (error: any) {
        console.warn("Silent failure in data fetching, using cache/mocks:", error);
      } finally {
        setIsCloudLoaded(true);
      }
    };
    fetchData();

    // Safety fallback for auth and cloud loading
    const safetyTimer = setTimeout(() => {
      setIsAuthChecked(true);
      setIsCloudLoaded(true);
    }, 5000);

    return () => {
      if (typeof unsubscribe === 'function') (unsubscribe as any)();
      clearTimeout(safetyTimer);
    };
  }, []);

  useEffect(() => {
    // Check for payment success redirection (e.g. ?payment_success=true&method=PayPal)
    if (!isAuthChecked || !currentUser) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      const method = params.get('payment_method') || 'PayPal';
      const amount = parseInt(params.get('amount') || '0') || siteSettings.premiumprice;

      api.upgradeToPremium(currentUser.uid, method, siteSettings.premiumdurationmonths || 1)
        .then(() => {
          // Record the transaction for history
          api.recordTransaction({
            userid: currentUser.uid, 
            email: currentUser.email, 
            amount: amount, 
            method: method, 
            type: 'subscription', 
            status: 'success'
          });
          
          api.getUserProfile(currentUser.uid).then(profile => {
            setCurrentUser(prev => prev ? { 
              ...prev, 
              ispremium: true,
              premiumuntil: profile?.premiumuntil 
            } : null);
            setActiveNotification({ message: "Paiement confirmé ! Bienvenue dans le Club Premium.", type: 'success' });
            playNotificationSound('payment');
            // Cleanup URL
            window.history.replaceState({}, '', window.location.pathname);
          });
        }).catch(err => {
          console.error("Payment confirmation error:", err);
          setActiveNotification({ message: "Erreur lors de la confirmation du paiement.", type: 'urgent' });
        });
    }
  }, [isAuthChecked, currentUser, siteSettings]);

  const handleAdminLogin = async () => {
    try {
      // Prioritize current user if already logged in, otherwise use fallback admin
      const adminEmail = currentUser?.email || 'akwabanewsinfo@gmail.com';
      setActiveNotification({ 
        message: `Envoi du lien d'accès sécurisé à ${adminEmail}...`, 
        type: 'info' 
      });
      await api.sendMagicLink(adminEmail);
      setActiveNotification({ 
        message: "Lien envoyé ! Veuillez vérifier votre boîte de réception pour accéder au Tableau de Bord.", 
        type: 'success' 
      });
    } catch (error: any) {
      console.error("Admin Login Error:", error);
      alert("Erreur lors de l'envoi du lien admin : " + (error.message || "Erreur inconnue"));
    }
  };

  const handleSaveArticle = async (article: Partial<Article>) => {
    try {
      const art = article as Article;
      await api.saveArticle(art);
      if (art.image) api.trackMedia(art.image, 'image');
      if (art.video) api.trackMedia(art.video, 'video');
      
      setAdminArticles(prev => {
        const isNew = !prev.find(a => a.id === art.id);
        if (isNew) return [art, ...prev];
        return prev.map(a => a.id === art.id ? art : a);
      });
      setEditingArticle(null);
      setActiveNotification({ message: "Article enregistré avec succès !", type: 'success' });
      setTimeout(() => setActiveNotification(null), 5000);
    } catch (error: any) {
      console.error("Error saving article:", error);
      const details = error.message || "Erreur inconnue";
      if (details.includes("Could not find the table")) {
        alert(`ERREUR CRITIQUE : La table 'articles' n'existe pas dans votre base de données.\n\nACTION REQUISE : Vérifiez que vous avez bien importé le fichier 'database.sql' dans votre base de données MySQL.`);
      } else {
        alert(`Erreur lors de la sauvegarde de l'article.\n\nDétails : ${details}\n\nNote : Vérifiez que vous êtes bien connecté et que la table 'articles' existe.`);
      }
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article du Cloud ?')) {
      try {
        await api.deleteArticle(id);
        setAdminArticles(prev => prev.filter(a => a.id !== id));
        setActiveNotification({ message: "Article supprimé du Cloud.", type: 'info' });
        setTimeout(() => setActiveNotification(null), 3000);
      } catch (error: any) {
        console.error("Error deleting article:", error);
        alert(`Impossible de supprimer l'article.\n\nDétails : ${error.message || "Erreur inconnue"}`);
      }
    }
  };

  const handleSaveCulturePost = async (post: CulturePost) => {
    try {
      await api.saveCulturePost(post);
      setAdminCulturePosts(prev => {
        const index = prev.findIndex(p => p.id === post.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = post;
          return next;
        }
        return [post, ...prev];
      });
      setEditingCulturePost(null);
      setActiveNotification({ message: "Post culture enregistré avec succès !", type: 'success' });
      playNotificationSound('info');
    } catch (error) {
      console.error(error);
      setActiveNotification({ message: "Erreur lors de l'enregistrement.", type: 'urgent' });
    }
  };

  const handleDeleteCulturePost = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce post ?")) return;
    try {
      await api.deleteCulturePost(id);
      setAdminCulturePosts(prev => prev.filter(p => p.id !== id));
      setActiveNotification({ message: "Post culture supprimé.", type: 'success' });
    } catch (error) {
       console.error(error);
       setActiveNotification({ message: "Erreur lors de la suppression.", type: 'urgent' });
    }
  };

  const handleSaveAuthor = async (author: Author) => {
    try {
      await api.saveAuthor(author);
      setAdminAuthors(prev => {
        const isNew = !prev.find(a => a.id === author.id);
        if (isNew) return [...prev, author];
        return prev.map(a => a.id === author.id ? author : a);
      });
      setEditingAuthor(null);
      setActiveNotification({ message: "Auteur enregistré avec succès !", type: 'success' });
    } catch (error) {
      console.error(error);
      setActiveNotification({ message: "Erreur lors de l'enregistrement.", type: 'urgent' });
    }
  };

  const handleDeleteAuthor = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet auteur ?")) return;
    try {
      await api.deleteAuthor(id);
      setAdminAuthors(prev => prev.filter(a => a.id !== id));
      setActiveNotification({ message: "Auteur supprimé.", type: 'success' });
    } catch (error) {
      console.error(error);
      setActiveNotification({ message: "Erreur lors de la suppression.", type: 'urgent' });
    }
  };

  const handleSaveEvent = async (event: Partial<Event>) => {
    try {
      const ev = event as Event;
      await api.saveEvent(ev);
      if (ev.image) api.trackMedia(ev.image, 'image');
      if (ev.video) api.trackMedia(ev.video, 'video');
      
      setAdminEvents(prev => {
        const isNew = !prev.find(e => e.id === ev.id);
        if (isNew) return [ev, ...prev];
        return prev.map(e => e.id === ev.id ? ev : e);
      });
      setEditingEvent(null);
      setActiveNotification({ message: "Événement enregistré avec succès !", type: 'success' });
      setTimeout(() => setActiveNotification(null), 5000);
    } catch (error: any) {
      console.error("Error saving event:", error);
      alert(`Erreur lors de la sauvegarde de l'événement.\n\nDétails : ${error.message || "Erreur inconnue"}`);
    }
  };

  const handleSaveSettings = async (settings: SiteSettings) => {
    try {
      await api.saveSettings(settings);
      setSiteSettings(settings);
      setActiveNotification({ message: "Configuration mise à jour avec succès !", type: 'success' });
      setTimeout(() => setActiveNotification(null), 5000);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      let details = error.message || "Erreur inconnue";
      if (details.includes('settings')) {
        details = "La table 'settings' est manquante ou inaccessible dans votre base de données Supabase.";
      }
      alert("Erreur lors de la sauvegarde des paramètres.\n\nDétails : " + details + "\n\n1. Vérifiez que vous êtes connecté avec akwabanewsinfo@gmail.com\n2. Vérifiez que la table 'settings' existe dans votre projet Supabase.");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (confirm('Supprimer ce commentaire de façon permanente ?')) {
      try {
        await api.deleteComment(id);
        setAllComments(prev => prev.filter(c => c.id !== id));
        setActiveNotification({ message: "Commentaire supprimé.", type: 'info' });
        setTimeout(() => setActiveNotification(null), 3000);
      } catch (error: any) {
        console.error("Error deleting comment:", error);
        alert(`Erreur lors de la suppression.\nDétails : ${error.message || "Erreur inconnue"}`);
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement du Cloud ?')) {
      try {
        await api.deleteEvent(id);
        setAdminEvents(prev => prev.filter(e => e.id !== id));
        setActiveNotification({ message: "Événement supprimé.", type: 'info' });
        setTimeout(() => setActiveNotification(null), 3000);
      } catch (error: any) {
        console.error("Error deleting event:", error);
        alert(`Action impossible pour le moment.\nDétails : ${error.message || "Erreur inconnue"}`);
      }
    }
  };

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    
    try {
      // Use Support logic to send a message
      const msgId = Date.now().toString();
      const message: SupportMessage = {
        id: msgId,
        userid: currentUser?.uid || `visitor-${Date.now()}`,
        username: contactForm.name,
        content: `MESSAGE CONTACT: ${contactForm.message}`,
        date: new Date().toISOString(),
        isadmin: false
      };
      await api.sendSupportMessage(message);
      setContactForm({ name: '', email: '', message: '' });
      setActiveNotification("Message envoyé ! Nous vous répondrons par email.");
    } catch (error) {
       console.error(error);
       alert("Erreur lors de l'envoi.");
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (confirm('Supprimer cet abonné ?')) {
      try {
        await api.deleteSubscriber(id);
        setSubscribers(subscribers.filter(s => s.id !== id));
        setActiveNotification("Abonné supprimé.");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteMediaAsset = async (id: string) => {
    if (confirm('Supprimer ce média ?')) {
      try {
        await api.deleteMediaAsset(id);
        setMediaLibrary(mediaLibrary.filter(m => m.id !== id));
        setActiveNotification("Média supprimé.");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (confirm('Voulez-vous vraiment bloquer cet utilisateur ?')) {
      try {
        await api.blockUser(userId);
        setActiveNotification("Utilisateur bloqué.");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSavePoll = async (poll: Poll) => {
    try {
      await api.savePoll(poll);
      setAdminPolls(prev => {
        const index = prev.findIndex(p => p.id === poll.id);
        if (index >= 0) {
          const newPolls = [...prev];
          newPolls[index] = poll;
          return newPolls;
        }
        return [poll, ...prev];
      });
      setEditingPoll(null);
      setActiveNotification({ message: "Sondage enregistré !", type: 'success' });
    } catch (error: any) {
      console.error(error);
      setActiveNotification({ message: `Erreur : ${error.message || "Impossible d'enregistrer le sondage"}`, type: 'urgent' });
    }
  };

  const handleDeletePoll = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce sondage ?")) {
      try {
        await api.deletePoll(id);
        setAdminPolls(prev => prev.filter(p => p.id !== id));
        setActiveNotification("Sondage supprimé.");
      } catch (error) {
        console.error(error);
        setActiveNotification("Erreur lors de la suppression.");
      }
    }
  };

  const handleSaveClassified = async (classified: Classified) => {
    try {
      await api.saveClassified(classified);
      setClassifieds(prev => {
        const index = prev.findIndex(c => c.id === classified.id);
        if (index >= 0) {
          const newList = [...prev];
          newList[index] = classified;
          return newList;
        }
        return [classified, ...prev];
      });
      setEditingClassified(null);
      setActiveNotification({ message: "Annonce enregistrée !", type: 'success' });
    } catch (error: any) {
      console.error(error);
      setActiveNotification({ message: `Erreur : ${error.message || "Impossible d'enregistrer l'annonce"}`, type: 'urgent' });
    }
  };

  const handleDeleteClassified = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer cette annonce ?")) {
      try {
        await api.deleteClassified(id);
        setClassifieds(prev => prev.filter(c => c.id !== id));
        setActiveNotification("Annonce supprimée.");
      } catch (error) {
        console.error(error);
        setActiveNotification("Erreur lors de la suppression.");
      }
    }
  };

  const handleSaveLiveBlog = async (blog: LiveBlog) => {
    try {
      await api.saveLiveBlog(blog);
      setAdminLiveBlogs(prev => {
        const index = prev.findIndex(l => l.id === blog.id);
        if (index >= 0) {
          const newList = [...prev];
          newList[index] = blog;
          return newList;
        }
        return [blog, ...prev];
      });
      setEditingLiveBlog(null);
      setActiveNotification({ message: "Direct enregistré !", type: 'success' });
    } catch (error: any) {
      console.error(error);
      setActiveNotification({ message: `Erreur : ${error.message || "Impossible d'enregistrer le direct"}`, type: 'urgent' });
    }
  };

  const handleDeleteLiveBlog = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce direct ?")) {
      try {
        await api.deleteLiveBlog(id);
        setAdminLiveBlogs(prev => prev.filter(l => l.id !== id));
        setActiveNotification("Direct supprimé.");
      } catch (error) {
        console.error(error);
        setActiveNotification("Erreur lors de la suppression.");
      }
    }
  };

  const handleSaveWebTV = async (video: WebTV) => {
    try {
      await api.saveWebTV(video);
      setAdminWebTV(prev => {
        const index = prev.findIndex(v => v.id === video.id);
        if (index >= 0) {
          const newList = [...prev];
          newList[index] = video;
          return newList;
        }
        return [video, ...prev];
      });
      setEditingWebTV(null);
      setActiveNotification({ message: "Vidéo enregistrée !", type: 'success' });
    } catch (error: any) {
      console.error(error);
      setActiveNotification({ message: `Erreur : ${error.message || "Impossible d'enregistrer la vidéo"}`, type: 'urgent' });
    }
  };

  const handleDeleteWebTV = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer cette vidéo ?")) {
      try {
        await api.deleteWebTV(id);
        setAdminWebTV(prev => prev.filter(v => v.id !== id));
        setActiveNotification("Vidéo supprimée.");
      } catch (error) {
        console.error(error);
        setActiveNotification("Erreur lors de la suppression.");
      }
    }
  };

  const handleValidateTransaction = async (tid: string, uid: string) => {
    try {
      await api.validatePremiumTransaction(tid, uid, siteSettings.premiumdurationmonths || 1);
      setActiveNotification({ 
        message: "Transaction validée ! L'utilisateur a maintenant accès au contenu Premium.", 
        type: 'success' 
      });
      // Refresh stats if needed
    } catch (error) {
      console.error("Validation error:", error);
      setActiveNotification({ message: "Erreur lors de la validation.", type: 'urgent' });
    }
  };

  const handleAdminLogout = async () => {
    try {
      await api.logout();
      setCurrentView('home');
      window.location.href = '/';
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleConfirmPayment = async (amount: number, method: string, type: 'subscription' | 'donation', transId?: string) => {
    if (!currentUser) return;

    try {
      // 1. Record Transaction as PENDING
      await api.recordTransaction({
        userId: currentUser.uid,
        email: currentUser.email || 'Anonyme',
        amount,
        method,
        type,
        status: 'pending',
        reference: transId
      });

      // 2. Supabase Notification for Admin
      await api.sendNotification({
        id: crypto.randomUUID(),
        userId: 'admin',
        title: "💰 Nouveau paiement en attente",
        message: `${currentUser.email} a déclaré avoir payé ${amount} F via ${method}. ID: ${transId || 'N/A'}. Type: ${type === 'subscription' ? 'Abonnement' : 'Don'}.`,
        type: 'urgent',
        link: "/admin?tab=premium",
        date: new Date().toISOString(),
        read: false
      } as any);

      // 3. Email Notification to Admin
      await api.notifyAdminPayment({
        email: currentUser.email || 'Anonyme',
        amount,
        method,
        type: type === 'subscription' ? 'Abonnement' : 'Don',
        date: new Date().toLocaleString('fr-FR'),
        adminUrl: `${window.location.origin}/admin?tab=premium`,
        transactionId: transId
      });

      // 4. Success Message to User
      setActiveNotification({ 
        message: "Merci ! Votre paiement est en cours de vérification. Il sera validé manuellement par un administrateur sous peu.", 
        type: 'success' 
      });
      setTimeout(() => setActiveNotification(null), 5000);

      if (type === 'subscription') {
        setShowPremiumModal(false);
      } else {
        setDonationSuccess(true);
      }
    } catch (error) {
      console.error("[App] Confirmation payment error:", error);
      setActiveNotification({ message: "Erreur lors de la confirmation. Veuillez réessayer.", type: 'urgent' });
    }
  };

  const handleUpgradePremium = async (method: string, transId?: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }
    
    await handleConfirmPayment(siteSettings.premiumprice, method, 'subscription', transId);
    setShowPremiumModal(false);
  };

  const handleBookmarkArticle = async (articleId: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }

    const isBookmarked = !userBookmarkedArticles.has(articleId);
    
    try {
      await api.bookmarkArticle(articleId);
      
      setUserBookmarkedArticles(prev => {
        const next = new Set(prev);
        if (isBookmarked) next.add(articleId);
        else next.delete(articleId);
        return next;
      });

    if (isBookmarked) {
      setActiveNotification("Article enregistré dans vos favoris !");
      awardPoints(10);
    }
    } catch (error) {
      console.error("Bookmark article error:", error);
    }
  };

  const handleFollowAuthor = async (authorName: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }

    const isFollowing = !userFollowedAuthors.has(authorName);
    try {
      await api.followAuthor(authorName, currentUser.uid, isFollowing);
      setUserFollowedAuthors(prev => {
        const next = new Set(prev);
        if (isFollowing) next.add(authorName);
        else next.delete(authorName);
        return next;
      });
      if (isFollowing) awardPoints(15);
    } catch (error) {
      console.error("Follow author error:", error);
    }
  };

  const handleFollowCategory = async (category: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }

    const isFollowing = !userFollowedCategories.has(category);
    try {
      await api.followCategory(category, currentUser.uid, isFollowing);
      setUserFollowedCategories(prev => {
        const next = new Set(prev);
        if (isFollowing) next.add(category);
        else next.delete(category);
        return next;
      });
      if (isFollowing) awardPoints(10);
    } catch (error) {
      console.error("Follow category error:", error);
    }
  };

  const handleSavePreferences = async (interests: string[]) => {
    setUserInterests(interests);
    if (!currentUser) {
      setShowPreferenceModal(false);
      setActiveNotification({ message: "Préférences enregistrées localement. Connectez-vous pour les synchroniser.", type: 'info' });
      return;
    }
    try {
      await api.updateUserProfile(currentUser.uid, {
        followedcategories: Array.from(userFollowedCategories),
        interests: interests
      });
      setShowPreferenceModal(false);
      setActiveNotification({ message: "Préférences mises à jour !", type: 'success' });
    } catch (error) {
      console.error(error);
      setShowPreferenceModal(false);
      setActiveNotification({ message: "Erreur lors de la mise à jour", type: 'urgent' });
    }
  };

  const awardPoints = async (amount: number) => {
    if (!currentUser) return;
    try {
      const newPoints = userPoints + amount;
      await api.updateUserPoints(currentUser.uid, newPoints);
      setUserPoints(newPoints);
      
      // Check for badges
      const newBadges = [...userBadges];
      if (newPoints >= 100 && !newBadges.includes('Explorateur')) newBadges.push('Explorateur');
      if (newPoints >= 500 && !newBadges.includes('Passionné')) newBadges.push('Passionné');
      if (newPoints >= 1000 && !newBadges.includes('Ambassadeur')) newBadges.push('Ambassadeur');
      
      if (newBadges.length > userBadges.length) {
        await api.updateUserBadges(currentUser.uid, newBadges);
        setUserBadges(newBadges);
        setActiveNotification({ message: "Nouveau badge débloqué !", type: 'success' });
      }
    } catch (error) {
      console.error("Award points error:", error);
    }
  };

  const handleShareArticle = (article: Article, platform?: 'twitter' | 'facebook' | 'whatsapp') => {
    const url = window.location.href; // In real app, this would be the specific article URL
    const text = `Découvrez cet article sur Akwaba Info : ${article.title}`;
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else {
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.excerpt,
          url: url,
        }).catch(err => console.error("Error sharing:", err));
      } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(url);
        setActiveNotification("Lien copié dans le presse-papier !");
      }
    }
  };

  const handleAddComment = async (articleId: string, parentCommentId?: string) => {
    if (!newCommentText.trim() || (!commentAuthorName.trim() && !currentUser)) {
      if (!currentUser) handleUserLogin();
      return;
    }
    
    const author = currentUser?.displayname || commentAuthorName;
    const newComment: Comment = {
      id: Date.now().toString(),
      userid: currentUser?.uid,
      userphoto: currentUser?.photourl,
      username: author,
      date: new Date().toISOString(),
      content: newCommentText,
      likes: 0,
      likedby: [],
      articleid: articleId,
      parentid: parentCommentId,
      isadmin: isAdminAuthenticated
    };

    try {
      await api.saveComment(newComment);
      
      setArticleComments(prev => {
        const currentComments = [...(prev[articleId] || [])];
        
        if (parentCommentId && parentCommentId !== 'mock') {
          // Parent comment replies are not used as per the requirement of FLAT comments
          return { ...prev, [articleId]: [newComment, ...currentComments] };
        }

        return { ...prev, [articleId]: [newComment, ...currentComments] };
      });

      setNewCommentText('');
      setReplyingTo(null);
      setActiveNotification("Votre message a été publié !");
    } catch (error) {
      console.error("Error adding comment:", error);
      setActiveNotification("Erreur lors de la publication.");
    }
  };

  const handleLikeArticle = async (articleId: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }

    const isLiked = !userLikedArticles.has(articleId);
    
    try {
      await api.likeArticle(articleId);
      
      setUserLikedArticles(prev => {
        const next = new Set(prev);
        if (isLiked) next.add(articleId);
        else next.delete(articleId);
        return next;
      });

      // Update local article likes count
      setAdminArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, likes: (a.likes || 0) + (isLiked ? 1 : -1) } : a
      ));

      if (isLiked) {
        setActiveNotification("Vous avez aimé cet article !");
      }
    } catch (error) {
      console.error("Like article error:", error);
    }
  };

  const handleLikeComment = async (articleId: string, commentId: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }

    const commentPath = articleComments[articleId] || [];
    const target = commentPath.find(c => c.id === commentId);
    if (!target) return;

    const isLiked = !target.likedby?.includes(currentUser.uid);
    
    try {
      await api.likeComment(commentId);
      
      setArticleComments(prev => {
        const updateLikes = (comments: Comment[]): Comment[] => {
          return comments.map(c => {
            if (c.id === commentId) {
              const likedby = isLiked 
                ? [...(c.likedby || []), currentUser.uid] 
                : (c.likedby || []).filter(id => id !== currentUser.uid);
              return { ...c, likes: (c.likes || 0) + (isLiked ? 1 : -1), likedby };
            }
            return c;
          });
        };
        return { ...prev, [articleId]: updateLikes(prev[articleId] || []) };
      });
    } catch (error) {
      console.error("Like comment error:", error);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }
    try {
      await api.reportComment(commentId);
      setActiveNotification("Le commentaire a été signalé à l'administration.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    try {
      await api.subscribeToNewsletter(newsletterEmail);
      setActiveNotification({ 
        message: "Merci ! Vous êtes maintenant inscrit. Veuillez vérifier votre boîte mail (pensez aux spams).", 
        type: 'success' 
      });
      setNewsletterEmail('');
    } catch (error: any) {
      console.error("Newsletter error detail:", error);
      const msg = error.message || "Une erreur est survenue lors de l'inscription.";
      alert(msg);
    }
  };

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setShowCookieBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const notifConsent = localStorage.getItem('notification-consent');
    if (!notifConsent) {
      const timer = setTimeout(() => {}, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNotificationConsent = (accepted: boolean) => {
    localStorage.setItem('notification-consent', accepted ? 'accepted' : 'declined');
  };

  const handleCookieConsent = (accepted: boolean) => {
    localStorage.setItem('cookie-consent', accepted ? 'accepted' : 'declined');
    setShowCookieBanner(false);
  };

  useEffect(() => {
    if (isCloudLoaded) {
      // Group comments by articleId
      const mapping: Record<string, Comment[]> = {};
      if (Array.isArray(allComments)) {
        allComments.forEach(c => {
          if (!mapping[c.articleid]) mapping[c.articleid] = [];
          mapping[c.articleid].push(c);
        });
      }
      setArticleComments(mapping);
    }
  }, [allComments, isCloudLoaded]);

  useEffect(() => {
    if (isCloudLoaded && Array.isArray(adminArticles) && adminArticles.length > 0) {
      const likesMap: Record<string, number> = {};
      adminArticles.forEach(a => {
        likesMap[a.id] = a.likes || 0;
      });
      setArticleLikes(likesMap);
    }
  }, [adminArticles, isCloudLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Keep splash a bit longer for the "welcome" effect
      setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('akwaba_splash_shown', 'true');
      }, 1000);
    }, 2000);
    
    // Extreme safety
    const forceExit = setTimeout(() => {
      setShowSplash(false);
      setIsLoading(false);
      setIsAuthChecked(true);
      setIsCloudLoaded(true);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(forceExit);
    };
  }, []);

   const categories = siteSettings.categories || ['À la une', 'Politique', 'Économie', 'Science', 'Santé', 'Culture', 'Sport'];
 
  const visibleArticles = isAdminAuthenticated 
    ? adminArticles 
    : adminArticles.filter(a => {
        const isPublished = a.status === 'published';
        const isNotScheduled = !a.scheduledat || new Date(a.scheduledat) <= new Date();
        return isPublished && isNotScheduled;
      });

  const visibleEvents = isAdminAuthenticated 
    ? adminEvents 
    : adminEvents.filter(e => {
        const isPublished = e.status === 'published';
        const isNotScheduled = !e.scheduledat || new Date(e.scheduledat) <= new Date();
        return isPublished && isNotScheduled;
      });

  const filteredArticles = useMemo(() => {
    let base = activeCategory === 'À la une' 
      ? visibleArticles 
      : visibleArticles.filter(a => a.category === activeCategory);

    // Filter by followed categories if on "À la une" and user has preferences
    if (activeCategory === 'À la une' && currentUser && userFollowedCategories.size > 0) {
      // Sort: Followed categories first, then others
      return [...base].sort((a, b) => {
        const aFollowed = userFollowedCategories.has(a.category);
        const bFollowed = userFollowedCategories.has(b.category);
        if (aFollowed && !bFollowed) return -1;
        if (!aFollowed && bFollowed) return 1;
        return 0;
      });
    }

    return base;
  }, [activeCategory, visibleArticles, currentUser, userFollowedCategories]);

  const handleUserLogout = async () => {
    try {
      await api.logout();
      setCurrentView('home');
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleUserLogin = () => {
    setShowLoginModal(true);
  };

  const handleAuthSuccess = async (user: UserProfile) => {
    try {
      const isBlocked = await api.isBlocked(user.uid);
      if (isBlocked) {
        alert("Votre compte a été suspendu par un administrateur.");
        await api.logout();
        return;
      }
    } catch (error) {
       console.error("Auth check error:", error);
    }

    setCurrentUser(user);
    setShowLoginModal(false);
    setActiveNotification(`Bienvenue, ${user.displayname || 'Utilisateur'}`);
    
    // Auto redirect to profile if starting from some specific views
    if (currentView === 'admin-login') {
      navigateTo('admin');
    }
  };

  const [visibleArticlesCount, setVisibleArticlesCount] = useState(15);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleArticlesCount(15);
  }, [activeCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleArticlesCount < filteredArticles.length) {
          setVisibleArticlesCount(prev => prev + 4);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [visibleArticlesCount, filteredArticles.length]);

  const displayedArticles = filteredArticles.slice(0, visibleArticlesCount);

  const [visibleSearchCount, setVisibleSearchCount] = useState(4);
  const searchLoadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleSearchCount(4);
  }, [searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleSearchCount(prev => prev + 4);
        }
      },
      { threshold: 0.1 }
    );

    if (searchLoadingRef.current) {
      observer.observe(searchLoadingRef.current);
    }

    return () => observer.disconnect();
  }, [visibleSearchCount]);

  const searchResults = visibleArticles.filter(a => {
    const query = searchQuery.toLowerCase();
    const titleMatch = (a.title || '').toLowerCase().includes(query);
    const excerptMatch = (a.excerpt || '').toLowerCase().includes(query);
    const contentMatch = (a.content || '').toLowerCase().includes(query);
    const tagsMatch = a.tags?.some(t => t.toLowerCase().includes(query));
    
    return titleMatch || excerptMatch || contentMatch || tagsMatch;
  });

  const displayedSearchResults = searchResults.slice(0, visibleSearchCount);

  const handleArticleClick = async (article: Article) => {
    if (!article) return;
    setSelectedArticle(article);
    navigate(`/article/${article.slug || article.id}`);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
    
    // Increment views
    if (article.id) {
      try {
        await api.incrementArticleViews(article.id);
        if (currentUser) {
          await api.addToReadingHistory(currentUser.uid, article.id);
        }
      } catch (e) {
        console.warn("View counter error", e);
      }
    }
  };

  const handleAuthorClick = (authorName: string) => {
    const author = MOCK_AUTHORS.find(a => a.name === authorName);
    if (author) {
      setSelectedAuthor(author);
      navigate('/auteurs');
      setIsMenuOpen(false);
      window.scrollTo(0, 0);
    } else {
       // Fallback author if not found in mock
       const fallbackAuthor: Author = {
         id: `author-${Date.now()}`,
         name: authorName,
         role: authorName.includes('Rédaction') ? 'Rédaction' : 'Journaliste',
         bio: `${authorName} est un contributeur passionné par l'actualité africaine chez Akwaba Info.`,
         image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`,
         socials: {},
         specialties: ['Actualité']
       };
       setSelectedAuthor(fallbackAuthor);
       navigate('/auteurs');
       setIsMenuOpen(false);
       window.scrollTo(0, 0);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    navigate(`/evenement/${event.slug || event.id}`);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleCultureClick = (post: CulturePost) => {
    setSelectedCulturePost(post);
    navigate(`/culture/${post.slug || post.id}`);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
    // Silent update for views
    api.saveCulturePost({ ...post, views: (post.views || 0) + 1 }).catch(() => {});
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    navigate('/');
    setSelectedArticle(null);
    setSelectedAuthor(null);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const navigateTo = (view: typeof currentView) => {
    switch(view) {
      case 'home': navigate('/'); break;
      case 'article': if (selectedArticle) navigate(`/article/${selectedArticle.slug || selectedArticle.id}`); break;
      case 'search': navigate('/recherche'); break;
      case 'donate': navigate('/donate'); break;
      case 'about': navigate('/a-propos'); break;
      case 'contact': navigate('/contact'); break;
      case 'webtv': navigate('/webtv'); break;
      case 'profile': navigate('/profil'); break;
      case 'classifieds': navigate('/annonces'); break;
      case 'all-events': navigate('/agenda'); break;
      case 'admin': navigate('/admin'); break;
      case 'authors': navigate('/auteurs'); break;
      case 'all-culture': navigate('/culture'); break;
      case 'live-blog': navigate('/live'); break;
      default: navigate('/');
    }
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('email') && window.location.pathname.includes('/unsubscribe')) {
       navigate('/unsubscribe' + window.location.search);
    }
    // Handle home redirect if needed
  }, []);

  const handleLogoClick = () => {
    const newCount = adminClickCount + 1;
    if (newCount >= 5) {
      setShowAdminLoginModal(true);
      setAdminClickCount(0);
    } else {
      setAdminClickCount(newCount);
      goHome();
    }
  };

  const goHome = () => {
    setActiveCategory('À la une');
    navigate('/');
    setSelectedArticle(null);
    setSelectedEvent(null);
    setSelectedAuthor(null);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const FLASH_NEWS = siteSettings.flashnews 
    ? siteSettings.flashnews.split(';').filter(n => n.trim().length > 0)
    : [
        "Côte d'Ivoire : Lancement d'un nouveau programme de soutien aux startups technologiques à Abidjan.",
        "Économie : La ZLECAf annonce une progression record des échanges intra-africains pour le premier trimestre.",
        "Sport : Les préparatifs de la prochaine CAN avancent à grands pas, inspection des stades terminée.",
        "Culture : Le festival des musiques urbaines d'Anoumabo (FEMUA) dévoile sa programmation internationale.",
        "Monde : Sommet extraordinaire de l'Union Africaine sur la sécurité alimentaire prévu le mois prochain."
      ];

  const trendingArticles = [...adminArticles]
    .filter(article => {
      const articleDate = new Date(article.date);
      const now = new Date();
      const diffInHours = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
      return diffInHours <= 48; // Last 48 hours
    })
    .sort((a, b) => {
      const likesA = (a.likes || 0) + (articleLikes[a.id] || 0);
      const likesB = (b.likes || 0) + (articleLikes[b.id] || 0);
      const commentsA = (a.commentscount || 0) + (articleComments[a.id]?.length || 0);
      const commentsB = (b.commentscount || 0) + (articleComments[b.id]?.length || 0);
      
      const scoreA = (a.views || 0) + likesA * 2 + commentsA * 5;
      const scoreB = (b.views || 0) + likesB * 2 + commentsB * 5;
      return scoreB - scoreA;
    })
    .slice(0, 6);

  const personalizedArticles = useMemo(() => {
    if (!currentUser || userFollowedCategories.size === 0) return [];
    return visibleArticles
      .filter(a => userFollowedCategories.has(a.category))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [currentUser, userFollowedCategories, visibleArticles]);

  const [showTopNotice, setShowTopNotice] = useState(true);

  if (siteSettings.maintenancemode && !isAdminAuthenticated && currentView !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
        <MonitorOff size={64} className="text-slate-300 animate-pulse" />
        <h1 className="text-4xl font-black italic">Site en Maintenance</h1>
        <p className="max-w-md text-slate-500 font-medium leading-relaxed">Nous effectuons actuellement des mises à jour techniques pour améliorer votre expérience. Akwaba Info sera bientôt de retour.</p>
        <button onClick={() => navigate('/admin')} className="text-xs font-bold text-slate-300 hover:text-slate-900 transition-colors uppercase tracking-widest">Administration</button>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showTopNotice && (
          <TopNotice 
            message="Suivez l'actualité en temps réel sur Akwaba Info - Le direct est disponible !" 
            onClose={() => setShowTopNotice(false)} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      <AdminLoginModal 
        isOpen={showAdminLoginModal} 
        onClose={() => setShowAdminLoginModal(false)} 
        onSuccess={(user) => {
          setShowAdminLoginModal(false);
          setIsAdminAuthenticated(true);
          safeStorage.set('akwaba_is_admin', 'true');
          setCurrentUser(user);
          navigate('/admin');
        }}
      />

      <AnimatePresence>
        {showPreferenceModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreferenceModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <PreferenceSelector
                availableCategories={categories}
                selectedCategories={Array.from(userFollowedCategories)}
                categoryIcons={siteSettings?.categories_icons}
                initialInterests={userInterests}
                onToggle={(cat) => handleFollowCategory(cat)}
                onSave={handleSavePreferences}
                onClose={() => setShowPreferenceModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClassifiedsModal && (
          <PostClassifiedModal 
            onClose={() => setShowClassifiedsModal(false)}
            onPost={handlePostClassified}
          />
        )}
      </AnimatePresence>

      {/* Urgent Banner */}
      {siteSettings.urgentbanneractive && siteSettings.urgentbannertext && (
        <div className="bg-red-600 text-white overflow-hidden py-3 text-xs font-black uppercase tracking-widest sticky top-0 z-[100] shadow-xl">
           <motion.div 
             animate={{ x: [0, -1000] }}
             transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
             className="whitespace-nowrap flex gap-20 items-center justify-center"
           >
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentbannertext}</div>
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentbannertext}</div>
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentbannertext}</div>
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentbannertext}</div>
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentbannertext}</div>
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentbannertext}</div>
           </motion.div>
        </div>
      )}

      <div className={cn(
        "min-h-screen transition-colors duration-300 african-pattern relative bg-[#F5F1EB] text-slate-900",
        (currentView === 'admin' || currentView === 'admin-login') ? "pb-0" : "pb-16 lg:pb-0"
      )}>
        {!['admin', 'admin-login'].includes(currentView) && <PulseSidebar />}
      {!['admin', 'admin-login'].includes(currentView) && <FlashInfo articles={FLASH_NEWS} />}
      
      {/* Active Notification Toast */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-24 right-6 z-[1000] max-w-sm w-full"
          >
            <div className={cn(
              "text-white p-6 rounded-3xl shadow-2xl flex gap-4 items-start border-4 border-white/20",
              (typeof activeNotification === 'object' && activeNotification.type === 'urgent') ? "bg-red-600" : 
              (typeof activeNotification === 'object' && activeNotification.type === 'info') ? "bg-primary" : "bg-emerald-600"
            )}>
              <div className="p-2 bg-white/20 rounded-xl shrink-0">
                {(typeof activeNotification === 'object' && activeNotification.type === 'urgent') ? <AlertTriangle size={24} /> :
                 (typeof activeNotification === 'object' && activeNotification.type === 'info') ? <Bell size={24} /> : <CheckCircle size={24} />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80">
                  {typeof activeNotification === 'object' ? (
                    activeNotification.type === 'success' ? 'Confirmation' : 
                    activeNotification.type === 'urgent' ? 'Alerte Urgente' : 
                    activeNotification.type === 'info' ? 'Information' : 'Confirmation'
                  ) : 'Confirmation'}
                </div>
                <p className="text-sm font-bold leading-tight">
                  {typeof activeNotification === 'string' ? activeNotification : activeNotification.message}
                </p>
              </div>
              <button onClick={() => setActiveNotification(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support Chat Widget */}
      <SupportChatWidget user={currentUser} isDarkMode={false} />

      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {showCookieBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-[400px] z-[120]"
          >
            <div className={cn(
              "p-6 rounded-3xl shadow-2xl border flex flex-col gap-4 bg-white border-slate-200"
            )}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Eye size={20} />
                </div>
                <h3 className="font-display font-bold text-lg">Respect de votre vie privée</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et vous proposer des contenus adaptés.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCookieConsent(true)}
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  Accepter tout
                </button>
                <button
                  onClick={() => handleCookieConsent(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Refuser
                </button>
              </div>
              <button 
                onClick={() => navigateTo('cookies')}
                className="text-[10px] text-slate-400 hover:text-primary transition-colors text-center uppercase font-bold tracking-widest"
              >
                En savoir plus sur notre politique
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Progress Bar */}
      {currentView === 'article' && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-emerald-400 to-primary origin-left z-[110] shadow-[0_2px_15px_rgba(31,164,99,0.6)]"
          style={{ scaleX }}
        />
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={cn(
              "fixed inset-0 z-[100] p-6 lg:hidden flex flex-col overflow-y-auto scroll-smooth bg-white"
            )}
          >
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col items-center gap-4 w-full">
                <img 
                  src="https://raw.githubusercontent.com/Akwabanews/Sources/main/images/2DB685A1-EE6B-478E-B70B-58F490D2948A.jpeg" 
                  alt="Akwaba Info Logo" 
                  className="w-32 h-32 object-contain rounded-3xl shadow-lg border border-slate-100"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-2xl font-black">MENU</h2>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-900">
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>
            <nav className="flex flex-col gap-6">
              {isAdminAuthenticated && (
                <button 
                  id="mobile-admin-dash-btn"
                  onClick={() => { navigateTo('admin'); setIsMenuOpen(false); }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-3xl mb-2 bg-primary/5 text-primary",
                    currentView === 'admin' && "ring-2 ring-primary"
                  )}
                >
                  <LayoutDashboard size={24} />
                  <span className="font-bold">Dashboard Admin</span>
                </button>
              )}

              {currentUser ? (
                <>
                  <div 
                    onClick={() => { navigateTo('profile'); setIsMenuOpen(false); }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-3xl mb-2 cursor-pointer bg-slate-50",
                      currentView === 'profile' && "ring-2 ring-primary"
                    )}
                  >
                    <div className="relative">
                      <img 
                        src={currentUser.photourl || `https://ui-avatars.com/api/?name=${currentUser.displayname || 'User'}`} 
                        className="w-12 h-12 rounded-full border-2 border-primary object-cover aspect-square"
                        referrerPolicy="no-referrer"
                      />
                      {isAdminAuthenticated && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                          <Check size={10} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800 truncate max-w-[150px]">
                        {currentUser.displayname || 'Utilisateur'}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-primary">Voir mon profil</div>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      await api.logout();
                      navigateTo('home');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors text-[10px] font-black uppercase tracking-widest mb-4 border border-red-100"
                  >
                    <LogOut size={16} /> Se déconnecter
                  </button>
                </>
              ) : (
                <button 
                  data-login-btn
                  onClick={handleUserLogin} 
                  className="flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-3xl font-bold shadow-lg shadow-primary/20"
                >
                  <User size={24} /> Se connecter / S'ouvrir
                </button>
              )}

              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={cn(
                    "text-2xl font-black text-left transition-colors",
                    activeCategory === cat && currentView === 'home' ? "text-primary" : "text-slate-400"
                  )}
                >
                  {siteSettings?.categories_icons?.[cat] || '📰'} {cat}
                </button>
              ))}
              <hr className="border-slate-100 my-2" />
              <button onClick={() => navigateTo('live-blog')} className="text-lg font-bold text-left text-red-600 flex items-center gap-2 group">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> Direct (Live)
              </button>
              <button onClick={() => navigateTo('classifieds')} className="text-lg font-bold text-left text-slate-800 flex items-center gap-2 group">
                <Copy size={24} className="text-slate-400 group-hover:text-primary transition-colors" /> Petites Annonces
              </button>
              <button onClick={() => navigateTo('webtv')} className="text-lg font-bold text-left text-primary flex items-center gap-2 group">
                <Youtube size={24} className="group-hover:scale-110 transition-transform" /> Web TV
              </button>
              <button onClick={() => navigateTo('all-events')} className="text-lg font-bold text-left text-slate-800 flex items-center gap-2 group">
                <Calendar size={24} className="text-slate-400 group-hover:text-amber-500 transition-colors" /> Agenda Culturel
              </button>
              <hr className="border-slate-100 my-2" />
              <button onClick={() => navigateTo('about')} className="text-lg font-bold text-left text-slate-500">À propos</button>
              <button onClick={() => navigateTo('contact')} className="text-lg font-bold text-left text-slate-500">Contact</button>
              <button onClick={() => navigateTo('donate')} className="text-lg font-bold text-left text-primary">Soutenir le journal</button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Navbar */}
      {!['admin', 'admin-login'].includes(currentView) && (
      <header className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        "bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm"
      )}>
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all"
            >
              <Menu size={24} />
            </button>
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img 
                src="https://raw.githubusercontent.com/Akwabanews/Sources/main/images/2DB685A1-EE6B-478E-B70B-58F490D2948A.jpeg" 
                className="w-10 h-10 md:w-14 md:h-14 rounded-xl border border-slate-100 p-1 object-contain transition-transform group-hover:scale-110" 
                alt="Logo" 
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-black italic tracking-tighter leading-none uppercase">
                  <span className="text-[#000000]">AKWABA</span> <span className="text-[#1FA463]">INFO</span>
                </h1>
                <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-0.5">L’info du monde en un clic</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-2 py-1 mx-8 max-w-xl flex-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all group">
            <Search size={18} className="text-slate-500 ml-2 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher un article, un auteur..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && navigateTo('search')}
              className="bg-transparent border-none outline-none px-3 py-2 text-sm w-full font-bold placeholder:text-slate-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={14} />
              </button>
            )}
            <kbd className="hidden md:inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg text-slate-500 font-bold ml-2 shadow-sm">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <WeatherWidget />
            
            <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />
            
            {currentUser && (
               <div className="flex items-center gap-1 md:gap-2">
                 {isAdminAuthenticated && (
                   <button 
                     id="desktop-admin-dash-btn"
                     onClick={() => navigateTo('admin')}
                     className={cn(
                       "p-2 md:p-3 rounded-full transition-all group",
                       currentView === 'admin' ? "bg-primary text-white" : "hover:bg-primary/10 text-primary"
                     )}
                     title="Tableau de bord Admin"
                   >
                     <LayoutDashboard size={20} className="md:w-[22px] md:h-[22px]" />
                   </button>
                 )}
                 <div className="relative">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                      className={cn(
                        "p-2 md:p-3 rounded-full transition-all relative group",
                        showNotificationCenter ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-slate-100 text-slate-500"
                      )}
                    >
                      <Bell size={20} className="md:w-[22px] md:h-[22px]" />
                      {unreadNotifsCount > 0 && (
                        <span className="absolute top-1 md:top-2 right-1 md:right-2 w-3.5 h-3.5 md:w-4 md:h-4 bg-red-500 text-white text-[7px] md:text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                          {unreadNotifsCount}
                        </span>
                      )}
                    </motion.button>
                    <AnimatePresence>
                      {showNotificationCenter && (
                        <NotificationCenter 
                          notifications={notifications}
                          onClose={() => setShowNotificationCenter(false)}
                          onMarkRead={handleMarkNotificationAsRead}
                          onNavigate={(link) => {
                            if (link.startsWith('/admin')) {
                              const url = new URL(link, window.location.origin);
                              const tab = url.searchParams.get('tab');
                              if (tab) setAdminActiveTab(tab);
                              navigateTo('admin');
                            } else {
                              const article = adminArticles.find(a => a.id === link || a.slug === link);
                              if (article) handleArticleClick(article);
                            }
                            setShowNotificationCenter(false);
                          }}
                        />
                      )}
                    </AnimatePresence>
                 </div>
               </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-1 md:gap-2">
                <div onClick={() => navigateTo('profile')} className="relative group cursor-pointer" title="Mon Profil">
                  <img 
                    src={currentUser.photourl || `https://ui-avatars.com/api/?name=${currentUser.displayname || 'User'}`} 
                    alt="User Profile" 
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-colors object-cover aspect-square",
                      currentView === 'profile' ? "border-primary" : "border-primary/20 hover:border-primary"
                    )}
                    referrerPolicy="no-referrer"
                  />
                  {isAdminAuthenticated ? (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                      <Check size={10} className="md:w-3 md:h-3" strokeWidth={4} />
                    </div>
                  ) : (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-white" />
                  )}
                </div>
                <button 
                  onClick={handleUserLogout}
                  className="hidden sm:flex p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                  title="Déconnexion"
                >
                  <LogOut size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            ) : (
              <button 
                data-login-btn
                onClick={handleUserLogin}
                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 font-bold text-sm"
              >
                <User size={20} />
                <span className="hidden md:inline">Connexion</span>
              </button>
            )}

            <button 
              id="header-donate-btn"
              onClick={() => navigateTo('donate')}
              className="hidden md:flex bg-primary text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              Soutenir
            </button>
          </div>
        </div>
      </header>
      )}

      <main className={cn(
        (currentView === 'admin' || currentView === 'admin-login') 
          ? "w-full" 
          : "max-w-7xl mx-auto px-4 py-6 md:py-10 pb-28 lg:pb-10"
      )}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12 py-10"
            >
              <ArticleSkeleton variant="hero" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
              </div>
            </motion.div>
          ) : currentView === 'home' ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              {/* Category Tabs Mobile */}
              <div className="lg:hidden flex flex-nowrap gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 touch-pan-x scroll-smooth">
                {categories.map(cat => (
                  <motion.button
                    key={cat}
                    id={`cat-tab-${cat}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleCategoryClick(cat);
                      document.getElementById(`cat-tab-${cat}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shrink-0 shadow-sm flex items-center gap-2 border",
                      activeCategory === cat 
                        ? "bg-primary text-white shadow-primary/20 border-primary" 
                        : "bg-white text-slate-500 border-slate-200"
                    )}
                  >
                    <span className="text-sm">{siteSettings?.categories_icons?.[cat] || '📰'}</span>
                    <span>{cat}</span>
                  </motion.button>
                ))}
              </div>

              {/* Hero Section */}
              {activeCategory === 'À la une' && visibleArticles.length > 0 && (
                <section className="space-y-10">
                  <HeroSlideshow 
                    articles={visibleArticles.slice(0, 3)} 
                    onArticleClick={handleArticleClick} 
                    onBookmark={handleBookmarkArticle}
                    bookmarkedIds={userBookmarkedArticles}
                    onAuthorClick={handleAuthorClick}
                    categoryIcons={siteSettings?.categories_icons}
                  />

                  {currentUser && userFollowedCategories.size === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6"
                    >
                      <div className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                        <Star size={32} fill="currentColor" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-black italic tracking-tight uppercase">Personnalisez votre Journal</h3>
                        <p className="text-slate-500 font-medium">Choisissez vos thématiques favorites pour un flux qui vous ressemble.</p>
                      </div>
                      <button 
                        onClick={() => setShowPreferenceModal(true)}
                        className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                      >
                        Configurer
                      </button>
                    </motion.div>
                  )}

                  {personalizedArticles.length > 0 && (
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                            <Star size={20} fill="currentColor" />
                          </div>
                          <h2 className="font-black text-2xl md:text-3xl uppercase tracking-tighter italic">Pour Vous</h2>
                        </div>
                        <button 
                          onClick={() => setShowPreferenceModal(true)}
                          className="text-primary text-xs font-bold uppercase tracking-widest hover:underline"
                        >
                          Modifier mes préférences
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {personalizedArticles?.map(article => (
                          <ArticleCard 
                            key={article.id}
                            article={article}
                            variant="vertical"
                            onClick={() => handleArticleClick(article)}
                            onBookmark={handleBookmarkArticle}
                            isBookmarked={userBookmarkedArticles.has(article.id)}
                            onAuthorClick={handleAuthorClick}
                          />
                        ))}
                      </div>
                      <hr className="border-slate-100 mt-10" />
                    </section>
                  )}

                  <hr className="border-slate-100 my-10" />
                  
                  <TrendingSection 
                    articles={trendingArticles}
                    onArticleClick={handleArticleClick}
                    onBookmark={handleBookmarkArticle}
                    bookmarkedIds={userBookmarkedArticles}
                    onAuthorClick={handleAuthorClick}
                    categoryIcons={siteSettings?.categories_icons}
                    onSeeMore={() => handleCategoryClick('Articles')}
                  />

                  <hr className="border-slate-100 my-10" />
                  <GoogleAd className="my-10" label="Annonce à la une" />
                </section>
              )}

              {/* Grid Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="font-black text-2xl md:text-3xl uppercase tracking-tighter italic">
                      {activeCategory === 'À la une' ? <span className="text-red-600">Dernières Nouvelles</span> : activeCategory}
                    </h2>
                  </div>
                  {activeCategory !== 'À la une' && (
                    <button 
                      onClick={() => handleFollowCategory(activeCategory)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all",
                        userFollowedCategories.has(activeCategory)
                          ? "bg-slate-200 text-slate-500"
                          : "bg-primary text-white shadow-lg shadow-primary/20"
                      )}
                    >
                      {userFollowedCategories.has(activeCategory) ? <Check size={14} /> : <Plus size={14} />}
                      {userFollowedCategories.has(activeCategory) ? 'Suivi' : 'Suivre'}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedArticles.length > 0 ? displayedArticles.map((article) => (
                    <ArticleCard 
                      key={article.id} 
                      article={article} 
                      variant="vertical"
                      onClick={() => handleArticleClick(article)} 
                      onBookmark={handleBookmarkArticle}
                      isBookmarked={userBookmarkedArticles.has(article.id)}
                      onAuthorClick={handleAuthorClick}
                    />
                  )) : (
                    <div className="col-span-full py-20 text-center text-slate-400 italic">
                      Aucun article disponible dans cette catégorie pour le moment.
                    </div>
                  )}
                </div>
                
                {/* Infinite Scroll Sentinel */}
                {displayedArticles.length < filteredArticles.length && (
                  <div ref={loadingRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-10">
                    <ArticleSkeleton />
                    <ArticleSkeleton className="hidden md:block" />
                    <ArticleSkeleton className="hidden lg:block" />
                    <ArticleSkeleton className="hidden xl:block" />
                  </div>
                )}
                
                {activePoll && (
                  <div className="max-w-2xl mx-auto pt-10">
                    <PollCard poll={activePoll} onVote={handleVote} hasVoted={hasVoted} />
                  </div>
                )}
                
                {displayedArticles.length >= filteredArticles.length && filteredArticles.length > 0 && (
                  <div className="flex justify-center pt-8">
                    <button 
                      id="home-search-more-btn"
                      onClick={() => navigateTo('search')}
                      className="group flex items-center gap-3 bg-white border-2 border-slate-100 px-8 py-4 rounded-2xl font-black text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md"
                    >
                      RECHERCHER D'AUTRES SUJETS
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </section>

              {activeCategory === 'À la une' && (
                <>
                  <CultureSection 
                    posts={adminCulturePosts.filter(p => p.status === 'published')} 
                    onPostClick={handleCultureClick}
                    onSeeAll={() => navigateTo('all-culture')}
                  />
                  
                  <div className="my-16 py-12 border-y border-slate-100 African-pattern rounded-[40px] px-6 md:px-10">
                    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-10">
                      <div className="flex-1 space-y-6">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-tight leading-none text-slate-900">
                          Rejoignez notre <span className="text-primary italic">Newsletter</span> quotidienne
                        </h3>
                        <p className="text-slate-500 font-medium leading-relaxed text-lg max-w-xl">
                          Chaque matin, recevez une sélection rigoureuse de l'actualité qui façonne l'Afrique et le monde. L'info essentielle, sans le bruit.
                        </p>
                      </div>
                      <div className="w-full lg:w-[450px] shrink-0">
                        <NewsletterSignup 
                          variant="sidebar" 
                          className="bg-white/80 backdrop-blur-md shadow-2xl border-primary/20" 
                          onPrivacyClick={() => navigateTo('privacy')}
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100 my-10" />
                </>
              )}

              <EventSection 
                events={visibleEvents} 
                onEventClick={handleEventClick} 
                onSeeAll={() => navigateTo('all-events')}
              />
            </motion.div>
          ) : currentView === 'culture-detail' && selectedCulturePost ? (
            <CultureDetailView 
              post={selectedCulturePost} 
              onBack={goHome} 
            />
          ) : currentView === 'all-culture' ? (
            <div className="space-y-12">
               <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-2">
                      <ArrowLeft size={14} /> Retour à l'accueil
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">Histoire & <span className="text-primary">Culture</span></h1>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {adminCulturePosts.filter(p => p.status === 'published').map(post => (
                    <CultureCard key={post.id} post={post} onClick={handleCultureClick} />
                  ))}
               </div>
            </div>
          ) : currentView === 'event' && selectedEvent ? (
            <EventDetailView 
              event={selectedEvent} 
              onBack={goHome} 
            />
          ) : currentView === 'live-blog' ? (
            <LiveBlogView 
              blog={activeLiveBlog || (Array.isArray(liveBlogs) && liveBlogs.length > 0 ? liveBlogs[0] : {
                id: 'mock-live',
                title: "Dernière Actualité",
                updates: [],
                status: 'live',
              } as LiveBlog)}
              onBack={goHome} 
            />
          ) : currentView === 'classifieds' ? (
            <ClassifiedsView 
              classifieds={classifieds || []}
              onBack={goHome} 
              onAddClick={() => {
                if(!currentUser) handleUserLogin();
                else setShowClassifiedsModal(true);
              }}
            />
          ) : currentView === 'authors' ? (
            <AuthorsList 
              authors={MOCK_AUTHORS} 
              onAuthorClick={handleAuthorClick} 
              onBack={goHome} 
            />
          ) : currentView === 'unsubscribe' ? (
            <UnsubscribeView onHome={goHome} />
          ) : currentView === 'author-profile' && selectedAuthor ? (
            <AuthorProfile 
              author={selectedAuthor} 
              articles={adminArticles.filter(a => a.author === selectedAuthor.name)} 
              onBack={goHome} 
              onArticleClick={handleArticleClick}
              isFollowing={false}
              onFollow={() => {}}
            />
          ) : currentView === 'article' ? (
            selectedArticle ? (
              <motion.div 
                key="article"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <ShareFloatingButtons title={selectedArticle.title} url={window.location.href} />
                
                <div className="space-y-4 text-center">
                  <Breadcrumb items={[
                    { label: "Accueil", onClick: goHome },
                    { label: selectedArticle?.category || 'Actualité', onClick: () => handleCategoryClick(selectedArticle?.category) },
                    { label: "Lecture", active: true }
                  ]} />
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-6xl font-display font-black leading-[1.1] tracking-tight text-slate-900 drop-shadow-sm"
                  >
                    {selectedArticle?.title || 'Sans titre'}
                  </motion.h1>
                  <div className="w-24 h-2 bg-primary mx-auto rounded-full mt-6 mb-8" />
                {selectedArticle?.tags && Array.isArray(selectedArticle.tags) && selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {selectedArticle.tags.map((tag: any) => (
                      <button 
                        key={String(tag)}
                        onClick={() => {
                          setSearchQuery(String(tag));
                          navigateTo('search');
                        }}
                        className="text-[10px] font-black bg-slate-100 text-slate-700 hover:bg-primary/10 hover:text-primary px-3 py-1 rounded-full uppercase tracking-widest transition-colors border border-slate-200"
                      >
                        #{String(tag)}
                      </button>
                    ))}
                  </div>
                )}
                  <div className="flex items-center justify-center gap-4 text-sm text-slate-700 font-sans">
                    <div 
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={() => handleAuthorClick(selectedArticle?.author || 'Rédaction')}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                        {(selectedArticle?.author || 'R')[0]}
                      </div>
                      <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{selectedArticle?.author || 'Rédaction'}</span>
                      {selectedArticle?.authorrole && (
                        <span className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded font-bold uppercase ml-1">
                          {selectedArticle.authorrole}
                        </span>
                      )}
                    </div>
                    <span>•</span>
                  <span>{safeFormatDate(selectedArticle?.date, 'dd MMMM yyyy')}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {selectedArticle?.readingtime || '5 min'}</span>
                </div>
              </div>

              {selectedArticle.audiourl && (
                <div className="bg-slate-900 rounded-[30px] p-6 text-white shadow-2xl border border-white/10 mt-8 mb-4">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary/20 rounded-2xl text-primary animate-pulse">
                      <TrendingUp size={24} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Audio / Podcast</p>
                      <h4 className="font-bold text-sm italic">Écouter la version audio</h4>
                      <audio controls className="w-full h-8 mt-2 accent-primary">
                        <source src={selectedArticle.audiourl} type="audio/mpeg" />
                        Navigateur non supporté
                      </audio>
                    </div>
                  </div>
                </div>
              )}

              {(selectedArticle?.image || selectedArticle?.video) && (
                <div className="space-y-6">
                  {selectedArticle?.video && getYoutubeId(selectedArticle.video) && (
                    <div className="w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900/5 aspect-video">
                      <iframe 
                        src={`https://www.youtube.com/embed/${getYoutubeId(selectedArticle?.video)}`}
                        title={selectedArticle?.title || 'Video'}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    </div>
                  )}
                  {selectedArticle?.image && (
                    <div className="w-full rounded-[40px] overflow-hidden shadow-2xl bg-white border-8 border-white">
                      <div className="relative">
                        <img 
                          id={`article-detail-img-${selectedArticle?.id}`}
                          src={optimizeImage(selectedArticle.image, 1200)} 
                          alt={selectedArticle?.title || ''}
                          className="w-full h-auto max-h-[85vh] object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      {selectedArticle?.imagecredit && (
                        <div className="px-8 py-4 bg-slate-900 text-[10px] font-black text-white/60 uppercase tracking-[0.2em] flex items-center gap-3 relative z-10">
                          <div className="p-1.5 bg-white/10 rounded-lg">
                            <Camera size={14} />
                          </div>
                          <span>Crédit image : {selectedArticle.imagecredit}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
                <div className="space-y-8">
                    <div className="flex flex-col gap-6">
                      <AudioPlayer article={selectedArticle} />
                      {selectedArticle.gallery && selectedArticle.gallery.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                           {selectedArticle.gallery.map((img, i) => (
                             <div 
                               key={i} 
                               className="aspect-square rounded-2xl overflow-hidden cursor-zoom-in group relative" 
                               onClick={() => window.open(img, '_blank')}
                             >
                               <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <Search size={24} className="text-white" />
                               </div>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  <GoogleAd className="mb-8" />
                  
                  <div className="markdown-body text-base md:text-lg leading-relaxed relative text-slate-900">
                    {(() => {
                      if (!selectedArticle) return null;
                      
                      const isPremiumArticle = selectedArticle.ispremium;
                      const hasAccess = !isPremiumArticle || (currentUser && (currentUser.ispremium || currentUser.role === 'admin' || currentUser.role === 'editor'));
                      
                      const currentContent = typeof selectedArticle.content === 'string' ? selectedArticle.content : '';
                      if (!currentContent) return <p className="text-slate-400 italic">Cet article n'a pas de contenu.</p>;
                      
                      const paragraphs = currentContent.split('\n\n').filter(p => p.trim().length > 0);

                      if (!hasAccess && paragraphs.length > 2) {
                        return (
                          <div className="space-y-6">
                            <ReactMarkdown>{paragraphs.slice(0, 2).join('\n\n')}</ReactMarkdown>
                            <div className="relative z-10 py-20 px-8 rounded-[40px] bg-slate-900 text-white overflow-hidden text-center space-y-6 shadow-2xl">
                               <div className="absolute inset-0 opacity-10 safari-blur pointer-events-none">
                                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/20 to-transparent" />
                               </div>
                               <Award size={48} className="mx-auto text-amber-500" />
                               <h4 className="text-2xl font-black italic tracking-tighter">CONTENU RÉSERVÉ AUX MEMBRES</h4>
                               <p className="text-slate-400 text-sm max-w-xs mx-auto">Devenez membre Premium pour lire la suite de cet article exclusif et nos analyses approfondies.</p>
                               <button 
                                 onClick={() => {
                                   if (!currentUser) {
                                     setShowLoginModal(true);
                                     setActiveNotification({ message: "Veuillez vous connecter pour vous abonner.", type: 'info' });
                                   } else {
                                     setShowPremiumModal(true);
                                   }
                                 }}
                                 className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                               >
                                 S'ABONNER POUR LIRE LA SUITE
                               </button>
                               <div className="pt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Akwaba Premium • {siteSettings?.premiumprice || 5000} XOF / mois</div>
                            </div>
                          </div>
                        );
                      }

                      if (paragraphs.length > 3) {
                        return (
                          <>
                            <ReactMarkdown>{paragraphs.slice(0, 2).join('\n\n')}</ReactMarkdown>
                            <GoogleAd className="my-10" label="Publicité contextuelle" />
                            <ReactMarkdown>{paragraphs.slice(2, 4).join('\n\n')}</ReactMarkdown>
                            {adminArticles && adminArticles.length > 0 && (
                              <ReadAlso 
                                currentArticle={selectedArticle} 
                                articles={adminArticles} 
                                onArticleClick={handleArticleClick} 
                                onAuthorClick={handleAuthorClick}
                              />
                            )}
                            <ReactMarkdown>{paragraphs.slice(4).join('\n\n')}</ReactMarkdown>
                          </>
                        );
                      }
                      
                      return (
                        <>
                          <ReactMarkdown>{currentContent}</ReactMarkdown>
                          {adminArticles && adminArticles.length > 0 && (
                            <ReadAlso 
                              currentArticle={selectedArticle} 
                              articles={adminArticles} 
                              onArticleClick={handleArticleClick} 
                              onAuthorClick={handleAuthorClick}
                            />
                          )}
                        </>
                      );
                    })()}

                    <RecommendedForYou 
                      articles={adminArticles} 
                      history={[]} 
                      onArticleClick={handleArticleClick} 
                      onAuthorClick={handleAuthorClick}
                    />
                  </div>

                  <GoogleAd className="my-8" label="Publicité ciblée" />

                  {selectedArticle.source && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-dotted border-slate-200">
                      <Globe size={14} /> Source : {selectedArticle.source}
                    </div>
                  )}

                  {/* Engagement / Réactions */}
                  <div className="mt-12 pt-8 border-t border-slate-100 space-y-8">
                    <div className="flex flex-col items-center gap-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Quelle est votre réaction ?</h4>
                      <div className="flex flex-wrap justify-center gap-4">
                        {[
                          { icon: '🔥', label: 'Feu', key: 'fire' },
                          { icon: '👏', label: 'Bravo', key: 'bravo' },
                          { icon: '😮', label: 'Surpris', key: 'wow' },
                          { icon: '😢', label: 'Triste', key: 'sad' },
                          { icon: '🤨', label: 'Doute', key: 'think' }
                        ].map((react) => (
                          <button 
                            key={react.key}
                            onClick={() => {
                              const currentReactions = selectedArticle.reactions || {};
                              const newValue = (currentReactions[react.key] || 0) + 1;
                              handleSaveArticle({
                                ...selectedArticle,
                                reactions: { ...currentReactions, [react.key]: newValue }
                              });
                              setActiveNotification(`Vous avez réagi avec ${react.icon} !`);
                            }}
                            className="bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all flex flex-col items-center gap-1 group"
                          >
                            <span className="text-2xl group-hover:scale-125 transition-transform">{react.icon}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase">{selectedArticle.reactions?.[react.key] || 0}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6 pt-8">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => handleLikeArticle(selectedArticle.id)}
                          className={cn(
                            "flex items-center gap-2 transition-colors group",
                            userLikedArticles.has(selectedArticle.id) ? "text-red-500" : "text-slate-500 hover:text-primary"
                          )}
                        >
                          <div className={cn(
                            "p-3 rounded-full transition-colors",
                            userLikedArticles.has(selectedArticle.id) ? "bg-red-50" : "bg-slate-100 group-hover:bg-primary/10"
                          )}>
                            <Heart size={24} fill={userLikedArticles.has(selectedArticle.id) ? "currentColor" : "none"} />
                          </div>
                          <span className="font-bold">{(selectedArticle.likes || 0) + (articleLikes[selectedArticle.id] || 0)}</span>
                        </button>
                        <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
                          <div className="p-3 rounded-full bg-slate-100 group-hover:bg-primary/10 transition-colors">
                            <MessageSquare size={24} />
                          </div>
                          <span className="font-bold">{(selectedArticle.commentscount || 0) + (articleComments[selectedArticle.id]?.length || 0)}</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Partager l'article</span>
                        <div className="flex gap-3">
                          {[
                            { icon: Twitter, color: 'bg-[#1DA1F2]', action: () => handleShareArticle(selectedArticle, 'twitter'), label: 'Twitter' },
                            { icon: Facebook, color: 'bg-[#4267B2]', action: () => handleShareArticle(selectedArticle, 'facebook'), label: 'Facebook' },
                            { icon: Share2, color: 'bg-primary', action: () => handleShareArticle(selectedArticle), label: 'Partage' }
                          ].map((social, i) => (
                            <motion.button 
                              key={i}
                              whileHover={{ scale: 1.1, rotate: i % 2 === 0 ? 5 : -5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={social.action}
                              className={cn(
                                "w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg transition-all",
                                social.color
                              )}
                              title={social.label}
                            >
                              <social.icon size={20} />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <GoogleAd className="mt-12" label="Annonce sponsorisée" />

                  {/* Comments */}
                  <div className="mt-12 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black">Commentaires</h3>
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold uppercase">
                        Modération active
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      Les commentaires sont modérés avant publication.
                    </p>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                      {/* Recursive Comment Component */}
                      {(() => {
                        const renderComments = (comments: Comment[], isReply = false) => {
                          const topLevelComments = comments.filter(c => !c.parentid);
                          const replies = comments.filter(c => c.parentid);

                          const processComment = (comment: Comment, depth = 0) => {
                            const commentReplies = replies.filter(r => r.parentid === comment.id);
                            
                            return (
                              <div key={comment.id} className={cn("space-y-4", depth > 0 && "ml-4 md:ml-10 mt-4 border-l-2 border-slate-100 pl-4")}>
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex gap-4"
                                >
                                  <div className={cn(
                                    "w-12 h-12 md:w-16 md:h-16 rounded-3xl flex items-center justify-center font-black shrink-0 shadow-inner",
                                    depth > 0 ? "bg-slate-100 text-slate-400 text-sm" : "bg-primary/10 text-primary text-xl"
                                  )}>
                                    {(comment.username || 'U')[0].toUpperCase()}
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-sm">{comment.username}</span>
                                        {comment.isadmin && (
                                          <div className="bg-blue-500 text-white rounded-full p-0.5 shadow-sm">
                                            <Check size={10} strokeWidth={4} />
                                          </div>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-400">
                                        {safeFormatDate(comment.date, 'dd MMM yyyy HH:mm')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                                    <div className="flex items-center gap-4">
                                      <button 
                                        onClick={() => {
                                          setReplyingTo({ commentId: comment.id, username: comment.username });
                                          document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="text-xs font-bold text-primary hover:underline"
                                      >
                                        Répondre
                                      </button>
                                      <button 
                                        onClick={() => handleLikeComment(selectedArticle.id, comment.id)}
                                        className="text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-red-500 transition-colors"
                                      >
                                        <Heart size={12} fill={comment.likedby?.includes(currentUser?.uid || '') ? "currentColor" : "none"} /> {comment.likes}
                                      </button>
                                      <button 
                                        onClick={() => handleReportComment(comment.id)}
                                        className="text-[10px] font-bold text-slate-300 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-1"
                                      >
                                        <Flag size={10} /> Signaler
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                                {commentReplies.length > 0 && (
                                  <div className="space-y-4">
                                    {commentReplies.map(reply => processComment(reply, depth + 1))}
                                  </div>
                                )}
                              </div>
                            );
                          };

                          if (topLevelComments.length === 0) {
                            return (
                              <div className="flex gap-4 opacity-50">
                                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold">Jean-Marc Koffi</span>
                                    <span className="text-xs text-slate-400">Exemple</span>
                                  </div>
                                  <p className="text-slate-600">Analyse très pertinente. Le potentiel est là, il manque juste l'accompagnement politique.</p>
                                </div>
                              </div>
                            );
                          }

                          return topLevelComments.map(comment => processComment(comment));
                        };
                        return renderComments(articleComments[selectedArticle.id] || []);
                      })()}

                      {/* Comment Form */}
                      <div id="comment-form" className="pt-6 border-t border-slate-100 space-y-4">
                        {replyingTo && (
                          <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-500">
                              En réponse à <span className="font-bold text-primary">@{replyingTo.username}</span>
                            </span>
                            <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
                              <X size={14} />
                            </button>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Votre nom..." 
                              value={commentAuthorName}
                              onChange={(e) => setCommentAuthorName(e.target.value)}
                              className="w-full bg-slate-50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 items-end">
                          <textarea 
                            placeholder={replyingTo ? `Répondre à ${replyingTo.username}...` : "Ajouter un commentaire..."}
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            rows={2}
                            className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                          />
                          <button 
                            onClick={() => handleAddComment(selectedArticle.id, replyingTo?.commentId)}
                            disabled={!newCommentText.trim() || !commentAuthorName.trim()}
                            className="bg-primary text-white p-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                          >
                            <Send size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="hidden lg:block space-y-8">
                  <div className="sticky top-24 space-y-8">
                    <ExchangeRatesWidget rates={exchangeRates} />
                    
                    {(selectedArticle.category === 'En Direct' || selectedArticle.tags?.includes('Live')) && (
                      <LiveChat articleId={selectedArticle.id} user={currentUser} isAdmin={isAdminAuthenticated} />
                    )}

                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                         <Award size={20} />
                         <span className="font-black text-xs uppercase tracking-widest">Auteur</span>
                      </div>
                      <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => handleAuthorClick(selectedArticle.author)}
                      >
                         <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                           {(selectedArticle.author || 'R')[0]}
                         </div>
                         <div className="flex-1">
                            <div className="font-bold text-sm group-hover:text-primary transition-colors">{selectedArticle.author}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedArticle.authorrole || 'Journaliste'}</div>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleFollowAuthor(selectedArticle.author)}
                        className={cn(
                          "w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                          userFollowedAuthors.has(selectedArticle.author)
                            ? "bg-slate-200 text-slate-500"
                            : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105"
                        )}
                      >
                        {userFollowedAuthors.has(selectedArticle.author) ? 'Suivi' : 'S\'abonner'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">Articles Similaires</h4>
                      {adminArticles.filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category).slice(0, 3).map(article => (
                        <div key={article.id} onClick={() => handleArticleClick(article)} className="cursor-pointer group flex gap-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                            <img src={optimizeImage(article.image || '', 300)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs leading-tight group-hover:text-primary transition-colors line-clamp-2">{article.title}</h5>
                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">{safeFormatDate(article.date, 'dd MMM yyyy')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {activePoll && <PollCard poll={activePoll} onVote={handleVote} hasVoted={hasVoted} />}
                    <GoogleAd className="h-[250px]" label="Annonce" />
                  </div>
                </aside>
              </div>

              <RelatedArticles 
                currentArticle={selectedArticle}
                articles={adminArticles}
                onArticleClick={handleArticleClick}
                onBookmark={handleBookmarkArticle}
                bookmarkedIds={userBookmarkedArticles}
                onAuthorClick={handleAuthorClick}
                categoryIcons={siteSettings?.categories_icons}
              />

              <ArticleCarousel 
                articles={visibleArticles.filter(a => a.id !== selectedArticle.id)}
                onArticleClick={handleArticleClick}
                onBookmark={handleBookmarkArticle}
                bookmarkedIds={userBookmarkedArticles}
                onAuthorClick={handleAuthorClick}
                categoryIcons={siteSettings?.categories_icons}
              />
            </motion.div>
          ) : (
            <div className="space-y-12 py-10 max-w-4xl mx-auto">
              <ArticleSkeleton variant="hero" />
              <div className="space-y-6">
                <Skeleton className="w-1/3 h-8 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ArticleSkeleton />
                  <ArticleSkeleton />
                </div>
              </div>
              <button 
                onClick={goHome} 
                className="mx-auto block bg-slate-100 text-slate-600 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
              >
                Retour à l'accueil
              </button>
            </div>
          )
        ) : currentView === 'search' ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl mx-auto space-y-12 py-6"
            >
              <div className="space-y-6">
                <button 
                  onClick={goHome} 
                  className="group inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest pl-4"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                  Accueil
                </button>
                
                {/* Minimal Glass Bar */}
                <div className="relative z-50 px-4">
                  <div className="bg-white/80 backdrop-blur-2xl rounded-full p-2 shadow-2xl shadow-slate-200 border border-white flex items-center gap-2 pr-6">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                      <Search size={22} strokeWidth={3} />
                    </div>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Rechercher un scoop, un pays, un auteur..." 
                      className="flex-1 bg-transparent text-xl font-bold outline-none text-slate-900 px-2 placeholder:text-slate-300"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearching(true);
                        setTimeout(() => setIsSearching(false), 300);
                      }}
                    />
                    <div className="flex items-center gap-2">
                       {searchQuery && (
                         <button 
                          onClick={() => setSearchQuery('')} 
                          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                         >
                           <X size={16} strokeWidth={3} />
                         </button>
                       )}
                       <div className="w-px h-8 bg-slate-100 mx-2" />
                       <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-full transition-all text-[10px] font-black uppercase tracking-widest",
                          showFilters ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        <Filter size={14} />
                        Filtres
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pill-shaped Advanced Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -20, height: 0 }}
                      className="px-4 overflow-hidden"
                    >
                      <div className="bg-slate-50 rounded-[2.5rem] p-8 mt-4 space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Categories Pills */}
                            <div className="space-y-4">
                               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Catégories</h4>
                               <div className="flex flex-wrap gap-2">
                                  {['Tout', ...(siteSettings?.categories || [])].slice(0, 8).map(c => (
                                    <button
                                      key={c}
                                      onClick={() => setFilterCategory(c === 'Tout' ? '' : c)}
                                      className={cn(
                                        "px-4 py-2 rounded-full text-[10px] font-bold transition-all whitespace-nowrap",
                                        (filterCategory === c || (c === 'Tout' && !filterCategory)) 
                                          ? "bg-slate-900 text-white shadow-lg" 
                                          : "bg-white border border-slate-100 text-slate-500 hover:bg-slate-100"
                                      )}
                                    >
                                      {c}
                                    </button>
                                  ))}
                               </div>
                            </div>

                            {/* Authors Pills */}
                            <div className="space-y-4">
                               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Auteurs Populaires</h4>
                               <div className="flex flex-wrap gap-2">
                                  {['Tout', 'Koffi', 'Diallo', 'Ouattara', 'Yeboah'].map(a => (
                                    <button
                                      key={a}
                                      onClick={() => setFilterAuthor(a === 'Tout' ? '' : a)}
                                      className={cn(
                                        "px-4 py-2 rounded-full text-[10px] font-bold transition-all whitespace-nowrap",
                                        (filterAuthor === a || (a === 'Tout' && !filterAuthor)) 
                                          ? "bg-primary text-white shadow-lg" 
                                          : "bg-white border border-slate-100 text-slate-500 hover:bg-slate-100"
                                      )}
                                    >
                                      {a}
                                    </button>
                                  ))}
                               </div>
                            </div>

                            {/* Date Toggles */}
                            <div className="space-y-4">
                               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Date de publication</h4>
                               <div className="flex flex-col gap-2">
                                  {[
                                    { id: '', label: 'Toutes les dates' },
                                    { id: 'today', label: 'Aujourd\'hui' },
                                    { id: 'week', label: 'Cette semaine' },
                                    { id: 'month', label: 'Ce mois' }
                                  ].map(d => (
                                    <button
                                      key={d.id}
                                      onClick={() => setFilterDate(d.id)}
                                      className={cn(
                                        "w-full px-6 py-3 rounded-2xl text-left text-[10px] font-black uppercase transition-all flex items-center justify-between",
                                        filterDate === d.id ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                                      )}
                                    >
                                      {d.label}
                                      {filterDate === d.id && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                                    </button>
                                  ))}
                               </div>
                            </div>
                         </div>
                         <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                            <p className="text-[9px] font-bold text-slate-400 italic">Combinez les filtres pour affiner vos résultats.</p>
                            <button 
                              onClick={() => {
                                setFilterCategory('');
                                setFilterAuthor('');
                                setFilterDate('');
                                setShowFilters(false);
                              }}
                              className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                            >
                              Réinitialiser tout
                            </button>
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {searchQuery ? (
                <div className="space-y-8 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                           <h2 className="text-3xl font-black italic tracking-tighter">Résultats</h2>
                           {isSearching ? (
                             <div className="flex gap-1">
                                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                             </div>
                           ) : (
                             <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black">
                               {searchResults.length}
                             </span>
                           )}
                        </div>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Pour "{searchQuery}"</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-full">
                       <button 
                        onClick={() => setSearchViewMode('grid')}
                        className={cn("p-2.5 rounded-full transition-all", searchViewMode === 'grid' ? "bg-white text-slate-900 shadow-md" : "text-slate-400")}
                       >
                          <LayoutGrid size={18} />
                       </button>
                       <button 
                        onClick={() => setSearchViewMode('list')}
                        className={cn("p-2.5 rounded-full transition-all", searchViewMode === 'list' ? "bg-white text-slate-900 shadow-md" : "text-slate-400")}
                       >
                          <LayoutList size={18} />
                       </button>
                    </div>
                  </div>

                  <div className={cn(
                    "grid gap-8",
                    searchViewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                  )}>
                    {displayedSearchResults.map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        variant={searchViewMode === 'grid' ? 'vertical' : 'horizontal'} 
                        onClick={() => handleArticleClick(article)}
                        onBookmark={(id) => handleBookmarkArticle(id)}
                        isBookmarked={userBookmarkedArticles.has(article.id)}
                        onAuthorClick={handleAuthorClick}
                      />
                    ))}
                  </div>

                  {displayedSearchResults.length < searchResults.length && (
                    <div ref={searchLoadingRef} className={cn(
                        "grid gap-8 py-10",
                        searchViewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    )}>
                      <ArticleSkeleton variant={searchViewMode === 'grid' ? 'grid' : 'list'} />
                      <ArticleSkeleton variant={searchViewMode === 'grid' ? 'grid' : 'list'} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-12 px-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <HistoryIcon size={20} className="text-slate-300" />
                           <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Recherches Récentes</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['Can 2025', 'Politique Mali', 'Akwaba Africa', 'Élection CI'].map(q => (
                            <button 
                              key={q} 
                              onClick={() => setSearchQuery(q)}
                              className="px-5 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <TrendingUp size={20} className="text-primary" />
                           <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Tendances du moment</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['ZLECAf', 'Innovation Abidjan', 'Afrobeat 2026', 'Climat Afrique', 'Économie Numérique', 'Startups Tech'].map(tag => (
                            <button 
                              key={tag} 
                              onClick={() => setSearchQuery(tag)}
                              className="px-6 py-3 bg-primary/5 border border-primary/10 rounded-2xl text-xs font-black text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-50 rounded-[3rem] p-12 text-center space-y-6 border border-slate-100">
                     <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                        <Search size={32} className="text-slate-200" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-xl font-black italic">Plus de 50 000 articles</h4>
                        <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto">Découvrez l'Afrique comme vous ne l'avez jamais lue à travers nos archives exclusives.</p>
                     </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : currentView === 'profile' && currentUser ? (
            <UserProfileTabs 
              user={currentUser}
              onUpdate={async (updates) => {
                if (currentUser) {
                  await api.updateUserProfile(currentUser.uid, updates);
                  setCurrentUser({ ...currentUser, ...updates });
                }
              }}
              activityLogs={adminLogs}
              articles={adminArticles}
              onArticleClick={handleArticleClick}
              onBookmark={handleBookmarkArticle}
              bookmarkedIds={userBookmarkedArticles}
              categoryIcons={siteSettings?.categories_icons}
              playNotificationSound={playNotificationSound}
            />
          ) : currentView === 'donate' ? (
            <motion.div 
              key="donate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto py-12 px-4"
            >
              <div className="flex flex-col lg:flex-row gap-16 items-start">
                  {/* Left Column: Context & Goal */}
                  <div className="lg:w-1/2 space-y-12 lg:sticky lg:top-24">
                    <button 
                      onClick={goHome} 
                      className="group inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                      Retour à l'accueil
                    </button>

                    <div className="space-y-6">
                       <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                          Soutenez la <br/>
                          <span className="text-primary italic">Liberté</span> de <br/>
                          l'information.
                       </h2>
                       <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                          Akwaba Info est un média 100% indépendant. Chaque don nous permet de financer nos reporters sur le terrain et de maintenir notre plateforme sans publicité intrusive.
                       </p>
                    </div>

                    {/* Goal Progress Bento */}
                    <div className="bg-slate-50 rounded-[2.5rem] p-10 space-y-8 border border-slate-100">
                       <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Objectif du mois</h4>
                          <span className="text-primary font-black italic">75% atteint</span>
                       </div>
                       <div className="space-y-4">
                          <div className="h-6 bg-white rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-slate-100">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: '75%' }}
                               transition={{ duration: 1.5, ease: "circOut" }}
                               className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full shadow-lg shadow-primary/20 relative"
                             >
                                <div className="absolute inset-0 bg-white/20 African-pattern opacity-30" />
                             </motion.div>
                          </div>
                          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                             <span>0 FCFA</span>
                             <span className="text-slate-900">1 000 000 FCFA</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                             <TrendingUp size={20} />
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 leading-tight">PLUS DE 142 DONATEURS ONT DÉJÀ CONTRIBUÉ CE MOIS-CI.</p>
                       </div>
                    </div>
                  </div>

                  {/* Right Column: Donation Form Card */}
                  <div className="lg:w-1/2 w-full">
                    <AnimatePresence mode="wait">
                      {donationSuccess ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white rounded-[3.5rem] p-12 text-center shadow-2xl border border-slate-100 space-y-8 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 African-pattern opacity-5 pointer-events-none" />
                          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <Heart size={48} fill="currentColor" className="animate-pulse" />
                            <motion.div 
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} 
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="absolute inset-0 border-4 border-primary rounded-full" 
                            />
                          </div>
                          <div className="space-y-4">
                             <h2 className="text-4xl font-black italic tracking-tighter">Générosité Infinie.</h2>
                             <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                Votre contribution de <span className="font-bold text-slate-900">{selectedAmount} FCFA</span> a été enregistrée. Merci de faire partie de l'aventure Akwaba Info.
                             </p>
                          </div>
                          <div className="pt-8 space-y-4">
                             <button 
                               onClick={() => { setDonationSuccess(false); goHome(); }}
                               className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl"
                             >
                               Retour aux actualités
                             </button>
                             <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest italic">Un reçu vous sera envoyé par email</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="form"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-12"
                        >
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2rem] italic">Étape 1 : Le Montant</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {[5000, 10000, 25000, 50000, 100000].map(amount => (
                                <button 
                                  key={amount} 
                                  onClick={() => setSelectedAmount(amount.toString())}
                                  className={cn(
                                    "px-6 py-5 rounded-[2rem] text-sm font-black transition-all flex flex-col items-center gap-1",
                                    selectedAmount === amount.toString() 
                                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" 
                                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                  )}
                                >
                                  <span>{amount.toLocaleString()}</span>
                                  <span className="text-[8px] opacity-70">FCFA</span>
                                </button>
                              ))}
                              <div className="relative">
                                 <input 
                                    type="number" 
                                    placeholder="Autre..." 
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => setSelectedAmount(e.target.value)}
                                    className="w-full h-full bg-slate-50 border border-transparent rounded-[2rem] px-6 text-sm font-black outline-none focus:border-primary transition-all text-center placeholder:text-slate-300"
                                 />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2rem] italic">Étape 2 : Mode de Paiement</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Object.entries(siteSettings.activepaymentmethods || {}).filter(([_, active]) => active).map(([method]) => (
                                <button 
                                  key={method}
                                  onClick={() => setSelectedPayment(method)}
                                  className={cn(
                                    "group flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border-2 transition-all aspect-square",
                                    selectedPayment === method
                                      ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5"
                                      : "border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200"
                                  )}
                                >
                                  <div className="p-2 transition-transform group-hover:scale-110">
                                     {getPaymentIcon(method, selectedPayment === method)}
                                  </div>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-center">{getPaymentLabel(method)}</span>
                                </button>
                              ))}
                            </div>

                            <AnimatePresence>
                              {selectedPayment && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden pt-4"
                                >
                                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden group">
                                     <div className="absolute inset-0 African-pattern opacity-10 pointer-events-none" />
                                     <div className="text-center space-y-6 relative z-10">
                                        {(() => {
                                          const details = (() => {
                                            switch(selectedPayment) {
                                              case 'paypal': return siteSettings.paymentlinks?.paypal;
                                              case 'stripe': return siteSettings.paymentlinks?.stripe;
                                              case 'flutterwave': return siteSettings.paymentlinks?.flutterwave;
                                              case 'orangeMoney': return siteSettings.orangemoneynumber;
                                              case 'wave': return siteSettings.wavenumber;
                                              case 'mtn': return siteSettings.mtnmoneynumber;
                                              case 'moov': return siteSettings.moovmoneynumber;
                                              default: return "INSTRUCTIONS";
                                            }
                                          })();
                                          
                                          const isUrl = details?.toString().startsWith('http');
                                          
                                          if (isUrl) {
                                            return (
                                              <div className="space-y-6">
                                                <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Paiement Sécurisé via Portail</p>
                                                <a href={details} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all">
                                                  Ouvrir {getPaymentLabel(selectedPayment)} <ExternalLink size={14} />
                                                </a>
                                              </div>
                                            );
                                          }
                                          
                                          return (
                                            <div className="space-y-10">
                                              <div className="space-y-2">
                                                <p className="text-[9px] font-black uppercase text-primary tracking-[0.3em]">Numéro du Receveur</p>
                                                <p className="text-4xl font-black tracking-tighter italic">{details || "00 00 00 00"}</p>
                                              </div>
                                              <div className="space-y-4 text-left">
                                                 <label className="text-[9px] font-black uppercase text-white/40 tracking-widest px-1">ID de Transaction / Référence SMS</label>
                                                 <input 
                                                   type="text"
                                                   placeholder="Collez ici le code de confirmation..."
                                                   value={transactionId}
                                                   onChange={(e) => setTransactionId(e.target.value)}
                                                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-primary transition-all text-white placeholder:text-white/20"
                                                 />
                                              </div>
                                            </div>
                                          );
                                        })()}
                                     </div>
                                  </div>
                                  
                                  <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      if (!transactionId && !siteSettings.paymentlinks?.[selectedPayment as keyof typeof siteSettings.paymentlinks]?.toString().startsWith('http')) {
                                        alert("Veuillez entrer la référence de transaction.");
                                        return;
                                      }
                                      const amountVal = parseInt(selectedAmount) || 0;
                                      handleConfirmPayment(amountVal, selectedPayment, 'donation', transactionId).then(() => {
                                         confetti({
                                           particleCount: 150,
                                           spread: 70,
                                           origin: { y: 0.6 },
                                           colors: ['#1FA463', '#000000', '#FFCC00']
                                         });
                                         setDonationSuccess(true);
                                         setTransactionId('');
                                      });
                                    }}
                                    className="w-full mt-8 bg-primary text-white py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"
                                  >
                                    Finaliser mon Don
                                  </motion.button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          <div className="flex items-center gap-4 justify-center grayscale opacity-30 mt-10">
                             <Shield size={20} />
                             <Lock size={20} />
                             <span className="text-[8px] font-black uppercase tracking-widest">Sécurité 256-bit SSL</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
              </div>
            </motion.div>
          ) : currentView === 'webtv' ? (
            <motion.div 
              key="webtv"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
            <WebTVView videos={adminWebTV} onVideoClick={async (v) => {
              const mockArticle: Article = {
                  id: v.id,
                  title: v.title,
                  content: v.description,
                  video: v.videourl,
                  image: v.thumbnail,
                  category: v.category,
                  date: v.date,
                  author: "Web TV",
                  views: v.views,
                  likes: 0,
                  slug: v.id,
                  excerpt: v.description.substring(0, 100),
                  readingtime: "5 min",
                  status: 'published'
              };
              handleArticleClick(mockArticle);
            }} />
            </motion.div>
          ) : currentView === 'about' ? (
            <motion.div 
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto py-10 space-y-8"
            >
              <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                <ArrowLeft size={14} /> Retour à l'accueil
              </button>
              <h2 className="text-4xl font-black">À propos d'Akwaba Info</h2>
              <div className="markdown-body space-y-6">
                <ReactMarkdown>
                  {siteSettings.abouttext || "Akwaba Info est votre source de référence pour l'actualité en Afrique et dans le monde."}
                </ReactMarkdown>
              </div>
            </motion.div>
          ) : currentView === 'privacy' ? (
            <motion.div 
              key="privacy" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto py-10 space-y-8"
            >
              <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                <ArrowLeft size={14} /> Retour à l'accueil
              </button>
              <h2 className="text-4xl font-black">Politique de Confidentialité</h2>
              <div className="markdown-body">
                <ReactMarkdown>{`
## 1. Introduction  
Chez Akwaba Info, la protection de vos données personnelles est une priorité. Cette politique de confidentialité vise à vous informer de manière claire et transparente sur la manière dont nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre site.

## 2. Données collectées  
Nous collectons uniquement les informations nécessaires au bon fonctionnement de nos services, notamment :  
- Les données de navigation (adresse IP, type d’appareil, navigateur, pages consultées)  
- Les informations que vous fournissez volontairement (formulaire de contact, inscription à une newsletter, etc.)  

## 3. Utilisation des données  
Les données collectées sont utilisées pour :  
- Assurer le bon fonctionnement du site  
- Améliorer l’expérience utilisateur  
- Répondre à vos demandes et messages  
- Envoyer des informations ou actualités (si vous y avez consenti)

## 4. Cookies  
Notre site peut utiliser des cookies pour :  
- Faciliter votre navigation  
- Analyser l’audience et les performances du site  

Vous pouvez configurer votre navigateur pour refuser les cookies si vous le souhaitez.

## 5. Partage des données  
Vos données personnelles ne sont ni vendues ni louées. Elles peuvent être partagées uniquement avec des prestataires techniques nécessaires au fonctionnement du site, dans le respect de la confidentialité.

## 6. Sécurité  
Nous mettons en place des mesures de sécurité appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation.

## 7. Vos droits  
Conformément aux réglementations en vigueur, vous disposez des droits suivants :  
- Droit d’accès à vos données  
- Droit de rectification  
- Droit de suppression  
- Droit d’opposition au traitement de vos données  

Pour exercer ces droits, vous pouvez nous contacter.

## 8. Modifications  
Cette politique de confidentialité peut être mise à jour à tout moment. Nous vous recommandons de la consulter régulièrement.

## 9. Contact  
Pour toute question concernant cette politique ou vos données personnelles, vous pouvez nous contacter via les moyens disponibles sur notre site.

---

Dernière mise à jour : Avril 2026
`}</ReactMarkdown>
              </div>
            </motion.div>
          ) : currentView === 'terms' ? (
            <motion.div 
              key="terms" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto py-10 space-y-8"
            >
              <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                <ArrowLeft size={14} /> Retour à l'accueil
              </button>
              <h2 className="text-4xl font-black">Conditions Générales d’Utilisation (CGU)</h2>
              <div className="markdown-body">
                <ReactMarkdown>{`
## 1. Objet  
Les présentes Conditions Générales d’Utilisation régissent l’accès et l’utilisation du site Akwaba Info.

## 2. Accès au site  
Le site est accessible gratuitement à tout utilisateur disposant d’un accès à Internet. Tous les frais liés à l’accès (connexion, matériel, etc.) sont à la charge de l’utilisateur.

## 3. Contenu  
Les contenus publiés (articles, images, informations) sont fournis à titre informatif. Akwaba Info s’efforce de fournir des informations fiables, mais ne garantit pas leur exactitude ou leur mise à jour en temps réel.

## 4. Propriété intellectuelle  
Tous les contenus du site (textes, images, logo, etc.) sont protégés par les lois relatives à la propriété intellectuelle. Toute reproduction ou utilisation sans autorisation est interdite.

## 5. Responsabilité  
L’utilisateur est seul responsable de l’utilisation qu’il fait des informations disponibles sur le site.  
Akwaba Info ne pourra être tenu responsable en cas de dommages directs ou indirects liés à l’utilisation du site.

## 6. Comportement de l’utilisateur  
L’utilisateur s’engage à :  
- Ne pas utiliser le site à des fins illégales  
- Ne pas perturber le bon fonctionnement du site  
- Respecter les autres utilisateurs  

## 7. Liens externes  
Le site peut contenir des liens vers des sites externes. Akwaba Info n’est pas responsable du contenu de ces sites.

## 8. Modification des conditions  
Les présentes conditions peuvent être modifiées à tout moment. Les utilisateurs sont invités à les consulter régulièrement.

## 9. Droit applicable  
Les présentes conditions sont régies par les lois en vigueur dans le pays d’exploitation du site.

## 10. Contact  
Pour toute question concernant les conditions d’utilisation, vous pouvez nous contacter via les moyens disponibles sur le site.

---

Dernière mise à jour : Avril 2026
`}</ReactMarkdown>
              </div>
            </motion.div>
          ) : currentView === 'contact' ? (
            <motion.div 
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto py-10 space-y-12"
            >
              <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                <ArrowLeft size={14} /> Retour à l'accueil
              </button>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h2 className="text-4xl font-black">Contactez-nous</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Une question ? Une suggestion ? Ou vous souhaitez simplement nous dire Akwaba ? Notre équipe est à votre écoute.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <MapIcon size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Adresse</p>
                        <p className="font-bold">{siteSettings.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Smartphone size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Téléphone</p>
                        <p className="font-bold">{siteSettings.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Send size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</p>
                        <p className="font-bold">{siteSettings.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleContactSubmit} className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Nom complet</label>
                    <input 
                      type="text" 
                      required 
                      value={contactForm.name}
                      onChange={e => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                    <input 
                      type="email" 
                      required 
                      value={contactForm.email}
                      onChange={e => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none" 
                      placeholder="john@example.com" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Message</label>
                    <textarea 
                      required 
                      value={contactForm.message}
                      onChange={e => setContactForm({...contactForm, message: e.target.value})}
                      rows={4} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none" 
                      placeholder="Votre message..."
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/20">ENVOYER</button>
                </form>
              </div>
            </motion.div>
          ) : currentView === 'all-events' ? (
            <motion.div 
              key="all-events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto py-10 space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                    <ArrowLeft size={14} /> Retour à l'accueil
                  </button>
                  <h2 className="text-4xl font-black tracking-tighter">Agenda Complet</h2>
                  <p className="text-slate-500 mt-2">Tous les événements culturels et artistiques</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {MOCK_EVENTS.map((event) => (
                  <motion.div 
                    key={event.id}
                    id={`event-card-all-${event.id}`}
                    whileHover={{ y: -10 }}
                    onClick={() => handleEventClick(event)}
                    className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 cursor-pointer group"
                  >
                    <div className="relative overflow-hidden bg-slate-50">
                      {event.image && (
                        <img 
                          id={`event-card-img-all-${event.id}`}
                          src={optimizeImage(event.image, 800, 'contain')} 
                          alt={event.title}
                          className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-lg">
                          {event.category}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Calendar size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">{safeFormatDate(event.date, 'dd MMMM yyyy')}</span>
                      </div>
                      <h3 className="font-black text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Map size={14} />
                        <span className="text-xs font-bold">{event.location}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : currentView === 'cookies' ? (
            <motion.div 
              key="cookies" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto py-10 space-y-8"
            >
              <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                <ArrowLeft size={14} /> Retour à l'accueil
              </button>
              <h2 className="text-4xl font-black">Politique relative aux Cookies</h2>
              <div className="markdown-body">
                <ReactMarkdown>{`
## 1. Introduction  
Le site Akwaba Info utilise des cookies afin d’améliorer votre expérience de navigation et d’analyser l’utilisation du site.

## 2. Qu’est-ce qu’un cookie ?  
Un cookie est un petit fichier texte enregistré sur votre appareil (ordinateur, smartphone, tablette) lors de votre visite sur un site web. Il permet de reconnaître votre appareil et de mémoriser certaines informations.

## 3. Types de cookies utilisés  
Nous utilisons différents types de cookies :  
- Cookies essentiels : nécessaires au bon fonctionnement du site  
- Cookies analytiques : permettent de mesurer l’audience et comprendre l’utilisation du site  
- Cookies de préférence : mémorisent vos choix (langue, paramètres)

## 4. Gestion des cookies  
Vous pouvez à tout moment configurer votre navigateur pour :  
- Accepter tous les cookies  
- Refuser tous les cookies  
- Être informé lorsqu’un cookie est déposé  

Notez que le refus de certains cookies peut affecter le fonctionnement du site.

## 5. Durée de conservation  
Les cookies sont conservés pour une durée limitée, en fonction de leur type, et conformément aux réglementations en vigueur.

## 6. Modification de la politique  
Cette politique peut être modifiée à tout moment afin de rester conforme aux lois et aux évolutions du site.

---

Dernière mise à jour : Avril 2026
`}</ReactMarkdown>
              </div>
            </motion.div>
          ) : currentView === 'admin-login' ? (
            <AdminLogin 
              onLogin={handleAdminLogin} 
            />
          ) : currentView === 'admin' ? (
            !isAuthChecked ? (
              <SplashScreen />
            ) : isAdminAuthenticated ? (
              editingArticle ? (
                <AdminEditor 
                  type="article"
                  categories={siteSettings.categories}
                  data={editingArticle} 
                  onSave={handleSaveArticle} 
                  onCancel={() => setEditingArticle(null)} 
                />
              ) : editingEvent ? (
                <AdminEditor 
                  type="event"
                  categories={siteSettings.categories}
                  data={editingEvent} 
                  onSave={handleSaveEvent} 
                  onCancel={() => setEditingEvent(null)} 
                />
              ) : editingLiveBlog ? (
                <LiveBlogEditor 
                  blog={editingLiveBlog}
                  onSave={handleSaveLiveBlog}
                  onCancel={() => setEditingLiveBlog(null)}
                />
              ) : editingWebTV ? (
                <WebTVEditor 
                  video={editingWebTV}
                  categories={siteSettings.categories}
                  onSave={handleSaveWebTV}
                  onCancel={() => setEditingWebTV(null)}
                />
              ) : editingPoll ? (
                <PollEditor 
                  poll={editingPoll}
                  onSave={handleSavePoll}
                  onCancel={() => setEditingPoll(null)}
                />
              ) : editingClassified ? (
                <ClassifiedEditor 
                  classified={editingClassified}
                  onSave={handleSaveClassified}
                  onCancel={() => setEditingClassified(null)}
                />
              ) : editingCulturePost ? (
                <CulturePostEditor 
                  post={editingCulturePost}
                  onSave={handleSaveCulturePost}
                  onCancel={() => setEditingCulturePost(null)}
                />
              ) : editingAuthor ? (
                <AuthorEditor 
                  author={editingAuthor}
                  onSave={handleSaveAuthor}
                  onCancel={() => setEditingAuthor(null)}
                />
              ) : (
                <AdminDashboard 
                  articles={adminArticles}
                  events={adminEvents}
                  classifieds={classifieds}
                  comments={allComments}
                  subscribers={subscribers}
                  mediaLibrary={mediaLibrary}
                  settings={siteSettings}
                  polls={adminPolls}
                  liveBlogs={adminLiveBlogs}
                  webTV={adminWebTV}
                  initialTab={adminActiveTab}
                  onEditArticle={(a) => setEditingArticle(a)}
                  onEditEvent={(e) => setEditingEvent(e)}
                  onEditPoll={(p) => setEditingPoll(p)}
                  onEditLiveBlog={(l) => setEditingLiveBlog(l)}
                  onEditWebTV={(v) => setEditingWebTV(v)}
                  onEditClassified={(c) => setEditingClassified(c)}
                  onCreateArticle={() => setEditingArticle({ id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] } as any)}
                  onCreateEvent={() => setEditingEvent({ id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] } as any)}
                  onCreatePoll={() => setEditingPoll({ id: crypto.randomUUID(), startDate: new Date().toISOString().split('T')[0], options: [{id: '1', text: '', votes: 0}, {id: '2', text: '', votes: 0}], active: true } as any)}
                  onCreateLiveBlog={() => setEditingLiveBlog({ id: crypto.randomUUID(), title: '', updates: [], status: 'live', createdat: new Date().toISOString() } as any)}
                  onCreateWebTV={() => setEditingWebTV({ id: crypto.randomUUID(), title: '', description: '', videourl: '', thumbnail: '', category: 'Web TV', date: new Date().toISOString(), views: 0 } as any)}
                  onCreateClassified={() => setEditingClassified({ id: crypto.randomUUID(), title: '', description: '', category: 'divers', location: '', contact: '', date: new Date().toISOString(), status: 'active', userid: currentUser?.uid || 'admin', username: currentUser?.displayname || 'Admin' } as any)}
                  onDeleteArticle={handleDeleteArticle}
                  onDeleteEvent={handleDeleteEvent}
                  onDeletePoll={handleDeletePoll}
                  onDeleteLiveBlog={handleDeleteLiveBlog}
                  onDeleteWebTV={handleDeleteWebTV}
                  onDeleteClassified={handleDeleteClassified}
                  onDeleteComment={handleDeleteComment}
                  onDeleteSubscriber={handleDeleteSubscriber}
                  onDeleteMedia={handleDeleteMediaAsset}
                  onBlockUser={handleBlockUser}
                  onSaveSettings={handleSaveSettings}
                  onLogout={handleAdminLogout}
                  onSaveAuthor={handleSaveAuthor}
                  authors={adminAuthors}
                  onEditAuthor={(a) => setEditingAuthor(a)}
                  onCreateAuthor={() => setEditingAuthor({ id: crypto.randomUUID(), name: '', role: '', bio: '', image: '', socials: {}, specialties: [] })}
                  onDeleteAuthor={handleDeleteAuthor}
                  culturePosts={adminCulturePosts}
                  onEditCulturePost={(p) => setEditingCulturePost(p)}
                  onCreateCulturePost={() => setEditingCulturePost({ 
                    id: crypto.randomUUID(), 
                    title: '', 
                    excerpt: '', 
                    content: '', 
                    category: 'tradition',
                    author: currentUser?.displayname || 'Admin',
                    date: new Date().toISOString(),
                    views: 0,
                    likes: 0,
                    status: 'draft',
                    createdat: new Date().toISOString()
                  } as any)}
                  onDeleteCulturePost={handleDeleteCulturePost}
                  onValidateTransaction={handleValidateTransaction}
                  onGenerateCode={() => setShowExportModal(true)}
                  setActiveNotification={setActiveNotification}
                  stats={adminStats}
                  currentUser={currentUser}
                  activityLogs={adminLogs}
                />
              )
            ) : (
              <AdminLogin 
                onLogin={handleAdminLogin} 
              />
            )
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showExportModal && (
            <ExportModal 
              articles={adminArticles} 
              events={adminEvents}
              onClose={() => setShowExportModal(false)} 
            />
          )}
        </AnimatePresence>
      </main>

      {!['admin', 'admin-login'].includes(currentView) && (
        <Footer onNavigate={navigateTo} categories={categories} />
      )}

      {/* Mobile Bottom Nav */}
      {!['admin', 'admin-login'].includes(currentView) && (
      <nav className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 h-16 backdrop-blur-xl border-t flex items-center justify-around px-4 z-50 bg-white/90 border-slate-200"
      )}>
        <button onClick={goHome} className={cn("flex flex-col items-center gap-1", currentView === 'home' ? "text-primary" : "text-slate-500")}>
          <Home size={20} />
          <span className="text-[10px] font-black uppercase tracking-wider">Accueil</span>
        </button>
        <button onClick={() => navigateTo('search')} className={cn("flex flex-col items-center gap-1", currentView === 'search' ? "text-primary" : "text-slate-500")}>
          <Search size={20} />
          <span className="text-[10px] font-black uppercase tracking-wider">Recherche</span>
        </button>
        <button onClick={() => navigateTo('donate')} className={cn("flex flex-col items-center gap-1", currentView === 'donate' ? "text-primary" : "text-slate-500")}>
          <Heart size={20} />
          <span className="text-[10px] font-black uppercase tracking-wider">Dons</span>
        </button>
        <button onClick={() => navigateTo('profile')} className={cn("flex flex-col items-center gap-1", currentView === 'profile' ? "text-primary" : "text-slate-500")}>
          <User size={20} />
          <span className="text-[10px] font-black uppercase tracking-wider">Profil</span>
        </button>
      </nav>
      )}
      <AuthModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={handleAuthSuccess}
        setActiveNotification={setActiveNotification}
        isDarkMode={false}
      />
      <NewsletterModal delay={5000} onPrivacyClick={() => navigateTo('privacy')} />
      <AnimatePresence>
        {showPremiumModal && (
          <PremiumModal 
            onClose={() => {
              setShowPremiumModal(false);
              setPaymentInitiated(false);
            }} 
            onUpgrade={handleUpgradePremium}
            price={siteSettings.premiumprice}
            activeMethods={siteSettings.activepaymentmethods}
            settings={siteSettings}
            getPaymentIcon={getPaymentIcon}
            getPaymentLabel={getPaymentLabel}
          />
        )}
      </AnimatePresence>
    </div>
    </>
  );
}

const PremiumModal = ({ onClose, onUpgrade, price, activeMethods, settings, getPaymentIcon, getPaymentLabel }: { 
  onClose: () => void, 
  onUpgrade: (method: string, tid: string) => void,
  price: number,
  activeMethods: Record<string, boolean>,
  settings: SiteSettings,
  getPaymentIcon: (m: string, s: boolean) => React.ReactNode,
  getPaymentLabel: (m: string) => string
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');

  useEffect(() => {
    // Select first active method by default
    if (activeMethods) {
      const firstActive = Object.entries(activeMethods).find(([_, active]) => active)?.[0];
      if (firstActive) setSelectedMethod(firstActive);
    }
  }, [activeMethods]);

  const getPaymentDetails = (method: string) => {
    switch(method) {
      case 'paypal': return settings.paymentlinks?.paypal || (settings.paypalid ? `ID: ${settings.paypalid}` : null);
      case 'stripe': return settings.paymentlinks?.stripe || (settings.stripepublickey ? "Paiement par Carte" : null);
      case 'flutterwave': return settings.paymentlinks?.flutterwave || "Paiement via Flutterwave";
      case 'orangeMoney': return settings.orangemoneynumber ? `Transfert au ${settings.orangemoneynumber}` : null;
      case 'wave': return settings.wavenumber ? `Transfert au ${settings.wavenumber}` : null;
      case 'mtn': return settings.mtnmoneynumber ? `Transfert au ${settings.mtnmoneynumber}` : null;
      case 'moov': return settings.moovmoneynumber ? `Transfert au ${settings.moovmoneynumber}` : null;
      default: return settings.paymentlinks?.[method as keyof typeof settings.paymentlinks] || null;
    }
  };

  const paymentValue = getPaymentDetails(selectedMethod);
  const isUrl = paymentValue?.startsWith('http');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 z-50">
          <X size={24} />
        </button>

        <div className="md:w-2/5 relative overflow-hidden bg-slate-900 p-8 md:p-10 flex flex-col justify-end text-white shrink-0 min-h-[200px] md:min-h-full">
           <div className="absolute inset-0 african-pattern opacity-10" />
           <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20 mb-4 md:mb-6">
                 <TrendingUp size={28} className="md:hidden" />
                 <TrendingUp size={32} className="hidden md:block" />
              </div>
              <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter leading-none uppercase">Akwaba<br/>Premium</h2>
              <p className="text-slate-400 text-[10px] md:text-sm font-medium">L'information exclusive à portée de main.</p>
              
              <div className="pt-4 md:pt-6 space-y-2 md:space-y-3 hidden sm:block">
                 {[
                   "Articles & Investigations exclusifs",
                   "Web TV & Live Streaming illimité",
                   "Événements & Agenda VIP",
                   "Accès prioritaire aux petites annonces",
                   "Expérience sans publicité"
                 ].map((benefit, i) => (
                   <div key={i} className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-slate-300">
                     <CheckCircle size={10} className="text-primary md:hidden" />
                     <CheckCircle size={12} className="text-primary hidden md:block" />
                     {benefit}
                   </div>
                 ))}
              </div>

              <div className="pt-4 md:pt-8 border-t border-white/10 mt-4 md:mt-8">
                 <span className="text-xl md:text-3xl font-black">{price} XOF</span>
                 <span className="text-[10px] md:text-xs text-slate-500 font-bold ml-2">/ MOIS</span>
              </div>
           </div>
        </div>

        <div className="md:w-3/5 p-6 md:p-12 space-y-8 bg-white overflow-y-auto custom-scrollbar">
              {!paymentInitiated ? (
                <>
                  <div className="space-y-6">
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Choisir votre moyen de paiement</h3>
                     <div className="grid grid-cols-2 gap-3">
                        {Object.entries(activeMethods).filter(([_, active]) => active).map(([name]) => (
                          <button 
                            key={name}
                            onClick={() => setSelectedMethod(name)}
                            className={cn(
                              "group relative flex flex-col p-4 border-2 rounded-2xl transition-all h-24 items-start justify-between overflow-hidden",
                              selectedMethod === name ? "border-primary bg-primary/5" : "border-slate-100 hover:bg-slate-50"
                            )}
                          >
                            {selectedMethod === name && (
                              <div className="absolute top-2 right-2 text-primary animate-in zoom-in">
                                 <CheckCircle size={16} fill="white" />
                              </div>
                            )}
                            {getPaymentIcon(name, selectedMethod === name)}
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest leading-none text-slate-500",
                              selectedMethod === name && "text-slate-900"
                            )}>{getPaymentLabel(name)}</span>
                          </button>
                        ))}
                     </div>
                  </div>

                  {selectedMethod && (
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2 animate-in fade-in slide-in-from-top-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paiement via {selectedMethod}</p>
                       <p className="text-xs font-bold text-slate-900 line-clamp-2">
                          {isUrl ? "Un lien de paiement externe sera utilisé pour cette transaction." : paymentValue || "Paiement via transfert manuel sécurisé."}
                       </p>
                    </div>
                  )}

                  <div className="space-y-4">
                     <button 
                      onClick={() => {
                        setPaymentInitiated(true);
                      }}
                      className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 group"
                    >
                      VOIR LES INSTRUCTIONS
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold italic">
                       <Shield size={12} /> Transaction 100% sécurisée
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-8 py-4 animate-in fade-in zoom-in">
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-2xl w-fit text-primary">
                       {isUrl ? <Globe size={32} /> : <Smartphone size={32} />}
                    </div>
                    <h3 className="text-2xl font-black">{isUrl ? "Paiement en ligne" : "Finaliser votre Transfert"}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      {isUrl 
                        ? `Cliquez sur le bouton ci-dessous pour payer ${price} XOF via le portail sécurisé ${selectedMethod}.`
                        : `Veuillez effectuer le transfert de ${price} XOF vers le numéro suivant :`
                      }
                    </p>
                  </div>

                  <div className="p-8 bg-slate-900 rounded-[30px] text-white space-y-4 text-center relative overflow-hidden">
                     <div className="absolute inset-0 african-pattern opacity-10" />
                     {isUrl ? (
                        <a 
                          href={paymentValue || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 bg-primary text-white font-black px-8 py-4 rounded-2xl relative z-10 hover:scale-105 transition-all shadow-xl shadow-primary/20"
                        >
                          Lancer le paiement {selectedMethod} <ExternalLink size={20} />
                        </a>
                     ) : (
                        <>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Numéro de réception</p>
                          <p className="text-3xl font-black tracking-widest relative z-10">{paymentValue?.split(' ').pop() || "NON CONFIGURÉ"}</p>
                        </>
                     )}

                     <div className="pt-4 border-t border-white/10 relative z-10">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-2">ID de Transaction / Référence</p>
                        <input 
                          type="text"
                          placeholder="Ex: T240122.1234.C..."
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-slate-600"
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start">
                       <Info size={18} className="text-amber-500 shrink-0" />
                       <p className="text-[10px] text-amber-800 font-bold leading-tight">
                         {isUrl 
                          ? "Une fois le paiement effectué sur le site partenaire, revenez ici et cliquez sur 'J'AI PAYÉ' pour que nous puissions valider votre abonnement."
                          : "Une fois le transfert effectué, veuillez cliquer sur 'J'AI PAYÉ'. Un administrateur vérifiera la transaction et activera votre compte."
                         }
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <button 
                        onClick={() => setPaymentInitiated(false)}
                        className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                       >
                         Retour
                       </button>
                       <button 
                        onClick={() => {
                          if (!transactionId || transactionId.length < 5) {
                            alert("Veuillez entrer l'ID de transaction pour vérification.");
                            return;
                          }
                          onUpgrade(selectedMethod, transactionId);
                        }}
                        className="py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all text-center flex items-center justify-center font-display"
                       >
                         ✅ CONFIRMER PAIEMENT
                       </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-50">
                 <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                   En vous abonnant, vous acceptez nos conditions d'utilisation. Pour les paiements manuels, l'activation nécessite une vérification humaine.
                 </p>
              </div>
           </div>
       </motion.div>
     </motion.div>
   );
 };
