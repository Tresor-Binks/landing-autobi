"use client";
import Navbar from '@/components/navbar';
import { Mail, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-32 px-4">
        <div className="bg-dark-text text-white p-12 rounded-[2.5rem] grid md:grid-cols-2 gap-12">
          <div>
            <h1 className="text-4xl font-black mb-6">Parlons de vos données.</h1>
            <p className="text-gray-400">Une question sur les tarifs ou un besoin d'accompagnement sur Pointe-Noire ?</p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <Mail className="text-primary" /> <span>contact@autobi-app.com</span>
              </div>
              <div className="flex items-center gap-4">
                <MessageSquare className="text-primary" /> <span>Support via WhatsApp disponible</span>
              </div>
            </div>
          </div>
          <form className="space-y-4">
            <input type="text" placeholder="Nom" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none" />
            <textarea placeholder="Votre message" rows={4} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"></textarea>
            <button className="w-full py-4 bg-primary rounded-xl font-bold hover:bg-primary-hover transition-all">Envoyer</button>
          </form>
        </div>
      </div>
    </div>
  );
}