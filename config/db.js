// config/db.js
require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123', // Define no .env ou aqui
    database: process.env.DB_NAME || 'quero_emigrar_db'
});

connection.connect(error => {
    if (error) throw error;
    console.log("✅ Ligado à Base de Dados com sucesso!");
});

module.exports = connection;