import mysql from 'mysql2/promise';


export const dbConfig = {
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'root',
  database: process.env.MYSQLDATABASE || 'autobi',
  port: Number(process.env.MYSQLPORT) || 3307,
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