"use client";

import {
  useSearchParams,
  useRouter
} from 'next/navigation';

import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCcw,
  Home,
  Loader2
} from 'lucide-react';

import React, {
  Suspense,
  useEffect,
  useState
} from 'react';

type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'error';

function PaymentContent() {

  const searchParams = useSearchParams();
  const router = useRouter();

  const statusFromUrl =
    searchParams.get('status');

  const paymentId =
    searchParams.get('payment_id');

  const [status, setStatus] =
    useState<PaymentStatus>('pending');

  const [error, setError] =
    useState('');

  /*
  ============================================================
  VÉRIFICATION DU PAIEMENT
  ============================================================
  */

  useEffect(() => {

    if (!paymentId) {
      setStatus(
        statusFromUrl === 'success'
          ? 'pending'
          : 'error'
      );

      return;
    }

    let cancelled = false;
    let attempts = 0;

    const checkPayment = async () => {

      try {

        const res = await fetch(
          `/api/payments/status?payment_id=${paymentId}`,
          {
            cache: 'no-store'
          }
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ||
            'Impossible de vérifier le paiement.'
          );
        }

        const paymentStatus =
          data.payment?.status;

        if (cancelled) return;

        if (
          paymentStatus === 'completed' ||
          paymentStatus === 'success'
        ) {
          setStatus('completed');
          return;
        }

        if (
          paymentStatus === 'failed'
        ) {
          setStatus('failed');
          return;
        }

        if (
          paymentStatus === 'cancelled'
        ) {
          setStatus('cancelled');
          return;
        }

        /*
        Paiement encore pending.
        */

        attempts++;

        /*
        On vérifie pendant environ 1 minute.
        */

        if (attempts < 20) {

          setTimeout(
            checkPayment,
            100
          );

        } else {

          setStatus('pending');
        }

      } catch (err: any) {

        console.error(
          'Erreur vérification paiement:',
          err
        );

        if (!cancelled) {

          setError(
            err?.message ||
            'Impossible de vérifier le paiement.'
          );

          setStatus('error');
        }
      }
    };

    checkPayment();

    return () => {
      cancelled = true;
    };

  }, [paymentId, statusFromUrl]);

  /*
  ============================================================
  PAIEMENT EN COURS
  ============================================================
  */

  if (status === 'pending') {

    return (
      <div className="animate-in fade-in zoom-in duration-500">

        <div className="w-24 h-24 bg-green-50 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
          <Loader2
            size={50}
            className="animate-spin"
          />
        </div>

        <h1 className="text-3xl font-black text-dark-text mb-4">
          Vérification du paiement...
        </h1>

        <p className="text-gray-500 font-medium leading-relaxed mb-10">
          Votre paiement est en cours de confirmation.
          Veuillez patienter quelques secondes.
        </p>

        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          Ne fermez pas cette page
        </p>

      </div>
    );
  }

  /*
  ============================================================
  PAIEMENT RÉUSSI
  ============================================================
  */

  if (status === 'completed') {

    return (
      <div className="animate-in fade-in zoom-in duration-500">

        <div className="w-24 h-24 bg-green-50 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2
            size={56}
            strokeWidth={2.5}
          />
        </div>

        <h1 className="text-3xl font-black text-dark-text mb-4">
          Paiement réussi !
        </h1>

        <p className="text-gray-500 font-medium leading-relaxed mb-10">
          Votre paiement a été confirmé et votre compte
          a été automatiquement mis à jour.
        </p>

        <a
          href="https://app.autobi-cg.com"
          className="w-full h-16 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95"
        >
          Lancer une analyse
          <ArrowRight size={20} />
        </a>

      </div>
    );
  }

  /*
  ============================================================
  PAIEMENT ÉCHOUÉ
  ============================================================
  */

  if (
    status === 'failed' ||
    status === 'cancelled'
  ) {

    return (
      <div className="animate-in fade-in zoom-in duration-500">

        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">

          <XCircle
            size={56}
            strokeWidth={2.5}
          />

        </div>

        <h1 className="text-3xl font-black text-dark-text mb-4">
          Paiement non effectué
        </h1>

        <p className="text-gray-500 font-medium leading-relaxed mb-10">
          La transaction a été interrompue, refusée ou annulée.
          Aucun crédit n'a été ajouté à votre compte.
        </p>

        <div className="flex flex-col gap-3">

          <button
            onClick={() =>
              router.push('/#pricing')
            }
            className="w-full h-16 bg-dark-text hover:bg-black text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <RefreshCcw size={20} />
            Réessayer le paiement
          </button>

          <button
            onClick={() =>
              router.push('/')
            }
            className="w-full h-16 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
          >
            <Home size={20} />
            Retour à l'accueil
          </button>

        </div>

      </div>
    );
  }

  /*
  ============================================================
  ERREUR
  ============================================================
  */

  return (
    <div className="animate-in fade-in zoom-in duration-500">

      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">

        <XCircle
          size={56}
          strokeWidth={2.5}
        />

      </div>

      <h1 className="text-3xl font-black text-dark-text mb-4">
        Vérification impossible
      </h1>

      <p className="text-gray-500 font-medium leading-relaxed mb-10">
        {error ||
          "Nous n'avons pas pu confirmer l'état de votre paiement."}
      </p>

      <div className="flex flex-col gap-3">

        <button
          onClick={() =>
            window.location.reload()
          }
          className="w-full h-16 bg-dark-text text-white font-black rounded-2xl flex items-center justify-center gap-3"
        >
          <RefreshCcw size={20} />
          Vérifier à nouveau
        </button>

        <button
          onClick={() =>
            router.push('/')
          }
          className="w-full h-16 bg-gray-50 text-gray-500 font-bold rounded-2xl flex items-center justify-center gap-3"
        >
          <Home size={20} />
          Retour à l'accueil
        </button>

      </div>

    </div>
  );
}

export default function PaymentResultPage() {

  return (
    <main className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-6 selection:bg-primary/20">

      <div className="max-w-md w-full bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden">

        <Suspense
          fallback={
            <div className="font-black text-primary animate-pulse italic uppercase">
              Chargement du résultat...
            </div>
          }
        >
          <PaymentContent />
        </Suspense>

      </div>

    </main>
  );
}