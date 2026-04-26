import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapIcon, Plus, Trash2, Edit3, MapPin, Save, X, Search, Globe, Flag, Camera } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';
import { GitHubImageUpload } from './Admin';

interface MapPoint {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  category: 'culture' | 'history' | 'nature' | 'monument';
  country: string;
  image?: string;
}

export const MapManager = () => {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPoint, setCurrentPoint] = useState<Partial<MapPoint>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const data = await api.getMapPoints();
      setPoints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching map points:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPoint.title || !currentPoint.latitude) return;
    try {
      await api.saveMapPoint(currentPoint as any);
      setIsEditing(false);
      setCurrentPoint({});
      fetchPoints();
    } catch (err) {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const filteredPoints = (Array.isArray(points) ? points : []).filter(p => 
    (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.country || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black italic">Carte Akwaba Interactive</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gérez les points d'intérêt sur le continent</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => {
              setCurrentPoint({ 
                id: crypto.randomUUID(),
                category: 'culture', 
                country: 'Côte d\'Ivoire',
                latitude: 5.3484,
                longitude: -4.0305
              });
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} /> AJOUTER UN POINT
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-10 space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nom du lieu</label>
                  <input 
                    type="text" 
                    value={currentPoint.title || ''}
                    onChange={e => setCurrentPoint({...currentPoint, title: e.target.value})}
                    placeholder="Ex: Basilique de Yamoussoukro"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Pays</label>
                    <input 
                      type="text" 
                      value={currentPoint.country || ''}
                      onChange={e => setCurrentPoint({...currentPoint, country: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Catégorie</label>
                    <select 
                      value={currentPoint.category || 'culture'}
                      onChange={e => setCurrentPoint({...currentPoint, category: e.target.value as any})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                    >
                      <option value="culture">Culture</option>
                      <option value="history">Histoire</option>
                      <option value="nature">Nature</option>
                      <option value="monument">Monument</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={currentPoint.latitude || ''}
                      onChange={e => setCurrentPoint({...currentPoint, latitude: parseFloat(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={currentPoint.longitude || ''}
                      onChange={e => setCurrentPoint({...currentPoint, longitude: parseFloat(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Description</label>
                  <textarea 
                    value={currentPoint.description || ''}
                    onChange={e => setCurrentPoint({...currentPoint, description: e.target.value})}
                    placeholder="Description du lieu..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 text-sm min-h-[200px] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Image illustrative</label>
                  <GitHubImageUpload 
                    value={currentPoint.image || ''}
                    onChange={url => setCurrentPoint({...currentPoint, image: url})}
                    placeholder="URL de l'image"
                    icon={Camera}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase">ANNULER</button>
              <button onClick={handleSave} className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase shadow-lg shadow-primary/20">ENREGISTRER</button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoints.map(point => (
              <div key={point.id} className="bg-white rounded-[32px] border border-slate-100 p-6 flex items-start gap-4 hover:shadow-xl transition-all group">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                  point.category === 'culture' ? "bg-amber-100 text-amber-600" :
                  point.category === 'history' ? "bg-indigo-100 text-indigo-600" :
                  point.category === 'nature' ? "bg-emerald-100 text-emerald-600" :
                  "bg-red-100 text-red-600"
                )}>
                  <MapPin size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black truncate pr-4">{point.title}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setCurrentPoint(point); setIsEditing(true); }} className="text-slate-400 hover:text-primary"><Edit3 size={14}/></button>
                      <button onClick={async () => { if(confirm('Sûr ?')) { await api.deleteMapPoint(point.id); fetchPoints(); } }} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                    <Flag size={10} /> {point.country}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-3 leading-relaxed">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
