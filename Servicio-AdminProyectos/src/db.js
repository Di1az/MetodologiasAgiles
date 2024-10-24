import dotenv from 'dotenv'; // Import dotenv
import mysql from 'mysql2'; // Import mysql2

// Load environment variables from .env file
dotenv.config();

// Create the database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'beCCerrin123.',
  database: 'gestion_proyectos'
});

// Export the promise version of the pool
export default pool.promise();
