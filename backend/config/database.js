// Database connection configuration
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '*', // UPDATE THIS WITH YOUR MYSQL PASSWORD
  database: 'too_good_to_go',
  waitForConnections: true,
  connectionLimit: 10, // Maximum of 10 concurrent database connections
  queueLimit: 0
});

export default pool;
