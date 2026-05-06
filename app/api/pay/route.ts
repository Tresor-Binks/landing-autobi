import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Récupération des données envoyées par le front-end
    const { amount, description, userId } = await request.json();

    // 2. Vérification de la session utilisateur
    if (!userId) {
      return NextResponse.json(
        { error: "Authentification requise. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    // 3. Récupération des variables d'environnement
    const OPENPAY_API_KEY = process.env.OPENPAY_API_KEY;
    
    // On définit une URL de secours au cas où NEXT_PUBLIC_BASE_URL est vide
    // IMPORTANT : OpenPay refuse 'http://localhost:3000'. 
    // En développement, utilisez une URL Ngrok (ex: https://votre-id.ngrok-free.app)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://autobi-cg.com';

    if (!OPENPAY_API_KEY) {
      console.error("ERREUR: La clé API OpenPay est manquante dans le fichier .env");
      return NextResponse.json({ error: "Configuration serveur incomplète" }, { status: 500 });
    }

    // 4. Construction de l'URL de retour (Success)
    // On s'assure qu'elle est en HTTPS pour passer la validation OpenPay
    const successUrl = `${baseUrl.replace(/\/$/, '')}/payment-result?status=success`;

    console.log("Tentative de paiement pour l'utilisateur:", userId);
    console.log("URL de succès envoyée à OpenPay:", successUrl);

    // 5. Appel à l'API OpenPay
    const response = await fetch('https://api.openpay-cg.com/v1/payment-link', {
      method: 'POST',
      headers: {
        'XO-API-KEY': OPENPAY_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        description: description,
        expires_at: 24, // Le lien expire après 24 heures
        success_url: successUrl,
        metadata: {
          project: "AUTO_BI",
          user_id: userId,
          amount_paid: amount
        }
      }),
    });

    const result = await response.json();

    // 6. Analyse de la réponse d'OpenPay
    if (result.success && result.data?.payment_url) {
      return NextResponse.json({ url: result.data.payment_url });
    } else {
      console.error("Erreur API OpenPay:", result);
      return NextResponse.json(
        { error: result.error || "Impossible de générer le lien de paiement. Vérifiez l'URL de succès." },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Erreur Interne Route Pay:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue sur le serveur." },
      { status: 500 }
    );
  }
}