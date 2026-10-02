"use client";

import React, { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  X,
} from "lucide-react";

interface AuthOverlayProps {
  onAuthenticated?: () => void;
}

export default function AuthOverlay({
  onAuthenticated,
}: AuthOverlayProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("autobi_user_id");

    if (userId) {
      setIsAuthenticated(true);
      onAuthenticated?.();
    }
  }, [onAuthenticated]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            data.detail ||
            "Une erreur est survenue."
        );
        return;
      }

      if (!data.user?.id) {
        setError("Impossible de récupérer les informations du compte.");
        return;
      }

      // Sauvegarde de l'utilisateur
      localStorage.setItem(
        "autobi_user_id",
        String(data.user.id)
      );

      if (data.user.email) {
        localStorage.setItem(
          "autobi_user_email",
          data.user.email
        );
      }

      // Si ton API retourne un token, on peut également le sauvegarder
      if (data.token) {
        localStorage.setItem(
          "autobi_access_token",
          data.token
        );
      }

      setIsAuthenticated(true);

      // Permet à la page parente de réagir
      onAuthenticated?.();

    } catch (error) {
      console.error("Erreur authentification :", error);

      setError(
        "Impossible de joindre le serveur. Vérifiez votre connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">

      {/* Fond sombre + flou */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      {/* Carte d'authentification */}
      <div className="relative z-10 w-full max-w-[460px] max-h-[95vh] overflow-y-auto bg-white rounded-[2.5rem] p-7 md:p-10 shadow-2xl border border-white/20">

        {/* Barre supérieure */}
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

        {/* Icône */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-5">
            <ShieldCheck
              size={32}
              className="text-primary"
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-dark-text mb-2">
            {mode === "register"
              ? "Créer un compte"
              : "Bon retour !"}
          </h1>

          <p className="text-gray-500 font-medium text-sm md:text-base px-2">
            {mode === "register"
              ? "Créez votre compte pour accéder à AutoBI."
              : "Connectez-vous pour accéder à votre espace AutoBI."}
          </p>
        </div>

        {/* Badge inscription */}
        {mode === "register" && (
          <div className="flex items-center justify-center gap-2 bg-green-50 text-primary text-[10px] md:text-[11px] font-black p-3 rounded-2xl mb-6 border border-green-100">
            <CheckCircle2 size={16} />
            🎁 5 JETONS GRATUITS À L'INSCRIPTION
          </div>
        )}

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Prénom / Nom */}
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">

              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={17}
                />

                <input
                  required
                  type="text"
                  placeholder="Prénom"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full h-13 px-4 pl-11 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-dark-text"
                />
              </div>

              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={17}
                />

                <input
                  required
                  type="text"
                  placeholder="Nom"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lastName: e.target.value,
                    })
                  }
                  className="w-full h-13 px-4 pl-11 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-dark-text"
                />
              </div>

            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              required
              type="email"
              placeholder="Email professionnel"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="w-full h-14 pl-14 pr-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-dark-text"
            />
          </div>

          {/* Mot de passe */}
          <div className="relative">
            <Lock
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              required
              type="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              className="w-full h-14 pl-14 pr-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-dark-text"
            />
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
              {error}
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-3 bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2
                  className="animate-spin"
                  size={20}
                />
                <span>
                  {mode === "register"
                    ? "Création..."
                    : "Connexion..."}
                </span>
              </>
            ) : (
              <>
                {mode === "register"
                  ? "Créer mon compte"
                  : "Me connecter"}
              </>
            )}
          </button>

        </form>

        {/* Changement login/register */}
        <div className="mt-7 pt-6 border-t border-gray-100 text-center">

          <p className="text-sm text-gray-500 font-medium">

            {mode === "register"
              ? "Vous avez déjà un compte ?"
              : "Pas encore de compte ?"}

            <button
              type="button"
              onClick={() => {
                setMode(
                  mode === "login"
                    ? "register"
                    : "login"
                );
                setError("");
              }}
              className="ml-2 font-black text-primary hover:underline underline-offset-4"
            >
              {mode === "login"
                ? "S'inscrire"
                : "Se connecter"}
            </button>

          </p>

        </div>


      </div>
    </div>
  );
}