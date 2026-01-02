const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const session = require("express-session"); 
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); 
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/views', express.static(path.join(__dirname, 'public/views')));

// CONFIGURAÇÃO DA SESSÃO
app.use(session({
    secret: 'segredo_migracao',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } 
}));

// CONFIGURAÇÃO DA BD
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123", 
  database: "migracao",
});

db.connect((err) => {
  if (err) console.error("❌ Erro na BD:", err);
  else console.log("✅ Ligado ao MySQL!");
});

// --- AUTENTICAÇÃO ---
app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    
    // Verifica se o email já existe
    db.query("SELECT * FROM user WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro interno ao verificar email" });
        if (results.length > 0) {
            return res.status(400).json({ error: "Este e-mail já está registado" });
        }

        // Insere o novo utilizador
        const sql = "INSERT INTO user (name, email, password) VALUES (?, ?, ?)";
        db.query(sql, [name, email, password], (err, result) => {
            if (err) return res.status(500).json({ error: "Erro ao criar conta" });
            res.json({ message: "Conta criada com sucesso!", id: result.insertId });
        });
    });
});

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM user WHERE email = ? AND password = ?", [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro interno" });
        if (results.length > 0) {
            req.session.userId = results[0].id_user;
            req.session.userName = results[0].name;
            res.json({ message: "Login OK", user: results[0].name });
        } else {
            res.status(401).json({ error: "Dados incorretos" });
        }
    });
});

app.post("/api/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "Saiu" });
});

// --- ROTA DE RANKING ---
app.post('/api/ranking', (req, res) => {
    const { eco, sau, edu, pol, dir, emi } = req.body;
    
    // Query SQL otimizada para cálculo de ranking diretamente na BD
    // Normalizamos os valores para que os pesos (0-100) façam sentido entre indicadores de escalas diferentes
    const sql = `
        SELECT 
            c.country_name, 
            i.gdp_per_capita, 
            i.life_expectancy,
            (
                (IFNULL(i.gdp_per_capita, 0) / 1000 * ?) + 
                (IFNULL(i.life_expectancy, 0) * ?) + 
                (IFNULL(i.tertiary_education, 0) * 2 * ?) + 
                (IFNULL(i.political_stability, 0) * 10 * ?) + 
                (IFNULL(i.rule_oflaw, 0) * 10 * ?) - 
                (IFNULL(i.share, 0) * 5 * ?)
            ) AS score_final
        FROM indicator i 
        JOIN country c ON i.country_id = c.id_country
        WHERE i.year = (SELECT MAX(year) FROM indicator)
        ORDER BY score_final DESC 
        LIMIT 10;
    `;

    db.query(sql, [eco, sau, edu, pol, dir, emi], (err, results) => {
        if (err) {
            console.error("Erro SQL no Ranking:", err);
            return res.status(500).json({ error: "Erro ao calcular ranking" });
        }
        res.json(results);
    });
});

// --- CRUD DE PERFIS ---

app.post("/api/profiles", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Não autorizado" });
  const { name, values } = req.body;
  const sql = `INSERT INTO preference (name, eco, sau, edu, pol, dir, emi, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [name, ...values, req.session.userId], (err, result) => {
      if (err) return res.status(500).json({ error: "Erro ao gravar" });
      res.json({ message: "Guardado", id: result.insertId });
  });
});

app.get("/api/profiles", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Não autorizado" });
  const sql = "SELECT * FROM preference WHERE user_id = ? ORDER BY id_preference DESC";
  db.query(sql, [req.session.userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao ler" });
    const formatado = results.map((row) => ({
      id: row.id_preference,
      name: row.name,
      active: false,
      values: [row.eco, row.sau, row.edu, row.pol, row.dir, row.emi],
    }));
    res.json(formatado);
  });
});

// Atualizar
app.put("/api/profiles/:id", (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Não autorizado" });
    const { id } = req.params;
    const { name, values } = req.body;
    const sql = `UPDATE preference SET name=?, eco=?, sau=?, edu=?, pol=?, dir=?, emi=? WHERE id_preference=? AND user_id=?`;
    db.query(sql, [name, ...values, id, req.session.userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar" });
        res.json({ message: "Atualizado" });
    });
});

// Apagar
app.delete("/api/profiles/:id", (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Não autorizado" });
    const { id } = req.params;
    const sql = "DELETE FROM preference WHERE id_preference = ? AND user_id=?";
    db.query(sql, [id, req.session.userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao apagar" });
        res.json({ message: "Apagado" });
    });
});

// --- ROTAS DE PÁGINAS (AQUI ESTAVA O ERRO DO DASHBOARD) ---

// --- ROTAS DE PÁGINAS ---

// Página Inicial
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/views", "home.html"));
});

// Página de Login
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public/views", "login.html"));
});

// Página de Registo
app.get("/registo", (req, res) => {
    res.sendFile(path.join(__dirname, "public/views", "registo.html"));
});

// Página de Dashboard (Protegida)
app.get("/dashboard", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login"); // Se não tiver logado, manda para o login
    }
    res.sendFile(path.join(__dirname, "public/views", "dashboard.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor pronto: http://localhost:${PORT}`);
});