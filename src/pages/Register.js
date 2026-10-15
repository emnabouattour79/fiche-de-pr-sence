import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = (e) => {
    if (e) e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert("Tous les champs sont obligatoires !");
      return;
    }
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    setLoading(true);

    fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");
        return data;
      })
      .then(() => {
        alert("Compte créé ✅ Vous pouvez maintenant vous connecter");
        navigate("/login");
      })
      .catch((err) => {
        alert("Erreur ❌ : " + err.message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <div className="register-logo-container" onClick={() => navigate("/")}>
          <img
            src="/TPS.jpg"
            alt="Thyna Petroleum Services"
            className="register-logo"
          />
        </div>

        <h2 className="register-title">Créer un compte</h2>
        <p className="register-subtitle">Rejoignez la plateforme interne TPS</p>

        <form onSubmit={handleRegister} className="register-form">
          <div className="register-input-group">
            <label className="register-label">Nom complet</label>
            <input
              type="text"
              placeholder="ex: Ahmed Ben Ali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="register-input"
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Adresse e-mail</label>
            <input
              type="email"
              placeholder="nom@tps.com.tn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="register-input"
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Mot de passe</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="register-input"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? (
                  /* Visible -> Œil ouvert */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  /* Masqué -> Œil barré */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="register-input-group">
            <label className="register-label">Confirmer le mot de passe</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="register-input"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Masquer" : "Afficher"}
              >
                {showConfirmPassword ? (
                  /* Visible -> Œil ouvert */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  /* Masqué -> Œil barré */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? "Création en cours..." : "S'inscrire"}
          </button>
        </form>

        <p className="register-footer-text">
          Vous avez déjà un compte ?
          <button
            type="button"
            className="register-link-btn"
            onClick={() => navigate("/login")}
          >
            Se connecter
          </button>
        </p>

        <button
          type="button"
          className="register-back-home"
          onClick={() => navigate("/")}
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

export default Register;