import mysql from 'mysql2/promise';

export const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'autobi',
  port: 3306,
};

// On crée un pool de connexions (plus performant pour une API)
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// C'est cet export qui va corriger ton erreur ts(2305)
export const db = pool;

// Tu peux garder ta fonction si tu en as besoin ailleurs
export async function getConnection() {
  return await mysql.createConnection(dbConfig);
}