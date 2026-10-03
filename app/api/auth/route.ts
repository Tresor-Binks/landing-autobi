import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import argon2 from 'argon2';
require('dotenv').config();

// ============================================================
// CONFIGURATION MYSQL
// ============================================================

const dbConfig = {
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'root',
  database: process.env.MYSQLDATABASE || 'autobi',
  port: Number(process.env.MYSQLPORT) || 3307,
};

// ============================================================
// POST
// INSCRIPTION + CONNEXION
// ============================================================

export async function POST(req: Request) {
  let connection;

  try {
    const {
      mode,
      email,
      password,
      firstName,
      lastName,
    } = await req.json();

    console.log('========== AUTH ==========');
    console.log('Mode:', mode);
    console.log('Email:', email);
    console.log('Connexion à MySQL...');

    // Connexion MySQL
    connection = await mysql.createConnection(dbConfig);

    console.log('MySQL connecté avec succès.');

    // ========================================================
    // INSCRIPTION
    // ========================================================

    if (mode === 'register') {

      if (!email || !password || !firstName || !lastName) {
        return NextResponse.json(
          {
            error: 'Tous les champs sont obligatoires.',
          },
          { status: 400 }
        );
      }

      // Vérifier si l'utilisateur existe déjà
      const [existingUsers]: any = await connection.execute(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [email]
      );

      if (existingUsers.length > 0) {
        return NextResponse.json(
          {
            error: 'Un compte existe déjà avec cette adresse email.',
          },
          { status: 409 }
        );
      }

      // Hash Argon2
      const hash = await argon2.hash(password);

      // Création utilisateur
      const [result]: any = await connection.execute(
        `
        INSERT INTO users (
          first_name,
          last_name,
          email,
          password_hash,
          plan_type,
          token_balance
        )
        VALUES (?, ?, ?, ?, 'PAY_AS_YOU_GO', 5)
        `,
        [
          firstName,
          lastName,
          email,
          hash,
        ]
      );

      console.log(
        'Utilisateur créé avec ID:',
        result.insertId
      );

      return NextResponse.json(
        {
          message: 'User created',

          user: {
            id: result.insertId,
            email,
            firstName,
            lastName,
            planType: 'PAY_AS_YOU_GO',
            tokenBalance: 5,
            planExpiresAt: null,
          },
        },
        { status: 201 }
      );
    }

    // ========================================================
    // CONNEXION
    // ========================================================

    if (mode === 'login') {

      if (!email || !password) {
        return NextResponse.json(
          {
            error:
              'Email et mot de passe obligatoires.',
          },
          { status: 400 }
        );
      }

      // Recherche utilisateur
      const [rows]: any = await connection.execute(
        `
        SELECT
          id,
          first_name,
          last_name,
          email,
          password_hash,
          plan_type,
          token_balance,
          plan_expires_at
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          {
            error:
              'Email ou mot de passe incorrect.',
          },
          { status: 401 }
        );
      }

      const user = rows[0];

      // Vérification Argon2
      const valid = await argon2.verify(
        user.password_hash,
        password
      );

      if (!valid) {
        return NextResponse.json(
          {
            error:
              'Email ou mot de passe incorrect.',
          },
          { status: 401 }
        );
      }

      // Mise à jour dernière connexion
      await connection.execute(
        `
        UPDATE users
        SET last_login = NOW()
        WHERE id = ?
        `,
        [user.id]
      );

      console.log(
        'Connexion réussie pour:',
        user.email
      );

      return NextResponse.json({
        message: 'Login successful',

        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,

          // Informations abonnement
          planType: user.plan_type,
          tokenBalance: Number(
            user.token_balance || 0
          ),

          planExpiresAt:
            user.plan_expires_at
              ? new Date(
                  user.plan_expires_at
                ).toISOString()
              : null,
        },
      });
    }

    // ========================================================
    // MODE INCONNU
    // ========================================================

    return NextResponse.json(
      {
        error: 'Mode d\'authentification invalide.',
      },
      { status: 400 }
    );

  } catch (error: any) {

    console.error(
      '================================'
    );
    console.error(
      'ERREUR AUTHENTIFICATION'
    );
    console.error(
      '================================'
    );
    console.error(error);
    console.error('Message:', error?.message);
    console.error('Code:', error?.code);
    console.error('================================');

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
      try {
        await connection.end();
      } catch (error) {
        console.error(
          'Erreur fermeture MySQL:',
          error
        );
      }
    }
  }
}

// ============================================================
// GET
// RÉCUPÉRATION DES INFORMATIONS UTILISATEUR
// ============================================================

export async function GET(req: Request) {
  let connection;

  try {

    // Récupération du userId
    const { searchParams } =
      new URL(req.url);

    const userId =
      searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          error:
            'Identifiant utilisateur manquant.',
        },
        { status: 400 }
      );
    }

    console.log(
      'Récupération profil utilisateur:',
      userId
    );

    // Connexion MySQL
    connection =
      await mysql.createConnection(
        dbConfig
      );

    // ========================================================
    // RÉCUPÉRATION UTILISATEUR
    // ========================================================

    const [rows]: any =
      await connection.execute(
        `
        SELECT
          id,
          first_name,
          last_name,
          email,
          plan_type,
          token_balance,
          plan_expires_at,
          created_at,
          last_login
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userId]
      );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            'Utilisateur introuvable.',
        },
        { status: 404 }
      );
    }

    const user = rows[0];

    // ========================================================
    // VÉRIFICATION ABONNEMENT
    // ========================================================

    let planExpiresAt = null;

    if (user.plan_expires_at) {
      planExpiresAt =
        new Date(
          user.plan_expires_at
        ).toISOString();
    }

    // ========================================================
    // RÉPONSE
    // ========================================================

    return NextResponse.json({

      user: {

        id: user.id,

        email: user.email,

        firstName:
          user.first_name,

        lastName:
          user.last_name,

        // ------------------------------
        // ABONNEMENT
        // ------------------------------

        planType:
          user.plan_type,

        // ------------------------------
        // CRÉDITS
        // ------------------------------

        tokenBalance:
          Number(
            user.token_balance || 0
          ),

        // ------------------------------
        // EXPIRATION
        // ------------------------------

        planExpiresAt,

        // ------------------------------
        // DATES
        // ------------------------------

        createdAt:
          user.created_at
            ? new Date(
                user.created_at
              ).toISOString()
            : null,

        lastLogin:
          user.last_login
            ? new Date(
                user.last_login
              ).toISOString()
            : null,
      },
    });

  } catch (error: any) {

    console.error(
      '================================'
    );
    console.error(
      'ERREUR RÉCUPÉRATION PROFIL'
    );
    console.error(
      '================================'
    );
    console.error(error);
    console.error('Message:', error?.message);
    console.error('Code:', error?.code);
    console.error('================================');

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Impossible de récupérer les informations utilisateur.',
      },
      { status: 500 }
    );

  } finally {

    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error(
          'Erreur fermeture MySQL:',
          error
        );
      }
    }
  }
}