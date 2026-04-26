import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Plus, Trash2, Edit3, HelpCircle, Save, X, Search, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';

interface QuizPost {
  id: string;
  question: string;
  options: string[];
  correct_option: number;
  explanation: string;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const QuizManager = () => {
  const [quizzes, setQuizzes] = useState<QuizPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Partial<QuizPost>>({});

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await api.getQuizzes();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentQuiz.question || currentQuiz.correct_option === undefined) return;
    try {
      await api.saveQuiz(currentQuiz as any);
      setIsEditing(false);
      fetchQuizzes();
    } catch (err) {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black italic">Quiz & Défis Akwaba</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Créez des défis pour engager votre audience</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => {
              setCurrentQuiz({ options: ['', '', '', ''], correct_option: 0, points: 50, difficulty: 'easy', category: 'Général' });
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            <Plus size={16} /> NOUVEAU QUIZ
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-10 space-y-8"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Question</label>
                <input 
                  type="text" 
                  value={currentQuiz.question || ''}
                  onChange={e => setCurrentQuiz({...currentQuiz, question: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                  placeholder="Posez votre question..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400">Options de réponse</label>
                  {currentQuiz.options?.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="correct"
                        checked={currentQuiz.correct_option === i}
                        onChange={() => setCurrentQuiz({...currentQuiz, correct_option: i})}
                        className="w-5 h-5 accent-emerald-500"
                      />
                      <input 
                        type="text" 
                        value={opt}
                        onChange={e => {
                          const newOpts = [...(currentQuiz.options || [])];
                          newOpts[i] = e.target.value;
                          setCurrentQuiz({...currentQuiz, options: newOpts});
                        }}
                        className={cn(
                          "flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none",
                          currentQuiz.correct_option === i && "border-emerald-500/50 bg-emerald-50/30"
                        )}
                        placeholder={`Option ${i + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Explication (Markdown)</label>
                    <textarea 
                      value={currentQuiz.explanation || ''}
                      onChange={e => setCurrentQuiz({...currentQuiz, explanation: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-xs font-medium min-h-[150px] outline-none"
                      placeholder="Expliquez pourquoi c'est la bonne réponse..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400">Points</label>
                       <input type="number" value={currentQuiz.points} onChange={e => setCurrentQuiz({...currentQuiz, points: parseInt(e.target.value)})} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400">Difficulté</label>
                       <select value={currentQuiz.difficulty} onChange={e => setCurrentQuiz({...currentQuiz, difficulty: e.target.value as any})} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none">
                          <option value="easy">Facile</option>
                          <option value="medium">Moyen</option>
                          <option value="hard">Difficile</option>
                       </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
               <button onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase">ANNULER</button>
               <button onClick={handleSave} className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase shadow-lg shadow-primary/20">ENREGISTRER LE QUIZ</button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="bg-white rounded-[40px] border border-slate-100 p-8 hover:shadow-xl transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{quiz.category} • {quiz.points} PTS</p>
                      <h3 className="font-black italic text-slate-900 leading-tight">{quiz.question}</h3>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setCurrentQuiz(quiz); setIsEditing(true); }} className="p-2 text-slate-400 hover:text-primary"><Edit3 size={18}/></button>
                    <button onClick={async () => { if(confirm('Sûr ?')) { await api.deleteQuiz(quiz.id); fetchQuizzes(); } }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {quiz.options.map((opt, i) => (
                    <div key={i} className={cn(
                      "p-3 rounded-xl text-[10px] font-bold border flex items-center gap-2",
                      i === quiz.correct_option ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-500"
                    )}>
                      {i === quiz.correct_option && <CheckCircle2 size={12} />}
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
