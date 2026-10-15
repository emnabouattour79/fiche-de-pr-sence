import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    if (e) e.preventDefault();

    if (email === "" || password === "") {
      alert("Veuillez entrer email et mot de passe !");
      return;
    }

    setLoading(true);

    fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur de connexion");
        return data;
      })
      .then((user) => {
        localStorage.setItem("currentUser", JSON.stringify(user));

        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.hasProfile) {
          navigate("/calendar");
        } else {
          navigate("/profile");
        }
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer} onClick={() => navigate("/")}>
          <img
            src="/TPS.jpg"
            alt="Thyna Petroleum Services"
            className={styles.tpsLogo}
          />
        </div>

        <h2 className={styles.title}>Espace Connexion</h2>
        <p className={styles.subtitle}>Accédez à votre espace sécurisé</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Adresse e-mail</label>
            <input
              type="email"
              placeholder="ex: nom@tps.com.tn"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Mot de passe</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
  type="button"
  className={styles.togglePasswordBtn}
  onClick={() => setShowPassword(!showPassword)}
  title={showPassword ? "Masquer" : "Afficher"}
>
  {showPassword ? (
    /* Mot de passe visible -> Œil ouvert */
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#64748b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ) : (
    /* Mot de passe masqué -> Œil barré */
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#64748b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  )}
</button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.btnLogin}
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className={styles.footerText}>
          Pas encore de compte ?
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => navigate("/register")}
          >
            Créer un compte
          </button>
        </p>

        <button
          type="button"
          className={styles.backHome}
          onClick={() => navigate("/")}
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

export default Login;