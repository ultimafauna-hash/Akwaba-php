import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, User, Shield, LogIn } from 'lucide-react';
import api from '../lib/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AdminLoginModal = ({ isOpen, onClose, onSuccess }: AdminLoginModalProps) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.adminLogin({ login, password });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="absolute top-6 right-6">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-10">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                   <Shield size={32} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
                  Admin <span className="text-primary">Login</span>
                </h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Accès Restreint • Akwaba Info</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 italic">Identifiant</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" 
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      placeholder="Admin"
                      required
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 italic">Mot de passe</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"
                  >
                    <Shield size={14} /> {error}
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={20} className="text-primary" />
                      SE CONNECTER
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                 Journal de sécurité actif • Toutes les tentatives sont enregistrées
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
