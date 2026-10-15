const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      nom TEXT,
      prenom TEXT,
      directeur TEXT,
      chef TEXT,
      fonction TEXT,
      matricule TEXT,
      direction TEXT,
      FOREIGN KEY (email) REFERENCES users(email)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pointages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      data TEXT NOT NULL,
      UNIQUE(email, year, month)
    )
  `);

  // Compte admin admin@entreprise.com (mdp: admin123)
  const hashedAdminEnt = bcrypt.hashSync("admin123", 10);
  db.run(
    `INSERT INTO users (name, email, password, role) 
     VALUES ('Administrateur', 'admin@entreprise.com', ?, 'admin')
     ON CONFLICT(email) DO UPDATE SET password = excluded.password, role = 'admin'`,
    [hashedAdminEnt],
    (err) => {
      if (!err) {
        console.log("Admin admin@entreprise.com prêt ✅ (mdp: admin123)");
      }
    }
  );
db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_email TEXT NOT NULL,
      receiver_email TEXT NOT NULL,
      sujet TEXT,
      contenu TEXT NOT NULL,
      date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.get("SELECT * FROM users WHERE email = ?", ["admin@test.com"], (err, row) => {
    if (!row) {
      const hashed = bcrypt.hashSync("1234", 10);
      db.run(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["admin", "admin@test.com", hashed, "admin"]
      );
      console.log("Admin admin@test.com créé ✅ (mdp: 1234)");
    }
  });
});

function requireAdmin(req, res, next) {
  const role = req.headers["x-user-role"];
  if (role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }
  next();
}

app.get("/users", requireAdmin, (req, res) => {
  db.all("SELECT id, name, email, role FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json(rows);
  });
});

app.get("/profiles", requireAdmin, (req, res) => {
  db.all(
    `SELECT u.id, u.name, u.email, u.role, 
            p.nom, p.prenom, p.directeur, p.chef, p.fonction, p.matricule, p.direction
     FROM users u
     LEFT JOIN profiles p ON u.email = p.email
     WHERE u.role = 'user'`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      res.json(rows);
    }
  );
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const hashed = bcrypt.hashSync(cleanPassword, 10);

  db.run(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name.trim(), cleanEmail, hashed, "user"],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).json({ error: "Cet email existe déjà" });
        }
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json({ message: "Utilisateur ajouté ✅" });
    }
  );
});

app.post("/login", (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = (req.body.password || "").trim();

  db.get("SELECT * FROM users WHERE LOWER(email) = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    if (!user) {
      return res.status(401).json({ error: "Compte introuvable ou mot de passe incorrect" });
    }

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Compte introuvable ou mot de passe incorrect" });
    }

    db.get("SELECT * FROM profiles WHERE email = ?", [email], (err2, profile) => {
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        hasProfile: Boolean(profile)
      });
    });
  });
});

app.get("/profile/:email", (req, res) => {
  db.get("SELECT * FROM profiles WHERE email = ?", [req.params.email], (err, row) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    if (!row) return res.status(404).json({ error: "Profil introuvable" });
    res.json(row);
  });
});

app.post("/profile", (req, res) => {
  const { email, nom, prenom, directeur, chef, fonction, matricule, direction } = req.body;
  if (!email) return res.status(400).json({ error: "Email manquant" });

  db.run(
    `INSERT INTO profiles (email, nom, prenom, directeur, chef, fonction, matricule, direction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       nom=excluded.nom,
       prenom=excluded.prenom,
       directeur=excluded.directeur,
       chef=excluded.chef,
       fonction=excluded.fonction,
       matricule=excluded.matricule,
       direction=excluded.direction`,
    [email, nom, prenom, directeur, chef, fonction, matricule, direction],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur lors de l'enregistrement" });
      res.json({ message: "Profile saved ✅" });
    }
  );
});

app.get("/pointage/:email/:year/:month", (req, res) => {
  const { email, year, month } = req.params;
  db.get(
    "SELECT data FROM pointages WHERE email = ? AND year = ? AND month = ?",
    [email, year, month],
    (err, row) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      if (!row) return res.json({ data: {} });
      try {
        res.json({ data: JSON.parse(row.data) });
      } catch (e) {
        res.json({ data: {} });
      }
    }
  );
});

app.post("/pointage", (req, res) => {
  const { email, year, month, data } = req.body;
  if (!email || year === undefined || month === undefined) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  db.run(
    `INSERT INTO pointages (email, year, month, data)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(email, year, month) DO UPDATE SET data = excluded.data`,
    [email, year, month, JSON.stringify(data)],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur enregistrement" });
      res.json({ message: "Pointage enregistré ✅" });
    }
  );
});
// Envoyer un message (Employé -> Admin ou Admin -> Employé)
app.post("/messages", (req, res) => {
  const { sender_email, receiver_email, sujet, contenu } = req.body;

  if (!sender_email || !receiver_email || !contenu) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  db.run(
    `INSERT INTO messages (sender_email, receiver_email, sujet, contenu) VALUES (?, ?, ?, ?)`,
    [sender_email, receiver_email, sujet || "Sans objet", contenu],
    function (err) {
      if (err) {
        console.error("Erreur enregistrement message :", err);
        return res.status(500).json({ error: "Erreur base de données" });
      }
      res.json({ message: "Message envoyé avec succès ✅", id: this.lastID });
    }
  );
});

// Récupérer la conversation d'un employé (avec l'admin)
app.get("/messages/:email", (req, res) => {
  const userEmail = req.params.email;

  db.all(
    `SELECT * FROM messages 
     WHERE sender_email = ? OR receiver_email = ? 
     ORDER BY date_envoi ASC`,
    [userEmail, userEmail],
    (err, rows) => {
      if (err) {
        console.error("Erreur lecture messages :", err);
        return res.status(500).json({ error: "Erreur base de données" });
      }
      res.json(rows);
    }
  );
});
app.listen(5000, () => {
  console.log("Server marche ✅ sur http://localhost:5000");
});