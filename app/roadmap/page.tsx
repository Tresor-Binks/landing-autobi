"use client";
import Navbar from '@/components/navbar';
import { CheckCircle2, Clock, Star } from 'lucide-react';

export default function Roadmap() {
  const steps = [
    { status: "Terminé", title: "Analyse IA Core", desc: "Moteur d'analyse SQL et génération de graphiques.", icon: <CheckCircle2 className="text-green-500" /> },
    { status: "En cours", title: "Version Desktop Windows", desc: "Build de l'application native pour plus de performance.", icon: <Clock className="text-orange-500" /> },
    { status: "À venir", title: "Connecteurs Directs", desc: "Liaison directe avec Google Sheets, Excel et PostgreSQL.", icon: <Star className="text-primary" /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto pt-32 px-4 pb-20">
        <h1 className="text-4xl font-black mb-8">Roadmap AutoBI</h1>
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors">
              <div className="mt-1">{step.icon}</div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{step.status}</span>
                <h3 className="text-xl font-bold mt-1">{step.title}</h3>
                <p className="text-gray-500 mt-2">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}