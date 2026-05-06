"use client";

import React from 'react';
import { Globe, Monitor, CreditCard, ArrowRight } from 'lucide-react';
import Navbar from '@/components/navbar'; // Réutilise ta Navbar avec Déconnexion

export default function ChoicePage() {
  
  const options = [
    {
      title: "Continuer sur le Web",
      description: "Utilisez AutoBI directement dans votre navigateur.",
      icon: <Globe className="text-blue-500" size={32} />,
      link: "https://autobi-app.com",
      buttonText: "Ouvrir l'app",
      primary: true
    },
    {
      title: "Version PC Windows",
      description: "Téléchargez l'application pour Windows (Version Bêta).",
      icon: <Monitor className="text-purple-500" size={32} />,
      link: "/temp-desktop-image.png", // Lien vers ton image temporaire
      download: true,
      buttonText: "Télécharger",
      primary: false
    },
    {
      title: "Crédits & Abonnement",
      description: "Achetez des jetons ou passez au plan illimité.",
      icon: <CreditCard className="text-primary" size={32} />,
      link: "/credits", // On va créer cette page juste après
      buttonText: "Gérer mes crédits",
      primary: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Bienvenue sur AutoBI</h1>
          <p className="text-slate-500 text-lg">Que souhaitez-vous faire aujourd'hui ?</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {options.map((opt, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-white flex flex-col h-full hover:translate-y-[-5px] transition-all">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                {opt.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{opt.title}</h3>
              <p className="text-slate-500 mb-8 flex-grow">{opt.description}</p>
              
              <a 
                href={opt.link}
                download={opt.download}
                className={`
                  w-full h-14 flex items-center justify-center gap-2 rounded-2xl font-bold transition-all
                  ${opt.primary 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover' 
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}
                `}
              >
                {opt.buttonText}
                <ArrowRight size={18} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}