import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';


const dbConfig = {
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'root',
  database: process.env.MYSQLDATABASE || 'autobi',
  port: Number(process.env.MYSQLPORT) || 3307,
};

export async function POST(req: Request) {
  let connection: mysql.Connection | null = null;

  try {
    const payload = await req.json();

    console.log('================================');
    console.log('WEBHOOK OPENPAY REÇU');
    console.log(JSON.stringify(payload, null, 2));
    console.log('================================');

    /*
    ============================================================
    1. RÉCUPÉRATION DU STATUT
    ============================================================
    */

    const event =
      payload.event ||
      payload.type ||
      '';

    const status =
      payload.status ||
      payload.data?.status ||
      '';

    /*
    ============================================================
    2. ON NE TRAITE QUE LES PAIEMENTS RÉUSSIS
    ============================================================
    */

    const isSuccess =
      event === 'payment.completed' ||
      status === 'success';

    if (!isSuccess) {
      console.log(
        'Webhook ignoré. Statut:',
        status,
        'Event:',
        event
      );

      return NextResponse.json({
        received: true,
        status: 'ignored',
      });
    }

    /*
    ============================================================
    3. RÉCUPÉRATION DES MÉTADONNÉES
    ============================================================
    */

    const metadata =
      payload.metadata ||
      payload.data?.metadata ||
      {};

    const paymentId =
      metadata.payment_id ||
      metadata.paymentId ||
      null;

    const userId =
      metadata.user_id ||
      metadata.userId ||
      null;

    const amount =
      Number(
        metadata.amount_paid ||
        metadata.amount ||
        payload.amount ||
        payload.data?.amount ||
        0
      );

    const reference =
      payload.reference ||
      payload.data?.reference ||
      payload.transaction_reference ||
      null;

    /*
    ============================================================
    4. VALIDATION
    ============================================================
    */

    if (!paymentId && !userId) {
      console.error(
        'Webhook invalide : aucun payment_id/user_id.'
      );

      return NextResponse.json(
        {
          error: 'Métadonnées de paiement invalides.',
        },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    /*
    ============================================================
    5. RECHERCHE DU PAIEMENT
    ============================================================
    */

    let payments: any[] = [];

    if (paymentId) {
      const [rows]: any = await connection.execute(
        `
        SELECT *
        FROM payments
        WHERE id = ?
        LIMIT 1
        `,
        [paymentId]
      );

      payments = rows;
    }

    /*
    Si payment_id n'est pas disponible, on cherche par référence.
    */

    if (!payments.length && reference) {
      const [rows]: any = await connection.execute(
        `
        SELECT *
        FROM payments
        WHERE reference = ?
        LIMIT 1
        `,
        [reference]
      );

      payments = rows;
    }

    if (!payments.length) {
      console.error(
        'Paiement introuvable.',
        {
          paymentId,
          reference,
          userId,
        }
      );

      return NextResponse.json(
        {
          error: 'Paiement introuvable.',
        },
        { status: 404 }
      );
    }

    const payment = payments[0];

    /*
    ============================================================
    6. PROTECTION CONTRE LE DOUBLE TRAITEMENT
    ============================================================
    */

    if (
      payment.status === 'completed' ||
      payment.status === 'success'
    ) {
      console.log(
        `Paiement ${payment.id} déjà traité.`
      );

      return NextResponse.json({
        received: true,
        status: 'already_processed',
      });
    }

    /*
    ============================================================
    7. RÉCUPÉRATION UTILISATEUR
    ============================================================
    */

    const finalUserId =
      payment.user_id ||
      userId;

    const [users]: any = await connection.execute(
      `
      SELECT *
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [finalUserId]
    );

    if (!users.length) {
      throw new Error(
        `Utilisateur ${finalUserId} introuvable.`
      );
    }

    const user = users[0];

    /*
    ============================================================
    8. TYPE DE PAIEMENT
    ============================================================
    */

    let paymentType =
      payment.payment_type ||
      metadata.payment_type ||
      null;

    /*
    Si le type n'est pas enregistré, on le déduit du montant.
    */

    if (!paymentType) {
      if (amount === 100) {
        paymentType = 'PAY_AS_YOU_GO';
      }

      if (amount === 20000) {
        paymentType = 'MONTHLY_UNLIMITED';
      }
    }

    /*
    ============================================================
    9. TRANSACTION MYSQL

    Tout est validé ou rien n'est validé.
    ============================================================
    */

    await connection.beginTransaction();

    /*
    ============================================================
    CAS A :
    PAY-AS-YOU-GO
    ============================================================
    */

    if (
      paymentType === 'PAY_AS_YOU_GO' ||
      amount === 100
    ) {

      /*
      Un abonnement mensuel encore actif interdit
      l'ajout de crédits.
      */

      if (
        user.plan_type === 'MONTHLY_UNLIMITED' &&
        user.plan_expires_at &&
        new Date(user.plan_expires_at) > new Date()
      ) {
        await connection.rollback();

        console.warn(
          `Crédits refusés : abonnement actif pour ${finalUserId}`
        );

        return NextResponse.json(
          {
            error:
              'L’utilisateur possède encore un abonnement mensuel actif.',
          },
          { status: 409 }
        );
      }

      /*
      Passage en Pay-as-you-go.
      */

      await connection.execute(
        `
        UPDATE users
        SET
          plan_type = 'PAY_AS_YOU_GO',
          token_balance = token_balance + 10,
          plan_expires_at = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [finalUserId]
      );

      console.log(
        `10 crédits ajoutés à l'utilisateur ${finalUserId}`
      );
    }

    /*
    ============================================================
    CAS B :
    ABONNEMENT MENSUEL
    ============================================================
    */

    else if (
      paymentType === 'MONTHLY_UNLIMITED' ||
      amount === 20000
    ) {

      /*
      Les crédits existants sont volontairement supprimés.
      */

      await connection.execute(
        `
        UPDATE users
        SET
          plan_type = 'MONTHLY_UNLIMITED',
          token_balance = 0,
          plan_expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [finalUserId]
      );

      console.log(
        `Abonnement mensuel activé pour ${finalUserId}`
      );
    }

    else {
      await connection.rollback();

      console.error(
        'Montant/type de paiement inconnu:',
        {
          amount,
          paymentType,
        }
      );

      return NextResponse.json(
        {
          error: 'Type de paiement inconnu.',
        },
        { status: 400 }
      );
    }

    /*
    ============================================================
    10. MARQUER LE PAIEMENT COMME TERMINÉ
    ============================================================
    */

    await connection.execute(
      `
      UPDATE payments
      SET
        status = 'completed',
        reference = COALESCE(?, reference),
        completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        reference,
        payment.id,
      ]
    );

    /*
    ============================================================
    11. VALIDATION TRANSACTION
    ============================================================
    */

    await connection.commit();

    console.log('================================');
    console.log('PAIEMENT TRAITÉ AVEC SUCCÈS');
    console.log('Payment:', payment.id);
    console.log('User:', finalUserId);
    console.log('Type:', paymentType);
    console.log('Amount:', amount);
    console.log('================================');

    return NextResponse.json({
      received: true,
      status: 'completed',
      payment_id: payment.id,
    });

  } catch (error: any) {

    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }

    console.error(
      '================================'
    );
    console.error(
      'ERREUR WEBHOOK OPENPAY'
    );
    console.error(error);
    console.error(
      '================================'
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Erreur lors du traitement du paiement.',
      },
      { status: 500 }
    );

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}