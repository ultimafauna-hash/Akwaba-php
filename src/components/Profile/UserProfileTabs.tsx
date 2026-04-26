import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Smartphone, 
  Shield, 
  CreditCard, 
  Activity, 
  Bell, 
  Lock, 
  MessageSquare, 
  Database,
  Camera,
  Globe,
  MapPin,
  CheckCircle,
  AlertTriangle,
  History as HistoryIcon,
  Clock,
  TrendingUp,
  Award,
  Trash2,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  UserCheck,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Sun,
  Moon,
  FileText,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, AdminActivityLog, Article } from '../../types';
import { cn, safeFormatDate, optimizeImage } from '../../lib/utils';
import api from '../../lib/api';

interface UserProfileTabsProps {
  user: UserProfile;
  onUpdate: (updatedUser: Partial<UserProfile>) => Promise<void>;
  activityLogs: AdminActivityLog[];
  articles: Article[];
  onArticleClick: (article: Article) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  bookmarkedIds: Set<string>;
  categoryIcons?: Record<string, string>;
  playNotificationSound?: (type: any) => void;
}

const ProfileTab = ({ active, icon: Icon, label, onClick, count }: { active: boolean, icon: any, label: string, onClick: () => void, count?: number }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group",
      active ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" : "text-slate-500 hover:bg-slate-50"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={cn(active ? "text-white" : "text-slate-400 group-hover:text-primary")} />
      {label}
    </div>
    {count !== undefined && (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[8px]",
        active ? "bg-white text-primary" : "bg-slate-100 text-slate-500"
      )}>
        {count}
      </span>
    )}
  </button>
);

