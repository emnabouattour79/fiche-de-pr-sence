const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  // 1. Table users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    )
  `);

  // 2. Table profiles
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

  // 3. Table pointages
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

  // 4. Insérer le compte administrateur (admin123)
  const hashAdmin123 = '$2b$10$.3yvW2p/R/KAhdn7/4uetOpqCvXNj82U5ptGbm45g6TZQ26eXCm8y';
  
  db.run(
    `INSERT OR REPLACE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ['admin', 'admin@entreprise.com', hashAdmin123, 'admin'],
    function (err) {
      if (err) {
        console.error("Erreur insertion admin:", err.message);
      } else {
        console.log("✅ Base de donnees recreee avec succes !");
        console.log("✅ Compte admin@entreprise.com pret (mdp: admin123).");
      }
      db.close();
    }
  );
});