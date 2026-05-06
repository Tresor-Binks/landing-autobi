"use client";

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, ...form })
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        localStorage.setItem('autobi_user_id', String(data.user.id));
        // Redirection
        window.location.href = "/dashboard"; // On l'envoie vers le nouveau menu
      }
    } catch (err) {
      setError('Impossible de joindre le serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center p-6 selection:bg-primary/20">
      {/* Retour accueil */}
      <a href="/" className="group flex items-center gap-2 text-gray-500 mb-8 hover:text-dark-text transition-colors font-bold text-sm">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </a>
      
      <div className="w-full max-w-[460px] bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-black/5 border border-gray-100 relative overflow-hidden">
        
        {/* Décoration subtile */}
        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-6">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-dark-text mb-2">
            {mode === 'register' ? 'Créer un compte' : 'Bon retour !'}
          </h1>
          <p className="text-gray-500 font-medium px-4">
            {mode === 'register' ? 'Commencez vos analyses intelligentes dès maintenant.' : 'Connectez-vous pour accéder à vos dashboards.'}
          </p>
        </div>

        {/* Badge 5 jetons */}
        {mode === 'register' && (
          <div className="flex items-center justify-center gap-2 bg-green-50 text-primary text-[11px] font-black p-3 rounded-2xl mb-8 border border-green-100 animate-pulse">
            <CheckCircle2 size={16} /> 🎁 5 JETONS GRATUITS OFFERTS À L'INSCRIPTION
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input 
                  required 
                  type="text" 
                  placeholder="Prénom" 
                  className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-dark-text"
                  onChange={e => setForm({...form, firstName: e.target.value})} 
                />
              </div>
              <div className="relative">
                <input 
                  required 
                  type="text" 
                  placeholder="Nom" 
                  className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-dark-text"
                  onChange={e => setForm({...form, lastName: e.target.value})} 
                />
              </div>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              required 
              type="email" 
              placeholder="Email professionnel" 
              className="w-full h-14 pl-14 pr-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-dark-text"
              onChange={e => setForm({...form, email: e.target.value})} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              required 
              type="password" 
              placeholder="Mot de passe" 
              className="w-full h-14 pl-14 pr-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-dark-text"
              onChange={e => setForm({...form, password: e.target.value})} 
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span> {error}
            </div>
          )}

          <button 
            disabled={loading} 
            className="w-full h-14 mt-4 bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" /> : (mode === 'register' ? "Créer mon compte" : "Me connecter")}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 font-medium">
            {mode === 'register' ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}
            <button 
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} 
              className="ml-2 font-black text-primary hover:underline underline-offset-4 transition-all"
            >
              {mode === 'login' ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400 font-bold uppercase tracking-widest">
        Paiements sécurisés via OpenPay Congo
      </p>
    </main>
  );
}