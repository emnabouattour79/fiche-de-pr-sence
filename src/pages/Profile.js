import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [directeur, setDirecteur] = useState("");
  const [chef, setChef] = useState("");
  const [fonction, setFonction] = useState("");
  const [matricule, setMatricule] = useState("");
  const [direction, setDirection] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetch(`http://localhost:5000/profile/${user.email}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setNom(data.nom || "");
          setPrenom(data.prenom || "");
          setDirecteur(data.directeur || "");
          setChef(data.chef || "");
          setFonction(data.fonction || "");
          setMatricule(data.matricule || "");
          setDirection(data.direction || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = (e) => {
    if (e) e.preventDefault();

    if (!nom || !prenom || !directeur || !chef || !fonction || !matricule || !direction) {
      alert("Tous les champs sont obligatoires !");
      return;
    }

    const profile = {
      email: user.email,
      nom,
      prenom,
      directeur,
      chef,
      fonction,
      matricule,
      direction,
    };
    setLoading(true);

    fetch("http://localhost:5000/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur");
        return data;
      })
      .then(() => {
        alert("Profil enregistré ✅");
        navigate("/calendar");
      })
      .catch((err) => {
        alert("Erreur ❌ : " + err.message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src="/TPS.jpg"
            alt="Thyna Petroleum Services"
            className="profile-logo"
            onClick={() => navigate("/")}
          />
          <h2 className="profile-title">Fiche Employé(e)</h2>
          <p className="profile-subtitle">
            Complétez vos informations professionnelles
          </p>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Nom</label>
              <input
                type="text"
                placeholder="Nom de famille"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="profile-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Prénom</label>
              <input
                type="text"
                placeholder="Prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="profile-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Matricule</label>
              <input
                type="text"
                placeholder="ex: 10452"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="profile-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Fonction</label>
              <input
                type="text"
                placeholder="ex: Ingénieur Production"
                value={fonction}
                onChange={(e) => setFonction(e.target.value)}
                className="profile-input"
              />
            </div>

            <div className="input-group full-width">
              <label className="input-label">Direction</label>
              <input
                type="text"
                placeholder="ex: Direction des Opérations Pétrolières"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="profile-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Directeur</label>
              <input
                type="text"
                placeholder="Nom du directeur"
                value={directeur}
                onChange={(e) => setDirecteur(e.target.value)}
                className="profile-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Chef Hiérarchique</label>
              <input
                type="text"
                placeholder="Nom du chef direct"
                value={chef}
                onChange={(e) => setChef(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>

          <button type="submit" className="profile-btn" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer et continuer"}
          </button>
        </form>

        <div className="profile-footer">
          <button
            type="button"
            className="profile-back-btn"
            onClick={() => navigate("/")}
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;