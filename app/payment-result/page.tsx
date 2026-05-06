"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ArrowRight, RefreshCcw, Home } from 'lucide-react';
import React, { Suspense } from 'react';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status');

  return (
    <div className="max-w-md w-full bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
      {status === 'success' ? (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-50 text-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
            <CheckCircle2 size={56} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-dark-text mb-4">Paiement réussi !</h1>
          <p className="text-gray-500 font-medium leading-relaxed mb-10">
            Félicitations ! Vos jetons ont été ajoutés à votre compte. Vous pouvez maintenant transformer vos fichiers Excel en dashboards.
          </p>
          <a 
            href="https://app.autobi-cg.com" 
            className="w-full h-16 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            Lancer une analyse <ArrowRight size={20} />
          </a>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle size={56} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-dark-text mb-4">Paiement échoué</h1>
          <p className="text-gray-500 font-medium leading-relaxed mb-10">
            La transaction a été interrompue ou refusée par l'opérateur. Aucun montant n'a été débité de votre compte.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push('/#pricing')}
              className="w-full h-16 bg-dark-text hover:bg-black text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <RefreshCcw size={20} /> Réessayer le paiement
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full h-16 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
            >
              <Home size={20} /> Retour à l'accueil
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <main className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-6 selection:bg-primary/20">
      <Suspense fallback={<div className="font-black text-primary animate-pulse italic uppercase">Chargement du résultat...</div>}>
        <PaymentContent />
      </Suspense>
    </main>
  );
}