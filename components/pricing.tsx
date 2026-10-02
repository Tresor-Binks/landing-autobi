"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  CreditCard,
  CalendarDays,
} from "lucide-react";

const Pricing = () => {
  const [loadingAmount, setLoadingAmount] = useState<number | null>(null);

  // ============================================================
  // INFORMATIONS UTILISATEUR
  // ============================================================

  const [userId, setUserId] = useState<string | null>(null);

  const [planType, setPlanType] = useState<
    "PAY_AS_YOU_GO" | "MONTHLY_UNLIMITED"
  >("PAY_AS_YOU_GO");

  const [tokenBalance, setTokenBalance] = useState(0);

  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);

  const [daysRemaining, setDaysRemaining] = useState(0);

  const [loadingUser, setLoadingUser] = useState(true);

  // ============================================================
  // RÉCUPÉRATION DES INFORMATIONS UTILISATEUR
  // ============================================================

  useEffect(() => {
    const loadUserData = async () => {
      const storedUserId = localStorage.getItem("autobi_user_id");

      // Utilisateur non connecté
      if (!storedUserId) {
        setLoadingUser(false);
        return;
      }

      setUserId(storedUserId);

      try {
        const res = await fetch(
          `/api/auth?userId=${encodeURIComponent(storedUserId)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ||
              "Impossible de récupérer les informations utilisateur."
          );
        }

        if (data.user) {
          // Type d'abonnement
          setPlanType(
            data.user.planType === "MONTHLY_UNLIMITED"
              ? "MONTHLY_UNLIMITED"
              : "PAY_AS_YOU_GO"
          );

          // Nombre de crédits
          setTokenBalance(Number(data.user.tokenBalance || 0));

          // Date d'expiration de l'abonnement
          setPlanExpiresAt(data.user.planExpiresAt || null);
        }
      } catch (error) {
        console.error(
          "Erreur récupération informations utilisateur:",
          error
        );
      } finally {
        setLoadingUser(false);
      }
    };

    loadUserData();
  }, []);

  // ============================================================
  // CALCUL DES JOURS RESTANTS
  // ============================================================

  useEffect(() => {
    if (
      planType !== "MONTHLY_UNLIMITED" ||
      !planExpiresAt
    ) {
      setDaysRemaining(0);
      return;
    }

    const calculateDaysRemaining = () => {
      const expiration = new Date(planExpiresAt);
      const now = new Date();

      const difference =
        expiration.getTime() - now.getTime();

      const days = Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      );

      setDaysRemaining(Math.max(0, days));
    };

    calculateDaysRemaining();

    // Actualisation toutes les heures
    const interval = setInterval(
      calculateDaysRemaining,
      60 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [planType, planExpiresAt]);

  // ============================================================
  // STATUT ABONNEMENT
  // ============================================================

  const subscriptionExpired =
    planType === "MONTHLY_UNLIMITED" &&
    (!planExpiresAt || daysRemaining <= 0);

  const isSubscriptionActive =
    planType === "MONTHLY_UNLIMITED" &&
    !subscriptionExpired;

  // ============================================================
  // PAIEMENT
  // ============================================================

  const handlePayment = async (
    amount: number,
    description: string
  ) => {
    if (loadingAmount !== null) return;

    const storedUserId =
      localStorage.getItem("autobi_user_id");

    if (!storedUserId) {
      window.location.href = "/auth";
      return;
    }

    setLoadingAmount(amount);

    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description,
          userId: storedUserId,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(
          data.error ||
            "Erreur lors de l'initialisation du paiement."
        );

        setLoadingAmount(null);
      }
    } catch (error) {
      console.error(
        "Erreur de paiement:",
        error
      );

      alert(
        "Impossible de contacter le serveur de paiement."
      );

      setLoadingAmount(null);
    }
  };

  // ============================================================
  // FORMATAGE DE LA DATE
  // ============================================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <section
      id="pricing"
      className="py-32 px-4 bg-white"
    >
      <div className="max-w-5xl mx-auto">

        {/* ======================================================
            TITRE
        ====================================================== */}

        <div className="text-center mb-12">

          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Tarification transparente.
          </h2>

          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Paiement via Mobile Money — MTN, Airtel,
            et autres opérateurs au Congo.
          </p>

        </div>

        {/* ======================================================
            INFORMATIONS COMPTE
        ====================================================== */}

        {userId && !loadingUser && (
          <div className="mb-12">

            <div className="bg-slate-50 border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                {/* FORMULE ACTUELLE */}

                <div>

                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Votre formule actuelle
                  </p>

                  <div className="flex items-center gap-3">

                    <div
                      className={`w-3 h-3 rounded-full ${
                        planType === "MONTHLY_UNLIMITED"
                          ? subscriptionExpired
                            ? "bg-red-500"
                            : "bg-green-500 animate-pulse"
                          : "bg-green-500"
                      }`}
                    />

                    <h3 className="text-2xl font-black text-dark-text">

                      {planType === "MONTHLY_UNLIMITED"
                        ? "Abonnement Pro"
                        : "Pay-as-you-go"}

                    </h3>

                  </div>

                  {/* STATUT */}

                  <p
                    className={`mt-2 text-xs font-bold ${
                      planType === "MONTHLY_UNLIMITED"
                        ? subscriptionExpired
                          ? "text-red-500"
                          : "text-green-600"
                        : "text-green-600"
                    }`}
                  >

                    {planType === "MONTHLY_UNLIMITED"
                      ? subscriptionExpired
                        ? "Abonnement expiré"
                        : "Abonnement actif"
                      : "Crédits disponibles"}

                  </p>

                </div>

                {/* =================================================
                    PAY AS YOU GO
                ================================================= */}

                {planType === "PAY_AS_YOU_GO" && (

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">

                      <CreditCard
                        size={22}
                        className="text-primary"
                      />

                    </div>

                    <div>

                      <p className="text-3xl font-black text-primary">
                        {tokenBalance}
                      </p>

                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        crédits disponibles
                      </p>

                    </div>

                  </div>

                )}

                {/* =================================================
                    ABONNEMENT PRO
                ================================================= */}

                {planType === "MONTHLY_UNLIMITED" && (

                  <div className="flex items-center gap-4">

                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        subscriptionExpired
                          ? "bg-red-100"
                          : "bg-green-100"
                      }`}
                    >

                      <CalendarDays
                        size={22}
                        className={
                          subscriptionExpired
                            ? "text-red-500"
                            : "text-primary"
                        }
                      />

                    </div>

                    <div>

                      {subscriptionExpired ? (

                        <>
                          <p className="text-xl font-black text-red-500">
                            Expiré
                          </p>

                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            Abonnement terminé
                          </p>
                        </>

                      ) : (

                        <>
                          <p className="text-3xl font-black text-primary">
                            {daysRemaining}
                          </p>

                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            jours restants
                          </p>
                        </>

                      )}

                    </div>

                  </div>

                )}

              </div>

              {/* =================================================
                  DATE EXPIRATION
              ================================================= */}

              {planType === "MONTHLY_UNLIMITED" &&
                planExpiresAt && (

                  <div className="mt-6 pt-5 border-t border-gray-200">

                    <p className="text-xs text-gray-400 font-medium">

                      {subscriptionExpired
                        ? "Votre abonnement a expiré le "
                        : "Votre abonnement expire le "}

                      <span className="font-black text-gray-600">
                        {formatDate(planExpiresAt)}
                      </span>

                    </p>

                  </div>

                )}

            </div>

          </div>
        )}

        {/* ======================================================
            CHARGEMENT INFORMATIONS
        ====================================================== */}

        {loadingUser && userId && (

          <div className="mb-12 flex justify-center">

            <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">

              <Loader2
                size={18}
                className="animate-spin"
              />

              Chargement de votre compte...

            </div>

          </div>

        )}

        {/* ======================================================
            OFFRES
        ====================================================== */}

        <div className="grid md:grid-cols-2 gap-8">

          {/* ====================================================
              CARD PAY-AS-YOU-GO
          ==================================================== */}

          <div className="p-12 rounded-[2.5rem] bg-slate-50 border border-gray-100 flex flex-col items-center">

            <span className="bg-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-200 mb-8">
              Pay-as-you-go
            </span>

            <div className="flex items-baseline gap-1 mb-8">

              <span className="text-6xl font-black">
                3 000
              </span>

              <span className="text-xl font-bold text-gray-400 uppercase tracking-tighter">
                Xaf
              </span>

            </div>

            <ul className="w-full space-y-4 mb-12">

              {[
                "10 analyses IA",
                "Accès complet aux outils",
                "Graphiques interactifs",
                "Export PDF",
              ].map((item) => (

                <li
                  key={item}
                  className="flex items-center gap-3 text-gray-600 font-medium"
                >

                  <CheckCircle2
                    size={18}
                    className="text-primary"
                  />

                  {item}

                </li>

              ))}

            </ul>

            <button
              onClick={() =>
                handlePayment(
                  100,
                  "10 Analyses - AutoBI"
                )
              }
              disabled={loadingAmount !== null}
              className={`
                w-full h-16 flex items-center justify-center gap-3
                border-2 border-dark-text text-dark-text font-black rounded-2xl
                transition-all active:scale-95 cursor-pointer
                ${
                  loadingAmount === null
                    ? "hover:bg-dark-text hover:text-white"
                    : "opacity-50 cursor-not-allowed"
                }
              `}
            >

              {loadingAmount === 100 ? (

                <>
                  <Loader2
                    className="animate-spin"
                    size={20}
                  />

                  <span>
                    Connexion...
                  </span>
                </>

              ) : (

                "Acheter 10 jetons"

              )}

            </button>

            <p className="mt-6 text-xs text-gray-400 font-medium">
              Idéal pour tester et les petits projets
            </p>

          </div>

          {/* ====================================================
              CARD PRO
          ==================================================== */}

          <div className="p-12 rounded-[2.5rem] bg-dark-text text-white flex flex-col items-center relative overflow-hidden shadow-2xl shadow-primary/10">

            <div className="absolute top-8 right-8 bg-primary text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest animate-pulse">
              Recommandé
            </div>

            <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-white/10 mb-8">
              Abonnement Pro
            </span>

            <div className="flex items-baseline gap-1 mb-8">

              <span className="text-6xl font-black">
                20 000
              </span>

              <span className="text-xl font-bold text-gray-400 uppercase tracking-tighter">
                Xaf / mois
              </span>

            </div>

            <ul className="w-full space-y-4 mb-12">

              {[
                "Analyses illimitées",
                "Support prioritaire 24/7",
                "Toutes les fonctionnalités",
                "Assistant IA illimité",
              ].map((item) => (

                <li
                  key={item}
                  className="flex items-center gap-3 text-gray-200 font-medium"
                >

                  <CheckCircle2
                    size={18}
                    className="text-primary"
                  />

                  {item}

                </li>

              ))}

            </ul>

            <button
              onClick={() =>
                handlePayment(
                  20000,
                  "Plan Pro Mensuel - AutoBI"
                )
              }
              disabled={loadingAmount !== null}
              className="
                w-full h-16 flex items-center justify-center gap-3
                bg-primary hover:bg-primary-hover text-white font-black rounded-2xl
                transition-all active:scale-95 shadow-xl shadow-primary/20
                cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
              "
            >

              {loadingAmount === 20000 ? (

                <>
                  <Loader2
                    className="animate-spin"
                    size={20}
                  />

                  <span>
                    Préparation...
                  </span>
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

      </div>
    </section>
  );
};

export default Pricing;