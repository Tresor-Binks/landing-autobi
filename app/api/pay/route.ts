import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'autobi',
  port: 3307,
};

type PaymentType = 'PAY_AS_YOU_GO' | 'MONTHLY_UNLIMITED';

export async function POST(request: Request) {
  let connection: mysql.Connection | null = null;

  try {
    const {
      amount,
      description,
      userId,
      confirmSubscription = false,
    } = await request.json();

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Authentification requise. Veuillez vous connecter.',
        },
        { status: 401 }
      );
    }

    if (![100, 20000].includes(Number(amount))) {
      return NextResponse.json(
        {
          error: 'Montant de paiement invalide.',
        },
        { status: 400 }
      );
    }

    const paymentType: PaymentType =
      Number(amount) === 100
        ? 'PAY_AS_YOU_GO'
        : 'MONTHLY_UNLIMITED';

    connection = await mysql.createConnection(dbConfig);

    /*
    ============================================================
    1. RÉCUPÉRATION DE L'UTILISATEUR
    ============================================================
    */

    const [users]: any = await connection.execute(
      `
      SELECT
        id,
        first_name,
        last_name,
        email,
        plan_type,
        token_balance,
        plan_expires_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (!users.length) {
      return NextResponse.json(
        {
          error: 'Utilisateur introuvable.',
        },
        { status: 404 }
      );
    }

    const user = users[0];

    /*
    ============================================================
    2. VÉRIFICATION D'UN ABONNEMENT EXPIRÉ
    ============================================================
    */

    if (
      user.plan_type === 'MONTHLY_UNLIMITED' &&
      user.plan_expires_at
    ) {
      const expiration = new Date(user.plan_expires_at);
      const now = new Date();

      /*
       * L'abonnement est encore actif.
       */
      if (expiration > now) {
        /*
        ========================================================
        CAS 1 :
        ABONNEMENT ACTIF + ACHAT DE CRÉDITS
        ========================================================
        */

        if (paymentType === 'PAY_AS_YOU_GO') {
          return NextResponse.json(
            {
              error:
                'Achat de crédits impossible pendant votre abonnement mensuel actif.',
              code: 'ACTIVE_SUBSCRIPTION',
              plan_type: user.plan_type,
              plan_expires_at: expiration.toISOString(),
            },
            { status: 409 }
          );
        }

        /*
        ========================================================
        CAS 2 :
        ABONNEMENT ACTIF + RENOUVELLEMENT
        ========================================================

        On autorise le renouvellement.
        Le nouvel abonnement commencera à partir du paiement
        et durera 30 jours.
        */
      }
    }

    /*
    ============================================================
    3. ABONNEMENT PAY-AS-YOU-GO → MONTHLY
    ============================================================

    Si l'utilisateur possède des crédits, le frontend doit
    explicitement confirmer leur suppression.
    */

    if (
      paymentType === 'MONTHLY_UNLIMITED' &&
      user.plan_type === 'PAY_AS_YOU_GO' &&
      Number(user.token_balance) > 0 &&
      !confirmSubscription
    ) {
      return NextResponse.json(
        {
          error:
            'Vous possédez actuellement des crédits qui seront réinitialisés à 0 lors du passage à l’abonnement mensuel.',
          code: 'TOKENS_WILL_BE_RESET',
          current_tokens: Number(user.token_balance),
          requires_confirmation: true,
        },
        { status: 409 }
      );
    }

    /*
    ============================================================
    4. VARIABLES OPENPAY
    ============================================================
    */

    const OPENPAY_API_KEY = process.env.OPENPAY_API_KEY;

    if (!OPENPAY_API_KEY) {
      console.error(
        'ERREUR : OPENPAY_API_KEY est absente du fichier .env'
      );

      return NextResponse.json(
        {
          error: 'Configuration serveur incomplète.',
        },
        { status: 500 }
      );
    }

    /*
    ============================================================
    5. URL DE RETOUR
    ============================================================
    */

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://autobi-cg.com';

    /*
    ============================================================
    6. CRÉATION D'UNE TRANSACTION LOCALE

    On crée d'abord notre paiement en "pending".
    ============================================================
    */

    const [paymentInsert]: any = await connection.execute(
      `
      INSERT INTO payments (
        user_id,
        amount,
        payment_type,
        status,
        description
      )
      VALUES (?, ?, ?, 'pending', ?)
      `,
      [
        userId,
        Number(amount),
        paymentType,
        description,
      ]
    );

    const paymentId = paymentInsert.insertId;

    /*
    ============================================================
    7. URL DE RETOUR
    ============================================================
    */

    const successUrl =
      `${baseUrl.replace(/\/$/, '')}` +
      `/payment-result?status=success&payment_id=${paymentId}`;

    /*
    ============================================================
    8. APPEL OPENPAY
    ============================================================
    */

    const response = await fetch(
      'https://api.openpay-cg.com/v1/payment-link',
      {
        method: 'POST',
        headers: {
          'XO-API-KEY': OPENPAY_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          description,
          expires_at: 24,

          success_url: successUrl,

          metadata: {
            project: 'AUTO_BI',
            user_id: String(userId),
            payment_id: String(paymentId),
            amount_paid: Number(amount),
            payment_type: paymentType,
          },
        }),
      }
    );

    const result = await response.json();

    /*
    ============================================================
    9. OPENPAY A REFUSÉ LA CRÉATION
    ============================================================
    */

    if (!response.ok || !result.success || !result.data?.payment_url) {
      console.error('Erreur API OpenPay:', result);

      await connection.execute(
        `
        UPDATE payments
        SET status = 'failed'
        WHERE id = ?
        `,
        [paymentId]
      );

      return NextResponse.json(
        {
          error:
            result.error ||
            'Impossible de générer le lien de paiement.',
        },
        { status: 400 }
      );
    }

    /*
    ============================================================
    10. SAUVEGARDE DES INFORMATIONS OPENPAY
    ============================================================
    */

    const paymentToken =
      result.data.payment_token ||
      null;

    const reference =
      result.data.reference ||
      result.data.transaction_reference ||
      null;

    await connection.execute(
      `
      UPDATE payments
      SET
        payment_token = ?,
        reference = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        paymentToken,
        reference,
        paymentId,
      ]
    );

    console.log('================================');
    console.log('PAIEMENT OPENPAY CRÉÉ');
    console.log('Payment ID:', paymentId);
    console.log('User ID:', userId);
    console.log('Type:', paymentType);
    console.log('Montant:', amount);
    console.log('================================');

    return NextResponse.json({
      success: true,
      url: result.data.payment_url,
      payment_id: paymentId,
    });

  } catch (error: any) {
    console.error(
      'ERREUR ROUTE PAYMENT:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Une erreur interne est survenue.',
      },
      { status: 500 }
    );

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}