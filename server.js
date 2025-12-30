// server.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve o HTML/CSS/JS da pasta public

// Configuração da BD
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123", // Mete a tua password se tiveres
  database: "migracao",
});

db.connect((err) => {
  if (err) console.error("❌ Erro na BD:", err);
  else console.log("✅ Ligado ao MySQL!");
});

// --- ROTA DE TESTE (PING) ---
app.get("/teste-db", (req, res) => res.send("Backend a funcionar!"));

// --- ROTA 1: GRAVAR PERFIL (Opção 2 - Tabela Preference) ---
app.post("/api/profiles", (req, res) => {
  const { name, values } = req.body;
  // values = [20, 20, 20, 15, 15, 10]

  // TEMPORÁRIO: Hardcoded para o User ID 1 (até teres login)
  const userId = 1;

  if (!name || !values) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const sql = `INSERT INTO preference (name, eco, sau, edu, pol, dir, emi, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [
      name,
      values[0],
      values[1],
      values[2],
      values[3],
      values[4],
      values[5],
      userId,
    ],
    (err, result) => {
      if (err) {
        console.error("Erro ao gravar:", err);
        return res.status(500).json({ error: "Erro ao gravar na BD" });
      }
      console.log(`💾 Perfil '${name}' salvo no ID ${result.insertId}`);
      res.json({ message: "Perfil guardado!", id: result.insertId });
    }
  );
});

// --- ROTA 2: LER PERFIS ---
app.get("/api/profiles", (req, res) => {
  const userId = 1; // Temporário

  const sql =
    "SELECT * FROM preference WHERE user_id = ? ORDER BY created_at DESC";

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao ler perfis" });

    // Formatar para o Frontend (array de valores)
    const formatado = results.map((row) => ({
      id: row.id_preference,
      name: row.name,
      active: false,
      values: [row.eco, row.sau, row.edu, row.pol, row.dir, row.emi],
    }));

    res.json(formatado);
  });
});

app.get("/", (req, res) => {
  // Dizemos ao servidor: "Entra na pasta 'views' e pega o index.html"
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
});
