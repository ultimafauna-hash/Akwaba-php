import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Plus, Trash2, Edit3, Calendar, Save, X, Search, Clock, Globe, Camera } from 'lucide-react';
import api from '../lib/api';
import { cn, safeFormatDate } from '../lib/utils';
import { GitHubImageUpload } from './Admin';

interface HistoryEvent {
  id: string;
  date: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  year: number;
}

export const HistoryManager = () => {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<HistoryEvent>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // In a real app, this would be a Supabase call
      const data = await api.getHistoryEvents();
      setEvents(data || []);
    } catch (err) {
      console.error("Error fetching history events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentEvent.title || !currentEvent.year) return;
    try {
      await api.saveHistoryEvent(currentEvent as any);
      setIsEditing(false);
      setCurrentEvent({});
      fetchEvents();
    } catch (err) {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer cet événement historique ?")) {
      await api.deleteHistoryEvent(id);
      fetchEvents();
    }
  };

  const filteredEvents = (Array.isArray(events) ? events : []).filter(e => 
    (e.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black italic">Ce jour dans l'Histoire</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gérez les éphémérides africaines</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => {
              setCurrentEvent({ 
                id: crypto.randomUUID(),
                category: 'Afrique', 
                year: new Date().getFullYear(),
                date: safeFormatDate(new Date(), 'dd/MM')
              });
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} /> AJOUTER UN ÉVÉNEMENT
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-10 space-y-8 african-pattern"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Titre de l'événement</label>
                  <input 
                    type="text" 
                    value={currentEvent.title || ''}
                    onChange={e => setCurrentEvent({...currentEvent, title: e.target.value})}
                    placeholder="Ex: Indépendance de la Côte d'Ivoire"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Jour (DD/MM)</label>
                    <input 
                      type="text" 
                      value={currentEvent.date || ''}
                      onChange={e => setCurrentEvent({...currentEvent, date: e.target.value})}
                      placeholder="07/08"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Année</label>
                    <input 
                      type="number" 
                      value={currentEvent.year || ''}
                      onChange={e => setCurrentEvent({...currentEvent, year: parseInt(e.target.value)})}
                      placeholder="1960"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Image illustrative</label>
                  <GitHubImageUpload 
                    value={currentEvent.image || ''}
                    onChange={url => setCurrentEvent({...currentEvent, image: url})}
                    placeholder="URL de l'image illustrative"
                    icon={Camera}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Récit historique (Markdown)</label>
                  <textarea 
                    value={currentEvent.content || ''}
                    onChange={e => setCurrentEvent({...currentEvent, content: e.target.value})}
                    placeholder="Racontez l'histoire..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 text-sm min-h-[250px] outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-8 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                ANNULER
              </button>
              <button 
                onClick={handleSave}
                className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Save size={16} className="inline mr-2" /> ENREGISTRER
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un événement..."
                className="w-full bg-white border border-slate-100 rounded-[20px] pl-14 pr-6 py-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <div key={event.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                      <Clock size={20} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setCurrentEvent(event);
                          setIsEditing(true);
                        }}
                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-1">{event.date} / {event.year}</p>
                  <h3 className="text-lg font-black leading-tight mb-2">{event.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-4">{event.content}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase">{event.category}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredEvents.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <History size={32} />
                </div>
                <h3 className="font-black italic text-slate-400">Aucun événement trouvé</h3>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
