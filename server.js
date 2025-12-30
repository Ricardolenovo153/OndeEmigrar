// server.js
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve o teu HTML/CSS/JS estático

// ROTA PRINCIPAL: Recebe os sliders e pede ao SQL para calcular
app.post('/api/ranking', (req, res) => {
    const { eco, sau, edu, pol, dir, emi } = req.body;

    // A Mágica do SQL: O cálculo é feito aqui, não no Node
    
    /*
    const sqlQuery = `
        SELECT 
            c.country_name, 
            i.gdp_per_capita, 
            i.life_expectancy,
            -- Cálculo de Score Ponderado (Normalização aproximada)
            (
                (IFNULL(i.gdp_per_capita, 0) * 1 * ?) +          -- Economia
                (IFNULL(i.life_expectancy, 0) * 500 * ?) +       -- Saúde
                (IFNULL(i.tertiary_education, 0) * 500 * ?) +    -- Educação
                (IFNULL(i.political_stability, 0) * 5000 * ?) +  -- Política
                (IFNULL(i.rule_oflaw, 0) * 5000 * ?) -           -- Direito
                (IFNULL(i.share, 0) * 5000 * ?)                  -- Baixa Emigração (Subtrair)
            ) AS score_final
        FROM indicator i
        JOIN country c ON i.country_id = c.id_country
        WHERE i.year = 2020 
        ORDER BY score_final DESC
        LIMIT 5;
    `;
    */

    // Injeta os valores dos sliders nos ? da query
    db.query(sqlQuery, [eco, sau, edu, pol, dir, emi], (err, results) => {
        if (err) {
            console.error("Erro SQL:", err);
            return res.status(500).json({ error: "Erro ao calcular ranking" });
        }
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
});