import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; 

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // 1. On vérifie que l'événement correspond à un paiement réussi
    if (payload.event === 'payment.completed') {
      const { user_id, amount_paid } = payload.metadata;

      // 2. Traitement selon le montant payé
      if (amount_paid === 3000) {
        // Mise à jour des jetons ET du type de plan
        await db.execute(
          'UPDATE users SET tokens = tokens + 10, plan_type = ? WHERE id = ?',
          ['PAY_AS_YOU_GO', user_id]
        );
        console.log(`Succès: 10 jetons ajoutés et plan mis à jour pour ${user_id}`);
      }
      else if (amount_paid === 20000) {
        // Logique MySQL : Plan Illimité (999 jetons et changement de type de plan)
        await db.execute(
          'UPDATE users SET plan_type = ?, tokens = ? WHERE id = ?',
          ['ABONNE_MENSUEL', 999, user_id]
        );
        console.log(`Succès: Plan Illimité activé pour l'utilisateur ${user_id}`);
      }

      return NextResponse.json({ received: true, message: "Base de données mise à jour" });
    }

    return NextResponse.json({ status: 'ignored' });

  } catch (err) {
    console.error("ERREUR WEBHOOK:", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la base de données" }, 
      { status: 500 }
    );
  }
}