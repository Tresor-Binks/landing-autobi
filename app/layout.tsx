import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AutoBI — Analysez vos données Excel avec l\'IA en 30 secondes',
  description: 'AutoBI transforme vos fichiers Excel en dashboards interactifs grâce à l\'IA. Insights actionnables, graphiques automatiques, export PDF. 5 jetons gratuits à l\'inscription.',
  keywords: ['analyse de données', 'Excel IA', 'dashboard automatique', 'data analysis Congo', 'AutoBI', 'intelligence artificielle données', 'GPT Excel'],
  openGraph: {
    title: 'AutoBI — L\'analyse de données, enfin accessible à tous',
    description: 'Importez votre fichier Excel et obtenez un dashboard IA en 30 secondes.',
    url: 'https://autobi-cg.com',
    siteName: 'AutoBI',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoBI — Analyse Excel par IA',
    description: 'Dashboard interactif généré en 30 secondes à partir de vos données Excel.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://autobi-cg.com' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}