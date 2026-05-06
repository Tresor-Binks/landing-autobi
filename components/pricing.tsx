"use client";

import React, { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

const Pricing = () => {
  const [loadingAmount, setLoadingAmount] = useState<number | null>(null);

  const handlePayment = async (amount: number, description: string) => {
    if (loadingAmount !== null) return;

    const userId = localStorage.getItem('autobi_user_id');
    if (!userId) {
      window.location.href = '/auth';
      return;
    }

    setLoadingAmount(amount);

    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description, userId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur lors de l'initialisation du paiement.");
        setLoadingAmount(null);
      }
    } catch (error) {
      console.error("Erreur de paiement:", error);
      alert("Impossible de contacter le serveur de paiement.");
      setLoadingAmount(null);
    }
  };

  return (
    <section id="pricing" className="py-32 px-4 bg-white">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Tarification transparente.</h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Paiement via Mobile Money — MTN, Airtel, et autres opérateurs au Congo.
        </p>
      </div>
      
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Card 1: Pay-as-you-go */}
        <div className="p-12 rounded-[2.5rem] bg-slate-50 border border-gray-100 flex flex-col items-center">
          <span className="bg-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-200 mb-8">
            Pay-as-you-go
          </span>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-6xl font-black">3 000</span>
            <span className="text-xl font-bold text-gray-400 uppercase tracking-tighter">Xaf</span>
          </div>
          <ul className="w-full space-y-4 mb-12">
            {["10 analyses IA", "Accès complet aux outils", "Graphiques interactifs", "Export PDF"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-gray-600 font-medium">
                <CheckCircle2 size={18} className="text-primary" /> {item}
              </li>
            ))}
          </ul>
          <button 
            onClick={() => handlePayment(3000, "10 Analyses - AutoBI")}
            disabled={loadingAmount !== null}
            className={`
              w-full h-16 flex items-center justify-center gap-3
              border-2 border-dark-text text-dark-text font-black rounded-2xl 
              transition-all active:scale-95 cursor-pointer
              ${loadingAmount === null ? 'hover:bg-dark-text hover:text-white' : 'opacity-50 cursor-not-allowed'}
            `}
          >
            {loadingAmount === 3000 ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Connexion...</span>
              </>
            ) : (
              "Acheter 10 jetons"
            )}
          </button>
          <p className="mt-6 text-xs text-gray-400 font-medium">Idéal pour tester et les petits projets</p>
        </div>

        {/* Card 2: Pro Plan */}
        <div className="p-12 rounded-[2.5rem] bg-dark-text text-white flex flex-col items-center relative overflow-hidden shadow-2xl shadow-primary/10">
          <div className="absolute top-8 right-8 bg-primary text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest animate-pulse">
            Recommandé
          </div>
          <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-white/10 mb-8">
            Abonnement Pro
          </span>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-6xl font-black">20 000</span>
            <span className="text-xl font-bold text-gray-400 uppercase tracking-tighter">Xaf / mois</span>
          </div>
          <ul className="w-full space-y-4 mb-12">
            {["Analyses illimitées", "Support prioritaire 24/7", "Toutes les fonctionnalités", "Assistant IA illimité"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-gray-200 font-medium">
                <CheckCircle2 size={18} className="text-primary" /> {item}
              </li>
            ))}
          </ul>
          <button 
            onClick={() => handlePayment(20000, "Plan Pro Mensuel - AutoBI")}
            disabled={loadingAmount !== null}
            className={`
              w-full h-16 flex items-center justify-center gap-3
              bg-primary hover:bg-primary-hover text-white font-black rounded-2xl 
              transition-all active:scale-95 shadow-xl shadow-primary/20
              cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
            `}
          >
            {loadingAmount === 20000 ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Préparation...</span>
              </>
            ) : (
              "Devenir Pro"
            )}
          </button>
          <p className="mt-6 text-xs text-gray-400 font-medium italic text-center">
            Paiement sécurisé via OpenPay Congo • MTN • Airtel
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;