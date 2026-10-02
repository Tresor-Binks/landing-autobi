"use client";

import Image from 'next/image';
import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  BarChart3, 
  Zap, 
  Brain, 
  Lock, 
  FileDown, 
  MessageSquare, 
  Play, 
  ChevronDown, 
  X, 
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Loader2,
  MousePointerClick
} from 'lucide-react';

// --- COMPOSANTS INTERNES ---

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Vérifie si l'utilisateur est connecté au chargement
    const userId = localStorage.getItem("autobi_user_id");
    setIsLoggedIn(!!userId);
  }, []);

  const handleAuthAction = () => {
    if (isLoggedIn) {
      // Action de déconnexion
      localStorage.removeItem("autobi_user_id");
      localStorage.removeItem("autobi_user_email");
      setIsLoggedIn(false);
      window.location.href = "/";
    } else {
      // Redirection vers la page de connexion
      window.location.href = "/auth";
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
            <Image 
              src="/logo.png" 
              alt="AutoBI Logo" 
              width={40} 
              height={40} 
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-black tracking-tighter text-dark-text uppercase">
            AUTO BI
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
          <a href="#problem" className="hover:text-primary transition-colors">
            Le Problème
          </a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">
            Comment ça marche
          </a>
          <a href="#pricing" className="hover:text-primary transition-colors">
            Tarifs
          </a>
          <a href="#faq" className="hover:text-primary transition-colors">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleAuthAction}
            className="hidden sm:inline-block px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-dark-text transition-colors cursor-pointer"
          >
            {isLoggedIn ? "Déconnexion" : "Connexion"}
          </button>
          
          {isLoggedIn ? 
          
          <a 
            href="/dashboard" 
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-full transition-all shadow-md shadow-primary/20 active:scale-95"
          >
            Démarrer
          </a>
          : 
          <a 
            href="/auth" 
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-full transition-all shadow-md shadow-primary/20 active:scale-95"
          >
            Démarrer
          </a>
          }

        </div>
      </div>
    </nav>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span 
          className={`text-lg font-bold transition-colors ${
            isOpen ? 'text-primary' : 'text-dark-text'
          }`}
        >
          {question}
        </span>

        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`} 
        />
      </button>

      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-60 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-gray-500 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

// --- PAGE PRINCIPALE ---

export default function LandingPage() {

  // État pour gérer le chargement par bouton
  const [loadingAmount, setLoadingAmount] = useState<number | null>(null);

  // État pour afficher la démo vidéo
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Fonction de gestion du paiement
  const handlePayment = async (amount: number, description: string) => {
    if (loadingAmount !== null) return;

    // Récupération de l'ID utilisateur
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

  const handleStart = () => {
  const userId = localStorage.getItem("autobi_user_id");

  if (userId) {
    window.location.href = "/dashboard";
  } else {
    window.location.href = "/auth";
  }
};

  return (
    <main className="bg-white text-dark-text antialiased selection:bg-primary/10">
      
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          
          <div className="flex justify-center mb-8">
            <span className="px-4 py-1.5 rounded-full bg-green-50 text-primary text-[10px] font-black uppercase tracking-wider border border-green-100 flex items-center gap-2">
              ✨ Analyse en moins d'une minute
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-dark-text mb-8 leading-[1.1]">
            Transformez vos données en <br />
            <span className="text-primary italic underline decoration-4 md:decoration-8 decoration-primary/20 underline-offset-8">
              décisions stratégiques
            </span>.
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            AutoBI combine Python et l'IA générative pour analyser vos fichiers Excel en 30 secondes. Importez, obtenez des insights, prenez de meilleures décisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            
            <button
              onClick={handleStart}
              className="w-full sm:w-auto h-16 px-10 flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer"
            >
              Démarrer gratuitement
            </button>

            {/* BOUTON VOIR LA DÉMO */}
            <button
              onClick={() => setIsDemoOpen(true)}
              className="text-dark-text font-bold hover:text-primary transition-colors flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center group-hover:border-primary transition-colors">
                <Play size={16} fill="currentColor" />
              </div>
              Voir la démo
            </button>

          </div>
          
          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-green-400/20 blur-2xl opacity-50 rounded-4xl"></div>

            <div className="relative aspect-video bg-gray-50 rounded-3xl border-8 border-white shadow-2xl overflow-hidden flex flex-col items-center justify-center group">
              
              <Image 
                src="/dash.png" 
                alt="Aperçu de l'analyse AutoBI" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />

              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>

              <div className="relative z-10 p-8 bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 text-center shadow-xl">
                <BarChart3 
                  size={48} 
                  className="text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-500" 
                />
                <p className="text-dark-text font-black uppercase tracking-widest text-[10px]">
                  Aperçu du Dashboard Interactif
                </p>
              </div>

              <div className="absolute z-20 top-8 right-8 md:top-12 md:right-12 animate-bounce-slow">
                <div className="bg-white p-5 rounded-2xl shadow-2xl border border-green-50 flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                    <TrendingUp size={20} />
                  </div>

                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                      Insight IA Détecté
                    </p>
                    <p className="text-lg font-black text-dark-text leading-tight">
                      Croissance +12%
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="py-20 border-y border-gray-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { val: "30s", lab: "Analyse complète" },
            { val: "100%", lab: "Insights intélligents" },
            { val: "No-Code", lab: "Accessibilité totale" },
            { val: "5", lab: "Jetons gratuits" }
          ].map((s, i) => (
            <div key={i} className="text-center group">
              <p className="text-4xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">
                {s.val}
              </p>
              <p className="text-xs text-gray-400 uppercase font-black tracking-widest">
                {s.lab}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Le Problème */}
      <section id="problem" className="py-32 bg-light-bg px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-black mb-12 tracking-tight leading-tight">
              L'analyse de données est encore{' '}
              <span className="text-red-500 italic">
                trop compliquée.
              </span>
            </h2>

            <div className="space-y-6">
              {[
                { 
                  t: "Complexité technique", 
                  d: "Les outils d'analyse classiques sont réservés aux experts data.", 
                  icon: "🔴" 
                },
                { 
                  t: "Graphiques statiques", 
                  d: "Excel produit souvent des visuels fades et difficiles à interpréter.", 
                  icon: "🔴" 
                },
                { 
                  t: "Décisions retardées", 
                  d: "L'analyse manuelle prend des heures, les opportunités passent.", 
                  icon: "🔴" 
                }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="p-8 bg-white rounded-3xl border border-gray-100 flex gap-6 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <span className="text-2xl">
                    {item.icon}
                  </span>

                  <div>
                    <h4 className="font-black text-xl mb-2 italic">
                      {item.t}
                    </h4>
                    <p className="text-gray-500 leading-relaxed">
                      {item.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="aspect-square bg-white rounded-4xl p-4 shadow-2xl rotate-3 border border-gray-100 overflow-hidden relative group">
              
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
                <Image 
                  src="/pb.png" 
                  alt="Problème analyse Excel" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="how-it-works" className="py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Un workflow de génie en 4 étapes.
          </h2>

          <p className="text-gray-500 text-lg">
            Zéro expertise requise, l'IA s'occupe de tout le gros travail.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              num: "01", 
              t: "Importation", 
              d: "Glissez votre fichier Excel (.xlsx, .csv).", 
              icon: <FileDown /> 
            },
            { 
              num: "02", 
              t: "Scan IA", 
              d: "L'IA analyse les tendances et anomalies.", 
              icon: <Brain /> 
            },
            { 
              num: "03", 
              t: "Sélection", 
              d: "Choisissez les insights qui vous intéressent.", 
              icon: <MousePointerClick /> 
            },
            { 
              num: "04", 
              t: "Dashboard", 
              d: "Explorez vos données interactivement.", 
              icon: <TrendingUp /> 
            }
          ].map((step, i) => (
            <div 
              key={i} 
              className="relative p-10 bg-white rounded-4xl border border-gray-100 hover:border-primary/30 transition-all group"
            >
              <div className="text-primary font-black text-5xl opacity-10 absolute top-6 right-8 group-hover:opacity-20 transition-opacity">
                {step.num}
              </div>

              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                {step.icon}
              </div>

              <h3 className="text-xl font-black mb-3">
                {step.t}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed">
                {step.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-32 bg-light-bg px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { 
              t: "Analyse ultra-rapide", 
              d: "Résultats en moins de 30 secondes grâce à Python + GPT-4o-mini.", 
              icon: <Zap /> 
            },
            { 
              t: "Graphiques interactifs", 
              d: "Bar, Line, Pie, Scatter générés automatiquement pour vous.", 
              icon: <BarChart3 /> 
            },
            { 
              t: "Insights actionnables", 
              d: "L'IA identifie les tendances et propose des recommandations réelles.", 
              icon: <Brain /> 
            },
            { 
              t: "Données sécurisées", 
              d: "Fichiers traités en mémoire et supprimés immédiatement après analyse.", 
              icon: <ShieldCheck /> 
            },
            { 
              t: "Export PDF", 
              d: "Téléchargez votre rapport professionnel en un clic pour vos réunions.", 
              icon: <FileDown /> 
            },
            { 
              t: "Assistant IA", 
              d: "Posez des questions sur vos données en langage naturel (chat).", 
              icon: <MessageSquare /> 
            }
          ].map((f, i) => (
            <div 
              key={i} 
              className="bg-white p-10 rounded-4xl border border-gray-200/50 hover:shadow-2xl transition-all"
            >
              <div className="text-primary mb-6">
                {f.icon}
              </div>

              <h4 className="text-xl font-black mb-4">
                {f.t}
              </h4>

              <p className="text-gray-500 leading-relaxed text-sm">
                {f.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tarifs */}
      <section id="pricing" className="py-32 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Tarification transparente.
          </h2>

          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Paiement via Mobile Money — MTN, Airtel, et autres opérateurs au Congo.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Card 1 */}
          <div className="p-12 rounded-[2.5rem] bg-light-bg border border-gray-100 flex flex-col items-center">
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
                "Export PDF"
              ].map((item) => (
                <li 
                  key={item} 
                  className="flex items-center gap-3 text-gray-600 font-medium"
                >
                  <CheckCircle2 size={18} className="text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePayment(100, "10 Analyses - AutoBI")}
              disabled={loadingAmount !== null}
              className={`
                w-full h-16 flex items-center justify-center gap-3
                border-2 border-dark-text text-dark-text font-black rounded-2xl 
                transition-all active:scale-95 cursor-pointer
                ${loadingAmount === null 
                  ? 'hover:bg-dark-text hover:text-white' 
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
            >
              {loadingAmount === 100 ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Connexion...</span>
                </>
              ) : (
                "Acheter 10 jetons"
              )}
            </button>

            <p className="mt-6 text-xs text-gray-400 font-medium">
              Idéal pour tester et les petits projets
            </p>
          </div>

          {/* Card 2 */}
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
                "Assistant IA illimité"
              ].map((item) => (
                <li 
                  key={item} 
                  className="flex items-center gap-3 text-gray-200 font-medium"
                >
                  <CheckCircle2 size={18} className="text-primary" />
                  {item}
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
                  <span>Préparation du paiement...</span>
                </>
              ) : (
                "Devenir Pro"
              )}
            </button>

            <p className="mt-6 text-xs text-gray-400 font-medium italic text-center">
              Paiement 100% sécurisé via OpenPay Congo • MTN • Airtel
            </p>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-32 bg-light-bg px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { 
              n: "Trésor M.", 
              r: "Analyste de donnée", 
              l: "Pointe-Noire", 
              text: "AutoBI m'a fait gagner 3 heures par semaine sur mes rapports de ventes." 
            },
            { 
              n: "Marie K.", 
              r: "Commerciale", 
              l: "Brazzaville", 
              text: "Même sans formation en data, j'obtiens des insights clairs en quelques secondes." 
            },
            { 
              n: "David N.", 
              r: "Analyste Financier", 
              l: "Pointe-Noire", 
              text: "L'assistant IA est bluffant. Je pose des questions et j'obtiens des réponses précises." 
            }
          ].map((t, i) => (
            <div 
              key={i} 
              className="bg-white p-10 rounded-4xl shadow-sm border border-gray-100 flex flex-col justify-between italic"
            >
              <p className="text-gray-600 mb-8 leading-relaxed">
                "{t.text}"
              </p>

              <div className="not-italic">
                <p className="font-black text-dark-text">
                  {t.n}
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  {t.r}, {t.l}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-16 text-center tracking-tight italic uppercase">
            Questions fréquentes.
          </h2>

          <div className="border-y border-gray-100">
            <FAQItem 
              question="Comment fonctionne AutoBI ?" 
              answer="Vous importez un fichier Excel, notre IA (GPT-4o-mini) analyse la structure, génère des insights pertinents et crée un dashboard interactif en moins de 30 secondes." 
            />

            <FAQItem 
              question="Quels formats de fichiers sont acceptés ?" 
              answer=".xlsx, .xls, .csv jusqu'à 10 Mo par fichier." 
            />

            <FAQItem 
              question="Comment fonctionne le système de jetons ?" 
              answer="Chaque analyse consomme des jetons selon la taille du fichier (1 jeton = 10 Ko). Vous recevez 5 jetons gratuits à l'inscription." 
            />

            <FAQItem 
              question="Mes données sont-elles sécurisées ?" 
              answer="Oui. Vos fichiers sont traités en mémoire vive et supprimés immédiatement après génération du rapport. Nous ne stockons pas vos données brutes." 
            />

            <FAQItem 
              question="Comment payer via Mobile Money ?" 
              answer="Après avoir cliqué sur 'Acheter', vous êtes redirigé vers OpenPay Congo où vous choisissez MTN ou Airtel pour finaliser le paiement." 
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4 bg-primary mx-4 my-24 rounded-[3rem] text-center text-white shadow-2xl shadow-primary/40">
        <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
          Prêt à transformer vos données ?
        </h2>

        <p className="text-white/80 text-xl mb-12 font-medium">
          Créez votre compte gratuitement et obtenez 5 jetons pour commencer.
        </p>

        <button
          onClick={handleStart}
          className="inline-flex h-16 px-12 bg-white text-primary font-black rounded-2xl items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/10 cursor-pointer"
        >
          Démarrer maintenant — C'est gratuit
        </button>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl font-black tracking-tighter uppercase">
                AutoBI
              </span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              L'analyse de données intelligente, accessible à toutes les entreprises du Congo et d'Afrique.
            </p>

            <p className="text-xs font-bold uppercase tracking-widest text-dark-text">
              © 2026 Pointe-Noire, Congo
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            
            <div>
              <p className="font-black mb-6 text-sm uppercase tracking-widest">
                Produit
              </p>

              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li>
                  <a 
                    href="#how-it-works" 
                    className="hover:text-primary transition-colors"
                  >
                    Comment ça marche
                  </a>
                </li>

                <li>
                  <a 
                    href="#pricing" 
                    className="hover:text-primary transition-colors"
                  >
                    Tarifs
                  </a>
                </li>

                <li>
                  <Link 
                    href="/roadmap" 
                    className="hover:text-primary transition-colors"
                  >
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-black mb-6 text-sm uppercase tracking-widest">
                Support
              </p>

              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li>
                  <a 
                    href="#faq" 
                    className="hover:text-primary transition-colors"
                  >
                    FAQ
                  </a>
                </li>

                <li>
                  <Link 
                    href="/contact" 
                    className="hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>

                <li>
                  <Link 
                    href="/legal" 
                    className="hover:text-primary transition-colors"
                  >
                    Légal
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="p-6 bg-light-bg rounded-2xl border border-gray-100">
                
                <p className="text-[10px] font-black uppercase text-gray-400 mb-4">
                  Paiement sécurisé
                </p>

                <div className="flex gap-4 items-center">
                  <div className="flex gap-4 items-center">
                    
                    {/* Logo MTN */}
                    <div className="w-12 h-8 relative rounded overflow-hidden bg-white border border-gray-100 shadow-sm">
                      <Image 
                        src="/mtn.png" 
                        alt="MTN Mobile Money" 
                        fill 
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Logo Airtel */}
                    <div className="w-12 h-8 relative rounded overflow-hidden bg-white border border-gray-100 shadow-sm">
                      <Image 
                        src="/airtel.png" 
                        alt="Airtel Money" 
                        fill 
                        className="object-contain p-1"
                      />
                    </div>

                  </div>
                </div>

                <p className="mt-4 text-[10px] text-gray-400 font-bold italic leading-tight">
                  via OpenPay Congo
                </p>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* MODALE VIDÉO - AUTOBI_DEMO.mp4                           */}
      {/* ========================================================= */}

      {isDemoOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsDemoOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Bouton fermer */}
            <button
              onClick={() => setIsDemoOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Fermer la démonstration"
            >
              <X size={22} />
            </button>

            {/* Vidéo */}
            <video
              src="/AUTOBI_DEMO.mp4"
              controls
              autoPlay
              playsInline
              className="w-full aspect-video object-contain"
            >
              Votre navigateur ne prend pas en charge la lecture des vidéos.
            </video>

          </div>
        </div>
      )}

      {/* Style Animations personnalisées */}
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-20px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>

    </main>
  );
}