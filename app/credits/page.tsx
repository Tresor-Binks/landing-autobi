"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Pricing from "@/components/pricing";
import AuthOverlay from "@/components/auth-overlay";

export default function CreditsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("autobi_user_id");

    setAuthenticated(!!userId);
    setCheckingAuth(false);
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />

      <div
        className={
          authenticated
            ? ""
            : "blur-md pointer-events-none select-none"
        }
      >
        <div className="pt-20">

          <Pricing
            key={authenticated ? "authenticated" : "unauthenticated"}
          />

          <div className="text-center pb-20">
            <a
              href="/dashboard"
              className="text-slate-400 hover:text-primary font-medium underline"
            >
              Retour au menu principal
            </a>
          </div>

        </div>
      </div>

      {!authenticated && (
        <AuthOverlay
          onAuthenticated={() => {
            setAuthenticated(true);
          }}
        />
      )}
    </div>
  );
}