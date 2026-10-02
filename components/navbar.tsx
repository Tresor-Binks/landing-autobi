"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ============================================================
  // RÉCUPÉRATION DES INFORMATIONS UTILISATEUR
  // ============================================================
  useEffect(() => {
    const loadUser = async () => {
      const userId = localStorage.getItem("autobi_user_id");

      if (!userId) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      setIsLoggedIn(true);

      try {
        const res = await fetch(`/api/auth?userId=${userId}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Impossible de récupérer l'utilisateur");
        }

        const data = await res.json();

        if (data.user) {
          setUser({
            id: String(data.user.id),
            email: data.user.email || "",
            firstName: data.user.firstName || data.user.first_name || "",
            lastName: data.user.lastName || data.user.last_name || "",
          });
        }
      } catch (error) {
        console.error("Erreur récupération utilisateur navbar :", error);

        // Fallback avec les données éventuellement déjà stockées
        const email = localStorage.getItem("autobi_user_email");

        if (email) {
          setUser({
            id: userId,
            email,
            firstName: "",
            lastName: "",
          });
        }
      }
    };

    loadUser();
  }, []);

  // ============================================================
  // INITIALLES DE L'AVATAR
  // ============================================================
  const getInitials = () => {
    if (!user) return "?";

    const first = user.firstName?.trim();
    const last = user.lastName?.trim();

    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }

    if (first) {
      return first.substring(0, 2).toUpperCase();
    }

    if (last) {
      return last.substring(0, 2).toUpperCase();
    }

    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return "?";
  };

  // ============================================================
  // NOM AFFICHÉ
  // ============================================================
  const getDisplayName = () => {
    if (!user) return "";

    const fullName = `${user.firstName} ${user.lastName}`.trim();

    if (fullName) return fullName;

    return user.email;
  };

  // ============================================================
  // DÉCONNEXION
  // ============================================================
  const handleLogout = () => {
    localStorage.removeItem("autobi_user_id");
    localStorage.removeItem("autobi_user_email");

    setUser(null);
    setIsLoggedIn(false);
    setShowUserMenu(false);

    window.location.href = "/";
  };

  // ============================================================
  // AFFICHAGE
  // ============================================================
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">

        {/* ======================================================
            LOGO
        ====================================================== */}
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity shrink-0"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
            <Image
              src="/logo.png"
              alt="AutoBI Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>

          <span className="hidden xs:inline text-xl sm:text-2xl font-black tracking-tighter text-dark-text uppercase">
            AUTO BI
          </span>
        </Link>

        {/* ======================================================
            NAVIGATION DESKTOP
        ====================================================== */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-bold text-gray-500">
          <a
            href="/#problem"
            className="hover:text-primary transition-colors"
          >
            Le Problème
          </a>

          <a
            href="/#how-it-works"
            className="hover:text-primary transition-colors"
          >
            Comment ça marche
          </a>

          <a
            href="/#pricing"
            className="hover:text-primary transition-colors"
          >
            Tarifs
          </a>

          <a
            href="/#faq"
            className="hover:text-primary transition-colors"
          >
            FAQ
          </a>
        </div>

        {/* ======================================================
            ACTIONS
        ====================================================== */}
        <div className="flex items-center gap-2 sm:gap-3">

          {!isLoggedIn ? (
            <>
              {/* Connexion */}
              <Link
                href="/auth"
                className="hidden sm:inline-flex px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-dark-text transition-colors"
              >
                Connexion
              </Link>

              {/* CTA */}
              <Link
                href="/auth"
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-full transition-all shadow-md shadow-primary/20 active:scale-95"
              >
                Démarrer
              </Link>
            </>
          ) : (
            <>
              {/* =================================================
                  BLOC UTILISATEUR
              ================================================= */}
              <div className="relative">

                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="
                    flex items-center gap-2.5
                    px-2 sm:px-3 py-1.5
                    rounded-full
                    hover:bg-gray-50
                    transition-all
                    cursor-pointer
                    max-w-[190px] sm:max-w-[240px]
                  "
                >

                  {/* AVATAR */}
                  <div
                    className="
                      w-9 h-9
                      sm:w-10 sm:h-10
                      shrink-0
                      rounded-full
                      bg-gradient-to-br
                      from-primary
                      to-green-600
                      text-white
                      flex items-center justify-center
                      font-black
                      text-xs sm:text-sm
                      uppercase
                      shadow-md
                      shadow-primary/20
                    "
                  >
                    {getInitials()}
                  </div>

                  {/* NOM */}
                  <div className="hidden sm:flex flex-col items-start min-w-0">
                    <span
                      className="
                        text-sm
                        font-black
                        text-dark-text
                        truncate
                        max-w-[130px] lg:max-w-[150px]
                      "
                      title={getDisplayName()}
                    >
                      {getDisplayName()}
                    </span>

                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Mon compte
                    </span>
                  </div>

                  {/* CHEVRON */}
                  <svg
                    className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </button>

                {/* =================================================
                    MENU UTILISATEUR
                ================================================= */}
                {showUserMenu && (
                  <div
                    className="
                      absolute
                      right-0
                      top-[calc(100%+10px)]
                      w-72
                      bg-white
                      rounded-2xl
                      border
                      border-gray-100
                      shadow-2xl
                      shadow-black/10
                      p-2
                      animate-in
                      fade-in
                      slide-in-from-top-2
                      duration-200
                    "
                  >

                    {/* Informations */}
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            w-11 h-11
                            rounded-full
                            bg-gradient-to-br
                            from-primary
                            to-green-600
                            text-white
                            flex items-center justify-center
                            font-black
                            text-sm
                            shrink-0
                          "
                        >
                          {getInitials()}
                        </div>

                        <div className="min-w-0">
                          <p
                            className="font-black text-dark-text truncate"
                            title={getDisplayName()}
                          >
                            {getDisplayName()}
                          </p>

                          <p
                            className="text-xs text-gray-400 truncate"
                            title={user?.email}
                          >
                            {user?.email}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Dashboard */}
                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="
                        flex items-center gap-3
                        px-4 py-3
                        rounded-xl
                        text-sm font-bold
                        text-gray-600
                        hover:bg-gray-50
                        hover:text-dark-text
                        transition-colors
                      "
                    >
                      <span className="text-lg">▦</span>
                      Mon Dashboard
                    </Link>

                    {/* Crédits */}
                    <Link
                      href="/credits"
                      onClick={() => setShowUserMenu(false)}
                      className="
                        flex items-center gap-3
                        px-4 py-3
                        rounded-xl
                        text-sm font-bold
                        text-gray-600
                        hover:bg-gray-50
                        hover:text-dark-text
                        transition-colors
                      "
                    >
                      <span className="text-lg">◈</span>
                      Crédits & abonnement
                    </Link>

                    {/* Déconnexion */}
                    <button
                      onClick={handleLogout}
                      className="
                        w-full
                        flex items-center gap-3
                        px-4 py-3
                        rounded-xl
                        text-sm font-bold
                        text-red-500
                        hover:bg-red-50
                        transition-colors
                        cursor-pointer
                      "
                    >
                      <span className="text-lg">↪</span>
                      Déconnexion
                    </button>

                  </div>
                )}
              </div>

              {/* Dashboard desktop */}
              <Link
                href="/dashboard"
                className="
                  hidden md:flex
                  px-5 lg:px-6 py-3
                  bg-dark-text
                  text-white
                  text-sm
                  font-bold
                  rounded-full
                  transition-all
                  shadow-md
                  active:scale-95
                  hover:bg-black
                "
              >
                Mon Dashboard
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ========================================================
          MOBILE — INFOS UTILISATEUR
      ======================================================== */}
      {isLoggedIn && user && (
        <div className="sm:hidden border-t border-gray-100 bg-white/95">
          <div className="px-4 py-2.5 flex items-center justify-between">

            <div className="flex items-center gap-2.5 min-w-0">

              <div
                className="
                  w-8 h-8
                  rounded-full
                  bg-gradient-to-br
                  from-primary
                  to-green-600
                  text-white
                  flex items-center justify-center
                  font-black
                  text-[10px]
                  shrink-0
                "
              >
                {getInitials()}
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-xs
                    font-black
                    text-dark-text
                    truncate
                    max-w-[180px]
                  "
                  title={getDisplayName()}
                >
                  {getDisplayName()}
                </p>

                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  Compte connecté
                </p>
              </div>

            </div>

            <button
              onClick={handleLogout}
              className="
                text-[10px]
                font-black
                uppercase
                tracking-wider
                text-red-500
                hover:text-red-600
                shrink-0
              "
            >
              Déconnexion
            </button>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;