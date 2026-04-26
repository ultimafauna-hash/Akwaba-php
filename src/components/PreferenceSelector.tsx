import React from 'react';
import { motion } from 'motion/react';
import { Check, Plus, Star, Tag, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface PreferenceSelectorProps {
  availableCategories: string[];
  selectedCategories: string[];
  categoryIcons?: Record<string, string>;
  onToggle: (category: string) => void;
  onSave: (interests: string[]) => void;
  onClose: () => void;
  initialInterests?: string[];
}

export const PreferenceSelector: React.FC<PreferenceSelectorProps> = ({
  availableCategories,
  selectedCategories,
  categoryIcons,
  onToggle,
  onSave,
  onClose,
  initialInterests = []
}) => {
  const [interests, setInterests] = React.useState<string[]>(initialInterests);
  const [newInterest, setNewInterest] = React.useState('');

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <Star size={24} fill="currentColor" />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight italic">Personnaliser mon flux</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sélectionnez vos centres d'intérêt</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableCategories.filter(cat => cat !== 'À la une' && cat !== 'Urgent').map((cat) => {
          const isSelected = selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggle(cat)}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group",
                isSelected 
                  ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" 
                  : "border-slate-100 hover:border-slate-200 text-slate-500 bg-white"
              )}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {categoryIcons?.[cat] || '📰'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                isSelected ? "bg-primary text-white scale-100" : "bg-slate-100 text-slate-300 scale-90"
              )}>
                {isSelected ? <Check size={14} strokeWidth={4} /> : <Plus size={14} strokeWidth={4} />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-400">
           <Tag size={16} />
           <span className="text-[10px] font-black uppercase tracking-widest">Sujets spécifiques</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {interests.map(interest => (
            <span 
              key={interest}
              className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 group animate-in zoom-in"
            >
              #{interest}
              <button 
                onClick={() => removeInterest(interest)}
                className="hover:scale-125 transition-transform"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {interests.length === 0 && (
            <p className="text-[10px] font-bold text-slate-300 italic">Ajoutez des mots-clés (ex: Football, Startup, Abidjan...)</p>
          )}
        </div>

        <div className="relative">
          <input 
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
            placeholder="Ajouter un centre d'intérêt (appuyez sur Entrée)"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold transition-all focus:border-primary/30 outline-none"
          />
          <button 
            onClick={addInterest}
            disabled={!newInterest.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl disabled:opacity-50 transition-all hover:scale-110 active:scale-95"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => onSave(interests)}
          className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Enregistrer mes préférences
        </button>
        <button
          onClick={onClose}
          className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
};
