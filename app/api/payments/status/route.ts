import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'autobi',
  port: 3307,
};

export async function GET(request: Request) {
  let connection: mysql.Connection | null = null;

  try {
    const { searchParams } = new URL(request.url);

    const paymentId =
      searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json(
        {
          error: 'payment_id manquant.',
        },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    const [payments]: any = await connection.execute(
      `
      SELECT
        id,
        user_id,
        amount,
        payment_type,
        status,
        reference,
        completed_at,
        created_at
      FROM payments
      WHERE id = ?
      LIMIT 1
      `,
      [paymentId]
    );

    if (!payments.length) {
      return NextResponse.json(
        {
          error: 'Paiement introuvable.',
        },
        { status: 404 }
      );
    }

    const payment = payments[0];

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        user_id: payment.user_id,
        amount: payment.amount,
        payment_type: payment.payment_type,
        status: payment.status,
        reference: payment.reference,
        completed_at: payment.completed_at,
        created_at: payment.created_at,
      },
    });

  } catch (error: any) {

    console.error(
      'Erreur status paiement:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Impossible de récupérer le statut du paiement.',
      },
      { status: 500 }
    );

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}