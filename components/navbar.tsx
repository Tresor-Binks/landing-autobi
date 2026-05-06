"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Vérification de la session côté client
    const userId = localStorage.getItem("autobi_user_id");
    setIsLoggedIn(!!userId);
  }, []);

  const handleAuthAction = () => {
    if (isLoggedIn) {
      // Nettoyage du stockage local pour la déconnexion
      localStorage.removeItem("autobi_user_id");
      localStorage.removeItem("autobi_user_email");
      setIsLoggedIn(false);
      window.location.href = "/"; // Redirection vers l'accueil
    } else {
      window.location.href = "/auth";
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* LOGO & NOM */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
            <Image 
              src="/logo.png" 
              alt="AutoBI Logo" 
              width={40} 
              height={40} 
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-black tracking-tighter text-dark-text uppercase">AUTO BI</span>
        </Link>
        
        {/* LIENS DE NAVIGATION (Anchor links pour la landing) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
          <a href="/#problem" className="hover:text-primary transition-colors">Le Problème</a>
          <a href="/#how-it-works" className="hover:text-primary transition-colors">Comment ça marche</a>
          <a href="/#pricing" className="hover:text-primary transition-colors">Tarifs</a>
          <a href="/#faq" className="hover:text-primary transition-colors">FAQ</a>
        </div>

        {/* ACTIONS (Connexion/Déconnexion & CTA) */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAuthAction}
            className="hidden sm:inline-block px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-dark-text transition-colors cursor-pointer"
          >
            {isLoggedIn ? "Déconnexion" : "Connexion"}
          </button>
          
          {/* Si l'utilisateur est déconnecté, on montre "Démarrer", sinon on peut montrer "Mon Espace" */}
          {!isLoggedIn ? (
            <Link 
              href="/auth" 
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-full transition-all shadow-md shadow-primary/20 active:scale-95"
            >
              Démarrer
            </Link>
          ) : (
            <Link 
              href="/dashboard" 
              className="px-6 py-3 bg-dark-text text-white text-sm font-bold rounded-full transition-all shadow-md active:scale-95"
            >
              Mon Dashboard
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;