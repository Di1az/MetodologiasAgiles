require('dotenv').config();
const mysql = require('mysql2');

// Crear la conexión a la base de datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'gestion_proyectos'
});

module.exports = pool.promise();