export const UserProfileTabs = ({ 
  user, 
  onUpdate, 
  activityLogs,
  articles,
  onArticleClick,
  onBookmark,
  bookmarkedIds,
  categoryIcons,
  playNotificationSound
}: UserProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>(user);
  const [mfaData, setMfaData] = useState<{ qrCode: string, id: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(formData);
      alert("Profil mis à jour avec succès !");
    } catch (e: any) {
      alert("Erreur lors de la mise à jour : " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover' | 'kyc') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const bucket = type === 'kyc' ? 'kyc-documents' : 'avatars';
      const path = `${user.uid}/${type}_${Date.now()}_${file.name}`;
      const url = await api.uploadFile(file);
      
      if (type === 'avatar') {
        setFormData(prev => ({ ...prev, photourl: url }));
        await onUpdate({ photourl: url });
      } else if (type === 'cover') {
        setFormData(prev => ({ ...prev, cover_image: url }));
        await onUpdate({ cover_image: url });
      } else if (type === 'kyc') {
        const docs = [...(formData.kyc_documents || []), { url, type: file.type, date: new Date().toISOString() }];
        setFormData(prev => ({ ...prev, kyc_documents: docs, kyc_status: 'pending' }));
        await api.submitKYCDocuments(user.uid, docs);
      }
    } catch (err: any) {
      alert("Erreur lors de l'upload : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnrollMFA = async () => {
    try {
      setIsSaving(true);
      const data = await api.enrollMFA();
      setMfaData(data);
      setShowMfaModal(true);
    } catch (err: any) {
      alert("Erreur MFA : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!mfaData) return;
    try {
      setIsSaving(true);
      await api.verifyMFA(mfaData.id, mfaCode);
      await api.enable2FA(user.uid, 'totp');
      setShowMfaModal(false);
      setFormData(prev => ({ ...prev, two_factor_enabled: true }));
      alert("MFA activé avec succès !");
    } catch (err: any) {
      alert("Code invalide : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      setIsSaving(true);
      await api.updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      alert("Mot de passe changé !");
    } catch (err: any) {
      alert("Erreur mot de passe : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderPersonal = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end">
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-2 bg-gradient-to-tr from-emerald-500 to-primary shadow-2xl relative">
             <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-slate-100">
              <img 
                src={optimizeImage(formData.photourl || `https://ui-avatars.com/api/?name=${user.displayname}`, 400)} 
                alt={user.displayname} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
             </div>
             {user.kyc_status === 'verified' && (
               <div className="absolute bottom-1 right-1 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <CheckCircle size={20} />
               </div>
             )}
          </div>
          <label className="absolute -top-1 -right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all cursor-pointer border-4 border-white">
            <Camera size={18} />
            <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'avatar')} />
          </label>
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left pb-2">
            <div className="space-y-1">
               <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter">{user.displayname}</h3>
               <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-primary font-black text-xs">@{user.username || 'user'}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{user.country || 'Afrique'}</span>
               </div>
            </div>
            <p className="text-slate-500 text-sm font-medium max-w-md leading-relaxed">
               {user.bio || "Ami de l'Afrique et curieux de sa culture."}
            </p>
        </div>
      </div>

      <div className="h-px bg-slate-100 my-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 italic">Nom complet</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              value={formData.displayname || ''} 
              onChange={e => setFormData({...formData, displayname: e.target.value})}
              className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-3 md:py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              placeholder="Ex: Kouadio Koffi"
              disabled={user.kyc_status === 'verified'}
            />
          </div>
          {user.kyc_status === 'verified' && (
            <p className="text-[9px] text-emerald-500 font-bold px-2 flex items-center gap-1">
              <CheckCircle size={10} /> Validé par KYC • Non modifiable
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 italic">Nom d'utilisateur (Username)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-black">@</span>
            <input 
              type="text" 
              value={formData.username || ''} 
              onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
              className="w-full bg-slate-50 rounded-2xl pl-10 pr-4 py-3 md:py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              placeholder="username"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 italic">Bio / Description</label>
          <textarea 
            value={formData.bio || ''} 
            onChange={e => setFormData({...formData, bio: e.target.value})}
            className="w-full bg-slate-50 rounded-3xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all min-h-[120px]"
            placeholder="Parlez-nous de vous..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 italic">Photo de couverture</label>
        <div className="w-full aspect-[3/1] rounded-[2rem] bg-slate-100 overflow-hidden relative group border-4 border-white shadow-xl">
          {formData.cover_image ? (
            <img src={formData.cover_image} className="w-full h-full object-cover" alt="Cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
              <Camera size={40} />
              <span className="text-[10px] font-black uppercase tracking-widest">Aucune image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <label className="bg-white text-slate-900 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-primary hover:text-white transition-all cursor-pointer">
                Changer la couverture
                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'cover')} />
             </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6 md:space-y-10 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
          <h3 className="text-2xl font-black italic">Contact & Coordonnées</h3>
          <p className="text-slate-400 text-xs font-medium">Comment les autres membres et l'équipe peuvent vous joindre.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 italic">Email principal</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="email" 
              value={formData.email || ''} 
              disabled
              className="w-full bg-slate-50/50 rounded-2xl pl-12 pr-4 py-3 md:py-4 text-sm font-bold text-slate-400 cursor-not-allowed"
            />
          </div>
          <button 
            onClick={async () => {
              const newEmail = prompt("Entrez votre nouvelle adresse email :");
              if (newEmail && newEmail.includes('@')) {
                try {
                  await api.updateUserEmail(newEmail);
                  alert("Un lien de confirmation a été envoyé à votre nouvelle adresse. Veuillez le valider pour finaliser le changement.");
                } catch (e: any) {
                  alert("Erreur : " + e.message);
                }
              }
            }}
            className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline px-2"
          >
            Changer d'email principal
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 italic">Email de secours</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="email" 
              value={formData.secondary_email || ''} 
              onChange={e => setFormData({...formData, secondary_email: e.target.value})}
              className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-3 md:py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              placeholder="secours@email.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 italic">Téléphone</label>
          <div className="relative">
            <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="tel" 
              value={formData.phone || ''} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-3 md:py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              placeholder="+225 00 00 00 00 00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 italic">WhatsApp</label>
          <div className="relative">
            <MessageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
            <input 
              type="tel" 
              value={formData.whatsapp || ''} 
              onChange={e => setFormData({...formData, whatsapp: e.target.value})}
              className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-3 md:py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
              placeholder="+225..."
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6 pt-4">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <MapPin size={20} className="text-primary" />
            <h4 className="text-sm font-black uppercase tracking-widest">Adresse & Localisation</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 italic">Adresse Postale</label>
              <input 
                type="text" 
                value={formData.address || ''} 
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                placeholder="Rue, Quartier, BP..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 italic">Ville</label>
              <input 
                type="text" 
                value={formData.city || ''} 
                onChange={e => setFormData({...formData, city: e.target.value})}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                placeholder="Abidjan"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 italic">Pays</label>
              <input 
                type="text" 
                value={formData.country || ''} 
                onChange={e => setFormData({...formData, country: e.target.value})}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                placeholder="Côte d'Ivoire"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 italic">Fuseau Horaire</label>
              <select 
                value={formData.timezone || 'UTC'}
                onChange={e => setFormData({...formData, timezone: e.target.value})}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[10px] font-bold outline-none"
              >
                <option value="UTC">UTC (GMT)</option>
                <option value="Africa/Abidjan">Africa/Abidjan (+0)</option>
                <option value="Europe/Paris">Europe/Paris (+1)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6 pt-4">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Globe size={20} className="text-secondary" />
            <h4 className="text-sm font-black uppercase tracking-widest">Liens & Réseaux Sociaux</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 italic">Site Web / Portfolio</label>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="url" 
                  value={formData.website_url || ''} 
                  onChange={e => setFormData({...formData, website_url: e.target.value})}
                  className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-[10px] font-bold outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
            {/* Social inputs... (omitted for brevity but normally here) */}
          </div>
        </div>
      </div>
    </div>
  );

  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [kycFiles, setKycFiles] = useState<{ id_card?: File, selfie?: File }>({});

  const handlePINChange = async () => {
    if (pin.length !== 4) {
      alert("Le code PIN doit comporter 4 chiffres.");
      return;
    }
    try {
      await api.setPIN(user.uid, pin);
      setFormData({ ...formData, pin_code: pin });
      alert("Code PIN mis à jour avec succès !");
      setPin('');
      setShowPinModal(false);
    } catch (e) {
      alert("Erreur lors de la mise à jour du code PIN.");
    }
  };

  const handleKYCSubmit = async () => {
    if (!kycFiles.id_card || !kycFiles.selfie) {
      alert("Veuillez fournir à la fois votre pièce d'identité et votre selfie.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Upload ID Card
      const idUrl = await api.uploadFile(kycFiles.id_card);
      // 2. Upload Selfie
      const selfieUrl = await api.uploadFile(kycFiles.selfie);

      // 3. Submit KYC
      const docs = [
        { type: 'id_card', url: idUrl, date: new Date().toISOString() },
        { type: 'selfie', url: selfieUrl, date: new Date().toISOString() }
      ];
      await api.submitKYCDocuments(user.uid, docs);
      
      // 4. Notify Admin
      await api.notifyAdminKYC(user.uid, user.displayname);

      setFormData({ ...formData, kyc_status: 'pending', kyc_documents: docs });
      alert("Documents KYC soumis avec succès ! L'administration les examinera sous peu.");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la soumission des documents.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderSecurity = () => (
    <div className="space-y-6 md:space-y-10 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
          <h3 className="text-2xl font-black italic">Sécurité du Compte</h3>
          <p className="text-slate-400 text-xs font-medium">Protégez votre compte avec des outils de sécurité avancés.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-slate-50 rounded-3xl p-6 md:p-8 space-y-6">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest leading-none">Double Authentification (2FA)</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Niveau de sécurité : MAXIMAL</p>
              </div>
           </div>
           
           <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-slate-600">Statut actuel</span>
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                user.two_factor_enabled ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
              )}>
                {user.two_factor_enabled ? "Activé" : "Désactivé"}
              </span>
           </div>

           <button 
            onClick={user.two_factor_enabled ? () => api.disable2FA(user.uid).then(() => setFormData(p => ({...p, two_factor_enabled: false}))) : handleEnrollMFA}
            className={cn(
               "w-full py-3.5 md:py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
               user.two_factor_enabled ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-primary text-white hover:bg-slate-900 shadow-xl shadow-primary/20"
            )}
           >
             {user.two_factor_enabled ? "Désactiver la 2FA" : "Configurer la 2FA"}
           </button>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 md:p-8 space-y-6">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest leading-none">Code PIN de sécurité</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Pour les transactions et accès sensibles.</p>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                 <span className="text-xs font-bold text-slate-600">Statut</span>
                 <span className={cn(
                   "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                   formData.pin_code ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                 )}>
                   {formData.pin_code ? "Configuré" : "Non configuré"}
                 </span>
              </div>
              <button 
                onClick={() => setShowPinModal(true)}
                className="w-full py-3.5 md:py-4 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
              >
                <Lock size={16} /> {formData.pin_code ? "Changer le code PIN" : "Créer mon code PIN"}
              </button>
           </div>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 md:p-8 space-y-6">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest leading-none">Changer le mot de passe</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Évitez les mots de passe trop simples.</p>
              </div>
           </div>
           
           <div className="space-y-4">
              <input 
                type="password" 
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-white rounded-xl px-4 py-3 md:py-4 text-xs outline-none border border-slate-100"
              />
              <input 
                type="password" 
                placeholder="Confirmer"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-white rounded-xl px-4 py-3 md:py-4 text-xs outline-none border border-slate-100"
              />
              <button 
                onClick={handlePasswordChange}
                className="w-full py-3.5 md:py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-primary transition-all"
              >
                Mettre à jour le mot de passe
              </button>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-3">
                 <HistoryIcon size={20} className="text-slate-400" />
                 <h4 className="text-sm font-black uppercase tracking-widest">Sessions Actives</h4>
              </div>
              <button className="text-[9px] font-black text-red-500 hover:underline uppercase tracking-widest">Déconnecter tous les autres appareils</button>
            </div>

            <div className="space-y-3">
               {[
                 { device: 'iPhone 15 Pro', browser: 'Safari', location: 'Abidjan, CI', status: 'Actuel', icon: '📱' },
                 { device: 'MacBook Air M2', browser: 'Chrome', location: 'Paris, FR', status: 'Il y a 2h', icon: '💻' }
               ].map((session, idx) => (
                 <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between group hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100 group-hover:bg-primary/10 transition-all">
                          {session.icon}
                       </div>
                       <div>
                          <h4 className="font-black text-xs uppercase tracking-tight">{session.device}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{session.browser} • {session.location}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={cn(
                         "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                         session.status === 'Actuel' ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                       )}>
                         {session.status}
                       </span>
                       {idx !== 0 && (
                         <button className="text-slate-300 hover:text-red-500 transition-colors p-2">
                           <Trash2 size={16} />
                         </button>
                       )}
                    </div>
                 </div>
               ))}
            </div>
        </div>
      </div>
    </div>
  );

  const renderKYC = () => (
    <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pb-20">
       <div className="space-y-4">
          <h3 className="text-2xl font-black italic">Vérification d'Identité (KYC)</h3>
          <p className="text-slate-400 text-xs font-medium">Assurez l'authenticité de votre compte pour bénéficier des services premium.</p>
      </div>

      <div className="bg-slate-50 rounded-[2.5rem] p-6 md:p-10">
        {user.kyc_status === 'verified' ? (
          <div className="text-center space-y-4 py-10">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
               <CheckCircle size={40} />
            </div>
            <h4 className="text-xl font-black italic">Votre compte est vérifié !</h4>
            <p className="text-slate-500 text-xs font-bold">Vous bénéficiez désormais d'un accès illimité à nos services.</p>
          </div>
        ) : user.kyc_status === 'pending' ? (
          <div className="text-center space-y-4 py-10">
            <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
               <Clock size={40} />
            </div>
            <h4 className="text-xl font-black italic">Vérification en cours</h4>
            <p className="text-slate-500 text-xs font-bold">Nos administrateurs examinent vos documents. Délai moyen : 24h.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ID Card */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 italic">Pièce d'Identité (Recto/Verso ou Passeport)</label>
                <div className={cn(
                  "relative border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 transition-colors",
                  kycFiles.id_card ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-primary"
                )}>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={e => setKycFiles({...kycFiles, id_card: e.target.files?.[0]})}
                    accept="image/*"
                  />
                  {kycFiles.id_card ? (
                    <>
                      <FileText className="text-emerald-500" size={32} />
                      <span className="text-[10px] font-black text-emerald-600 truncate max-w-full italic">{kycFiles.id_card.name}</span>
                    </>
                  ) : (
                    <>
                      <Camera className="text-slate-300" size={32} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-relaxed">Cliquez pour ajouter <br/> ma pièce d'identité</span>
                    </>
                  )}
                </div>
              </div>

              {/* Selfie */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 italic">Capture Selfie (Votre visage avec la pièce)</label>
                <div className={cn(
                  "relative border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 transition-colors",
                  kycFiles.selfie ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-primary"
                )}>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={e => setKycFiles({...kycFiles, selfie: e.target.files?.[0]})}
                    accept="image/*"
                    capture="user"
                  />
                  {kycFiles.selfie ? (
                    <>
                      <User className="text-emerald-500" size={32} />
                      <span className="text-[10px] font-black text-emerald-600 truncate max-w-full italic">{kycFiles.selfie.name}</span>
                    </>
                  ) : (
                    <>
                      <Camera className="text-slate-300" size={32} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-relaxed">Cliquez pour prendre <br/> un selfie</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={handleKYCSubmit}
              disabled={!kycFiles.id_card || !kycFiles.selfie || isSaving}
              className="w-full bg-primary text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
            >
              {isSaving ? "SOUMISSION EN COURS..." : "SOUMETTRE MON DOSSIER DE VÉRIFICATION"}
            </button>
            
            {user.kyc_status === 'rejected' && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-xs font-bold flex gap-3 items-center">
                <AlertTriangle size={18} />
                <span>Refusé : {user.kyc_rejection_reason || "Documents non conformes. Veuillez réessayer."}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 flex gap-6 items-start">
         <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
           <AlertTriangle size={24} />
         </div>
         <div className="space-y-2">
            <h5 className="font-black text-sm text-amber-900">Pourquoi faire le KYC ?</h5>
            <ul className="text-xs text-amber-800 space-y-2 list-disc pl-4 font-medium italic">
              <li>Possibilité de publier des annonces premium</li>
              <li>Participation prioritaire aux événements exclusifs</li>
              <li>Badge "Vérifié" sur votre profil public</li>
              <li>Plafonds de transaction plus élevés</li>
            </ul>
         </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
       <div className="space-y-4 text-center md:text-left">
          <h3 className="text-3xl font-black italic tracking-tighter">Tableau de Bord</h3>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Suivez votre progression et votre engagement</p>
      </div>

      {/* Circle Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
         {[
           { label: 'Lectures', val: user.read_count || 142, icon: Eye, color: 'text-primary', bg: 'bg-primary/10', percent: 75 },
           { label: 'Points', val: user.loyalty_points || 2500, icon: Award, color: 'text-amber-500', bg: 'bg-amber-100', percent: 60 },
           { label: 'Série', val: user.streak_days || 7, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-100', percent: 45 },
           { label: 'Badges', val: user.badges?.length || 5, icon: Shield, color: 'text-secondary', bg: 'bg-secondary/10', percent: 85 }
         ].map((stat, idx) => (
           <div key={idx} className="flex flex-col items-center gap-4 group">
              <div className="relative w-28 h-28 md:w-36 md:h-36">
                 <svg className="w-full h-full -rotate-90">
                    <circle 
                      cx="50%" cy="50%" r="45%" 
                      className="fill-none stroke-slate-100 stroke-[6]"
                    />
                    <motion.circle 
                      cx="50%" cy="50%" r="45%" 
                      className={cn("fill-none stroke-[6]", stat.color.replace('text', 'stroke'))}
                      initial={{ strokeDasharray: "0 1000", strokeDashoffset: 0 }}
                      animate={{ strokeDasharray: `${stat.percent * 2.8} 1000` }}
                      transition={{ duration: 1.5, delay: 0.2 }}
                      strokeLinecap="round"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                       <stat.icon size={20} />
                    </div>
                    <span className="text-xl md:text-2xl font-black">{stat.val}</span>
                 </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
           </div>
         ))}
      </div>

      {/* Badges and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
         <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center justify-between">
               <h4 className="font-black text-sm uppercase tracking-widest">Mes Médailles</h4>
               <span className="text-[10px] font-black text-primary uppercase">Voir tout</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
               {[
                 { id: 1, label: 'Pionnier', color: 'bg-amber-400', icon: '💎' },
                 { id: 2, label: 'Lecteur', color: 'bg-emerald-400', icon: '📚' },
                 { id: 3, label: 'Donateur', color: 'bg-rose-400', icon: '❤️' },
                 { id: 4, label: 'Expert', color: 'bg-indigo-400', icon: '🎓' }
               ].map(badge => (
                 <motion.div 
                   key={badge.id}
                   whileHover={{ scale: 1.1, rotate: 5 }}
                   className="flex-shrink-0 flex flex-col items-center gap-3"
                 >
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl border-4 border-white", badge.color)}>
                       {badge.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-500">{badge.label}</span>
                 </motion.div>
               ))}
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-200">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">Objectif : Médaille de Diamant</span>
                  <span className="text-[10px] font-black text-primary">85%</span>
               </div>
               <div className="h-4 bg-slate-200 rounded-full overflow-hidden p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    className="h-full bg-primary rounded-full shadow-lg"
                  />
               </div>
               <p className="text-[9px] font-bold text-slate-400 italic">Encore 500 points pour débloquer votre prochain badge !</p>
            </div>
         </div>

         <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
               <HistoryIcon size={20} className="text-slate-400" />
               <h4 className="text-sm font-black uppercase tracking-widest">Activité Récente</h4>
            </div>
            <div className="h-48 flex items-end gap-1 px-2">
               {[30, 45, 20, 60, 40, 55, 70, 40, 30, 50, 65, 40].map((h, idx) => (
                 <div key={idx} className="flex-1 group relative">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className={cn("w-full bg-slate-100 rounded-t-lg group-hover:bg-primary transition-all", idx === 11 && "bg-primary")} 
                   />
                 </div>
               ))}
            </div>
            <div className="flex justify-between px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
               <span>Dernier mois</span>
               <span>Aujourd'hui</span>
            </div>
         </div>
      </div>
    </div>
  );
  const renderPreferences = () => (
    <div className="space-y-6 md:space-y-10 animate-in slide-in-from-right-4 duration-500">
       <div className="space-y-4">
          <h3 className="text-2xl font-black italic">Préférences d'Utilisation</h3>
          <p className="text-slate-400 text-xs font-medium">Personnalisez votre expérience selon vos goûts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
         <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest border-b border-slate-50 pb-4">Affichage & Langue</h4>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2 italic">Langue d'interface</label>
              <div className="grid grid-cols-3 gap-2">
                 {['Français', 'Anglais', 'Dioula'].map(lang => (
                   <button 
                    key={lang}
                    onClick={() => setFormData({...formData, language: lang})}
                    className={cn(
                      "py-2.5 md:py-3 rounded-xl text-[10px] font-black uppercase transition-all",
                      (formData.language || 'Français') === lang ? "bg-primary text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    )}
                   >
                     {lang}
                   </button>
                 ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2 italic">Thème visuel</label>
              <div className="flex bg-slate-50 p-1 rounded-2xl opacity-50 cursor-not-allowed">
                 <div className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 bg-white text-slate-900 shadow-sm">
                   <Sun size={14} /> Mode Clair Uniquement
                 </div>
              </div>
            </div>
         </div>

         <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest border-b border-slate-50 pb-4">Notifications & Alertes</h4>
            
            <div className="space-y-3 md:space-y-4">
               {[
                 { id: 'notif_articles', label: 'Nouveaux articles', icon: FileText },
                 { id: 'notif_events', label: 'Rappels d\'événements', icon: Calendar },
                 { id: 'notif_newsletter', label: 'Newsletter hebdomadaire', icon: Mail },
                 { id: 'notif_sounds', label: 'Sons de notification', icon: Bell }
               ].map(item => (
                 <div key={item.id} className="flex items-center justify-between p-3.5 md:p-4 bg-slate-50/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <item.icon size={18} className="text-slate-400" />
                       <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    </div>
                    <button 
                      onClick={() => {
                        const newValue = !(formData as any)[item.id];
                        setFormData({...formData, [item.id]: newValue});
                        if (item.id === 'notif_sounds' && newValue && playNotificationSound) {
                          playNotificationSound('info');
                        }
                      }}
                      className={cn(
                        "w-10 h-5 md:w-12 md:h-6 rounded-full relative transition-colors duration-300",
                        (formData as any)[item.id] !== false ? "bg-primary" : "bg-slate-300"
                      )}
                    >
                      <div className={cn("absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-all duration-300", (formData as any)[item.id] !== false ? "right-0.5 md:right-1" : "left-0.5 md:left-1")} />
                    </button>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );

  const renderReadLater = () => {
    const bookmarkedArticles = (articles || []).filter(a => user.bookmarkedarticles?.includes(a.id));
    
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black italic">À lire plus tard</h3>
            <p className="text-slate-400 text-xs font-medium">Articles que vous avez enregistrés pour une lecture ultérieure.</p>
          </div>
        </div>

        {bookmarkedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarkedArticles.map(article => (
              <div 
                key={article.id}
                className="bg-slate-50 rounded-3xl overflow-hidden group hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full"
              >
                <div 
                  className="aspect-video relative overflow-hidden cursor-pointer shrink-0"
                  onClick={() => onArticleClick(article)}
                >
                  <img 
                    src={optimizeImage(article.image || '', 600)} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onBookmark(article.id, e); }}
                      className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1 gap-2">
                   <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black uppercase text-primary tracking-widest">{article.category}</span>
                     <span className="text-[9px] text-slate-400 font-bold">{safeFormatDate(article.date, 'dd MMM yyyy')}</span>
                   </div>
                   <h4 
                    className="font-black text-sm group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
                    onClick={() => onArticleClick(article)}
                   >
                     {article.title}
                   </h4>
                   <p className="text-[10px] text-slate-500 line-clamp-2 mt-2">{article.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto">
              <FileText size={32} />
            </div>
            <p className="text-slate-400 font-bold italic text-sm">Vous n'avez pas encore d'articles enregistrés.</p>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'personal', label: 'Profil', icon: User, render: renderPersonal },
    { id: 'read-later', label: 'À lire plus tard', icon: FileText, render: renderReadLater, count: user.bookmarkedarticles?.length },
    { id: 'activity', label: 'Compteur & Stats', icon: TrendingUp, render: renderActivity },
    { id: 'contact', label: 'Contact', icon: Mail, render: renderContact },
    { id: 'security', label: 'Sécurité', icon: Lock, render: renderSecurity },
    { id: 'kyc', label: 'Vérification', icon: Shield, render: renderKYC },
    { id: 'preferences', label: 'Réglages', icon: Bell, render: renderPreferences },
    { id: 'billing', label: 'Facturation', icon: CreditCard, render: () => <div className="p-12 text-center text-slate-400 italic font-bold">Section Facturation bientôt disponible.</div> },
    { id: 'data', label: 'Vie Privée', icon: Database, render: () => <div className="p-12 text-center text-slate-400 italic font-bold">Options de gestion des données.</div> }
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.render || renderPersonal;

  return (
     <div className="max-w-7xl mx-auto py-6 md:py-12 px-4 pb-48 md:pb-12 scroll-smooth">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-12">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-4">
           <div className="bg-white rounded-[2.5rem] p-3 md:p-4 shadow-xl border border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
             {tabs.map(tab => (
               <ProfileTab 
                 key={tab.id}
                 active={activeTab === tab.id}
                 icon={tab.icon}
                 label={tab.label}
                 onClick={() => setActiveTab(tab.id)}
                 count={tab.count}
               />
             ))}
           </div>
           
           <div className="bg-red-50 rounded-[2.5rem] p-4 border border-red-100 mt-6">
              <button 
                onClick={async () => {
                  if(confirm("Voulez-vous vraiment vous déconnecter ?")) {
                    await api.logout();
                    window.location.reload();
                  }
                }}
                className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-100 transition-all font-mono"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
           </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9">
           <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-slate-100 flex flex-col min-h-[500px] md:min-h-[700px]">
              <div className="p-4 md:p-12 flex-1">
                 <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ActiveComponent />
                    </motion.div>
                 </AnimatePresence>
              </div>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-4 md:p-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)]">
                 <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", isSaving ? "bg-amber-500" : "bg-emerald-500")} />
                      <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest italic truncate">
                        {isSaving ? "Synchronisation..." : "Modifications à jour"}
                      </span>
                    </div>
                 </div>
                 <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="order-first md:order-last px-8 md:px-10 py-3.5 md:py-4 bg-[#1a1a1a] text-white rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-primary transition-all active:scale-95 disabled:opacity-50 w-full md:min-w-[200px]"
                    >
                      {isSaving ? "ENREGISTREMENT..." : "ENREGISTRER"}
                    </button>
                    <button 
                      onClick={() => setFormData(user)}
                      className="px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all border border-slate-100 md:border-none bg-slate-50 md:bg-transparent"
                    >
                      ANNULER
                    </button>
                 </div>
              </div>
           </div>
        </main>
      </div>

      <AnimatePresence>
        {showMfaModal && mfaData && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowMfaModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 text-center space-y-6"
            >
              <h3 className="text-xl font-black italic">Configurer la 2FA</h3>
              <p className="text-xs text-slate-500">Scannez ce QR code avec Google Authenticator ou une app similaire.</p>
              <div className="bg-slate-50 p-4 rounded-3xl mx-auto w-fit">
                 <img src={mfaData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Entrez le code à 6 chiffres"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-50 rounded-2xl px-4 py-4 text-center font-black tracking-widest outline-none focus:ring-4 focus:ring-primary/10"
                  maxLength={6}
                />
                <button 
                  onClick={handleVerifyMFA}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                  Vérifier et Activer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowPinModal(false)}
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full relative z-10 space-y-6"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black italic">Code PIN de Sécurité</h3>
                <p className="text-xs text-slate-500 font-medium italic">Choisissez un code à 4 chiffres facile à retenir.</p>
              </div>

              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={cn(
                    "w-12 h-16 rounded-2xl bg-slate-50 border-2 flex items-center justify-center text-xl font-black",
                    pin.length > i ? "border-emerald-500 text-emerald-600" : "border-slate-100 text-slate-300"
                  )}>
                    {pin[i] ? '•' : ''}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'effacer', 0, 'ok'].map((num, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (num === 'effacer') setPin(pin.slice(0, -1));
                      else if (num === 'ok') handlePINChange();
                      else if (pin.length < 4) setPin(pin + num);
                    }}
                    className={cn(
                      "py-4 rounded-2xl font-black text-sm transition-all active:scale-90",
                      typeof num === 'number' ? "bg-slate-50 hover:bg-slate-100" : 
                      num === 'ok' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-red-50 text-red-500"
                    )}
                  >
                    {typeof num === 'number' ? num : num.toUpperCase()}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setShowPinModal(false)}
                className="w-full py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 tracking-widest"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Monitor = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
  </svg>
);

const ImageIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);
