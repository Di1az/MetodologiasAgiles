import dotenv from 'dotenv'; 
import mysql from 'mysql2';

dotenv.config();

const pool = mysql.createPool({
  host: "localhost",
  user: "admin",
  password: "1234",
  database: "gestion_proyectos2"
});


export default pool.promise();
