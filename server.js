// server.js (VERSÃO DE TESTE DE CONEXÃO)
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

// 1. Configuração da Conexão
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',          // Verifica se tens password no teu MySQL
    database: 'migracao' // Tem a certeza que este nome é igual ao do Workbench
});

// 2. Testar a Conexão ao arrancar
db.connect(err => {
    if (err) {
        console.error('❌ ERRO CRÍTICO: O Node.js não conseguiu ligar ao MySQL!');
        console.error('Causa:', err.code, err.sqlMessage);
    } else {
        console.log('✅ SUCESSO: Ligação ao MySQL estabelecida!');
    }
});

// 3. Rota de Teste Simples
app.get('/teste-db', (req, res) => {
    db.query('SELECT 1 + 1 AS solucao', (err, results) => {
        if (err) {
            res.status(500).send('Erro na Query: ' + err.message);
        } else {
            res.send(`<h1>Tudo a funcionar!</h1><p>O MySQL respondeu: 1+1 = ${results[0].solucao}</p>`);
        }
    });
});

app.listen(3000, () => {
    console.log('📡 Servidor de teste à escuta na porta 3000');
});