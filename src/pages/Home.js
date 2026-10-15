import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.homeWrapper}>
      <div className={styles.portalCard}>
        <div className={styles.logoContainer}>
          <img src="/TPS.jpg" alt="Thyna Petroleum Services" className={styles.tpsLogo} />
        </div>

        <h1 className={styles.portalTitle}>Portail d'Accès</h1>
        <p className={styles.portalSubtitle}>
          Bienvenue sur la plateforme interne de gestion et de services.
        </p>

        <div className={styles.actionGroup}>
          <button className={styles.btnPrimary} onClick={() => navigate("/login")}>
            Se connecter
          </button>
          <button className={styles.btnOutline} onClick={() => navigate("/register")}>
            Créer un compte
          </button>
        </div>

        <div className={styles.portalFooter}>
          Thyna Petroleum Services • Espace Sécurisé
        </div>
      </div>
    </div>
  );
}

export default Home;