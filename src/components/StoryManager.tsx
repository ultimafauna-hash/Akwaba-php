import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Plus, Trash2, Edit3, Heart, Save, X, Search, Star, MapPin, Camera } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';
import { GitHubImageUpload } from './Admin';
import { DiasporaStory } from '../types';

export const StoryManager = () => {
  const [stories, setStories] = useState<DiasporaStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStory, setCurrentStory] = useState<Partial<DiasporaStory>>({});

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const data = await api.getStories();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching stories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentStory.name || !currentStory.story) return;
    try {
      await api.saveStory(currentStory as any);
      setIsEditing(false);
      fetchStories();
    } catch (err) {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black italic">Diaspora Stories</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Mettez en avant les succès de la diaspora africaine</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => {
              setCurrentStory({ 
                id: crypto.randomUUID(),
                category: 'Success Story', 
                isFeatured: false
              });
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            <Plus size={16} /> AJOUTER UNE STORY
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nom Complet</label>
                  <input 
                    type="text" 
                    value={currentStory.name || ''}
                    onChange={e => setCurrentStory({...currentStory, name: e.target.value})}
                    placeholder="Ex: Tidjane Thiam"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Localisation / Ville</label>
                  <input 
                    type="text" 
                    value={currentStory.location || ''}
                    onChange={e => setCurrentStory({...currentStory, location: e.target.value})}
                    placeholder="Ex: Paris, France"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Catégorie</label>
                  <input 
                    type="text" 
                    value={currentStory.category || ''}
                    onChange={e => setCurrentStory({...currentStory, category: e.target.value})}
                    placeholder="Ex: Finance, Tech, Art..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Leur Histoire (Markdown)</label>
                  <textarea 
                    value={currentStory.story || ''}
                    onChange={e => setCurrentStory({...currentStory, story: e.target.value})}
                    placeholder="Racontez leur parcours..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 text-sm min-h-[200px] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Photo de profil</label>
                  <GitHubImageUpload 
                    value={currentStory.image || ''}
                    onChange={url => setCurrentStory({...currentStory, image: url})}
                    placeholder="URL de la photo"
                    icon={Camera}
                  />
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={currentStory.isFeatured}
                        onChange={e => setCurrentStory({...currentStory, isFeatured: e.target.checked})}
                        className="w-5 h-5 accent-primary"
                      />
                      <label className="text-[10px] font-black uppercase text-slate-400">Mettre en avant</label>
                   </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
               <button onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase">ANNULER</button>
               <button onClick={handleSave} className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase shadow-lg shadow-primary/20">ENREGISTRER LA STORY</button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(story => (
              <div key={story.id} className="bg-white rounded-[40px] border border-slate-100 p-8 hover:shadow-xl transition-all group overflow-hidden relative">
                {story.isFeatured && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl flex items-center gap-1 shadow-lg">
                    <Star size={10} fill="currentColor" /> FEATURED
                  </div>
                )}
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-50">
                      <img src={story.image || `https://ui-avatars.com/api/?name=${story.name}`} className="w-full h-full object-cover" />
                   </div>
                   <div className="min-w-0">
                      <h3 className="font-black truncate text-lg italic">{story.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                         <MapPin size={10} /> {story.location}
                      </p>
                   </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-6 italic">"{story.story}"</p>
                <div className="flex items-center justify-between">
                   <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[9px] font-black uppercase tracking-tight">{story.category}</span>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setCurrentStory(story); setIsEditing(true); }} className="p-2 text-slate-400 hover:text-primary"><Edit3 size={16}/></button>
                      <button onClick={async () => { if(confirm('Sûr ?')) { await api.deleteStory(story.id); fetchStories(); } }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
