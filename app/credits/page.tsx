"use client";

import React from 'react';
import Navbar from '@/components/navbar';
import Pricing from '@/components/pricing'; // Importe ton composant Pricing existant

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20"> 
        {/* On réutilise le composant de la landing page */}
        <Pricing />
        
        <div className="text-center pb-20">
          <a href="/dashboard" className="text-slate-400 hover:text-primary font-medium underline">
            Retour au menu principal
          </a>
        </div>
      </div>
    </div>
  );
}