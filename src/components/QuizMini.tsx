import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Trophy, CheckCircle2, XCircle, X, ArrowRight, Sparkles } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export const QuizMini = ({ onClose }: { onClose: () => void }) => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await api.getQuizzes();
      setQuizzes(data?.sort(() => Math.random() - 0.5).slice(0, 5) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentQuiz = quizzes[currentIndex];

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    const correct = idx === currentQuiz.correct_option;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + currentQuiz.points);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setShowResult(true);
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
      <div className="p-8 bg-emerald-600 text-white relative shrink-0">
        <div className="absolute inset-0 african-pattern opacity-10" />
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-10 text-white">
          <X size={20} />
        </button>
        <div className="relative z-10 space-y-2">
           <div className="flex items-center gap-2 text-emerald-100">
              <Trophy size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quiz & Challenges</span>
           </div>
           <h2 className="text-2xl font-black italic">Testez vos Connaissances</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : showResult ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center space-y-6"
          >
             <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-[40px] flex items-center justify-center shadow-2xl">
                <Trophy size={48} />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black italic">Bravo !</h3>
                <p className="text-sm font-bold text-slate-500">Vous avez terminé le défi d'aujourd'hui.</p>
             </div>
             <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">SCORE TOTAL</span>
                <span className="text-4xl font-black tracking-tighter text-emerald-400">{score} PTS</span>
             </div>
             <button 
              onClick={onClose}
              className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20"
             >
                Terminer
             </button>
          </motion.div>
        ) : currentQuiz ? (
          <div className="space-y-8 min-h-full flex flex-col">
             <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                   <span>Question {currentIndex + 1}/{quizzes.length}</span>
                   <span className="text-emerald-600">+{currentQuiz.points} PTS</span>
                </div>
                <h3 className="text-xl font-black italic text-slate-900 leading-tight">
                  {currentQuiz.question}
                </h3>
             </div>

             <div className="space-y-3 flex-1">
                {currentQuiz.options.map((opt: string, i: number) => (
                  <button 
                    key={i}
                    disabled={selectedOption !== null}
                    onClick={() => handleOptionSelect(i)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 text-left text-sm font-bold transition-all relative overflow-hidden group",
                      selectedOption === null 
                        ? "border-slate-100 hover:border-emerald-500/30 hover:bg-emerald-50/10" 
                        : i === currentQuiz.correct_option 
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : selectedOption === i 
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-slate-50 text-slate-300"
                    )}
                  >
                    <div className="flex justify-between items-center">
                       <span>{opt}</span>
                       {selectedOption !== null && i === currentQuiz.correct_option && <CheckCircle2 size={18} className="text-emerald-500" />}
                       {selectedOption === i && i !== currentQuiz.correct_option && <XCircle size={18} className="text-red-500" />}
                    </div>
                  </button>
                ))}
             </div>

             <AnimatePresence>
                {selectedOption !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-4"
                  >
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1">
                          <Sparkles size={12} /> Le Saviez-vous ?
                       </p>
                       <div className="text-[11px] font-medium leading-relaxed text-slate-600 italic">
                          <ReactMarkdown>{currentQuiz.explanation}</ReactMarkdown>
                       </div>
                    </div>
                    <button 
                      onClick={nextQuestion}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group"
                    >
                      {currentIndex < quizzes.length - 1 ? 'Question Suivante' : 'Voir mon score'}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 px-8 space-y-4 opacity-40">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <HelpCircle size={32} />
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Aucun quiz disponible pour l'instant.</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Propulsé par Kassiri Pulse • Akwaba Info</p>
      </div>
    </motion.div>
  );
};
