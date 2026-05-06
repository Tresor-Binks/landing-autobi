import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import argon2 from 'argon2';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'autobi',
  port: 3306
};

export async function POST(req: Request) {
  const { mode, email, password, firstName, lastName } = await req.json();
  const connection = await mysql.createConnection(dbConfig);

  try {
    if (mode === 'register') {
      const hash = await argon2.hash(password);
      const [result]: any = await connection.execute(
        'INSERT INTO users (first_name, last_name, email, password_hash, token_balance) VALUES (?, ?, ?, ?, 5)',
        [firstName, lastName, email, hash]
      );
      return NextResponse.json({ message: 'User created', user: { id: result.insertId, email } });
    } else {
      const [rows]: any = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      
      const user = rows[0];
      const valid = await argon2.verify(user.password_hash, password);
      if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 401 });

      await connection.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
      return NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.first_name } });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await connection.end();
  }
}