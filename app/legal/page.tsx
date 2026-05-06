"use client";
import Navbar from '@/components/navbar';

export default function Legal() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto pt-32 px-4 pb-20 prose prose-slate">
        <h1 className="text-4xl font-black mb-8 italic">Mentions Légales</h1>
        
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">1. Édition du service</h2>
          <p className="text-gray-600">AutoBI est un service d'analyse de données automatisé opéré à Pointe-Noire, République du Congo.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">2. Paiements</h2>
          <p className="text-gray-600">Les transactions sont sécurisées et traitées par OpenPay Congo. Les opérateurs supportés incluent MTN Mobile Money et Airtel Money.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">3. Protection des données</h2>
          <p className="text-gray-600">Vos fichiers de base de données (SQL, CSV) ne sont traités que pour la génération de vos analyses. Aucun stockage permanent des données brutes n'est effectué après traitement, sauf demande explicite de l'utilisateur.</p>
        </section>
      </div>
    </div>
  );
}