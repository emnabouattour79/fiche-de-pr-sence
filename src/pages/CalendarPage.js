import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageAdministration from "./PageAdministration";
import Legende from "./legende";
import "./CalendarPage.css";

export const afficherHeures = (valeur) => {
  if (valeur === undefined || valeur === null || valeur === "") return "-";
  if (typeof valeur === "string") return valeur;
  if (typeof valeur === "number") {
    if (isNaN(valeur) || valeur <= 0) return "0h 00m";
    const h = Math.floor(valeur / 60);
    const m = Math.round(valeur % 60);
    return `${h}h ${String(m).padStart(2, "0")}m`;
  }
  return String(valeur);
};

// --- BOITE DE MESSAGERIE INTERNE ---
function BoiteMessagerie({ userEmail }) {
  const [messages, setMessages] = useState([]);
  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const adminEmail = "admin@entreprise.com";

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const myEmail = (userEmail || currentUser.email || "").trim().toLowerCase();

  const fetchMessages = () => {
    if (!myEmail) return;
    fetch(`http://localhost:5000/messages/${encodeURIComponent(myEmail)}`)
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erreur messages:", err));
  };

  useEffect(() => {
    fetchMessages();
  }, [myEmail]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!contenu.trim()) return;

    if (!myEmail) {
      alert("Erreur : Compte non reconnu. Veuillez vous reconnecter.");
      return;
    }

    setEnvoiEnCours(true);
    fetch("http://localhost:5000/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_email: myEmail,
        receiver_email: adminEmail,
        sujet: sujet.trim() || "Sans objet",
        contenu: contenu.trim()
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Échec de l'envoi");
        return data;
      })
      .then(() => {
        setSujet("");
        setContenu("");
        fetchMessages();
      })
      .catch((err) => alert("Erreur d'envoi : " + err.message))
      .finally(() => setEnvoiEnCours(false));
  };

  return (
    <div className="messagerie-container">
      <div className="messagerie-header">
        <h3>Boîte de dialogue avec l'Administration</h3>
        <span className="messagerie-dest">Destinataire officiel : {adminEmail}</span>
      </div>

      <div className="messagerie-feed">
        {messages.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", marginTop: "80px", fontStyle: "italic" }}>
            Aucun message échangé pour le moment.
          </p>
        ) : (
          messages.map((m) => {
            const isMe = (m.sender_email || "").trim().toLowerCase() === myEmail;
            return (
              <div key={m.id} className="msg-wrapper">
                <div className={`msg-bubble ${isMe ? "me" : "admin"}`}>
                  <div className="msg-meta">
                    <b>{isMe ? "Moi (Employé)" : "Administration"}</b> • {new Date(m.date_envoi).toLocaleString()}
                  </div>
                  {m.sujet && <div className="msg-subject">{m.sujet}</div>}
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.contenu}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="messagerie-form">
        <input
          type="text"
          placeholder="Objet / Sujet de la demande..."
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
        />
        <textarea
          rows="3"
          placeholder="Rédigez votre message à l'administration..."
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          style={{ resize: "vertical" }}
        />
        <button type="submit" disabled={envoiEnCours} className="btn-send">
          {envoiEnCours ? "Envoi..." : "Envoyer"}
        </button>
      </form>
    </div>
  );
}

// --- CALENDAR PAGE ---
function CalendarPage({ year, month, setYear, setMonth, targetEmail }) {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const activeEmail = targetEmail || currentUser?.email;
  const isAdmin = currentUser?.role === "admin" || localStorage.getItem("isAdmin") === "true";

  const [profile, setProfile] = useState(null);
  const [hoverChantier, setHoverChantier] = useState(null);
  const [openCell, setOpenCell] = useState(null);
  const [selectedValues, setSelectedValues] = useState({});
  const [hover, setHover] = useState(null);
  const [onglet, setOnglet] = useState("fiche");

  const isLoadingRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  const congesTypes = ["CP", "RC", "RP", "SS", "CN", "CM", "CD", "CS", "MA", "M", "AT", "AA", "AI", "AP", "MT"];
  const joursPris = Object.values(selectedValues).filter((v) => congesTypes.includes(v)).length;

  const itemStyle = {
    padding: "7px 12px",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "left"
  };

  const subMenuStyle = {
    position: "absolute",
    top: 0,
    left: "180px",
    background: "white",
    border: "1px solid #ccc",
    width: "180px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    zIndex: 100
  };

  const handleSelect = (index, value) => {
    setSelectedValues((prev) => ({
      ...prev,
      [index]: value
    }));
    setOpenCell(null);
  };

  // 1. Profil
  useEffect(() => {
    if (!activeEmail) return;

    fetch(`http://localhost:5000/profile/${encodeURIComponent(activeEmail)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Profil introuvable");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => console.log("Erreur profil:", err.message));
  }, [activeEmail]);

  // 2. Pointage
  useEffect(() => {
    if (!activeEmail) return;

    isLoadingRef.current = true;

    fetch(`http://localhost:5000/pointage/${encodeURIComponent(activeEmail)}/${year}/${month}`)
      .then((res) => res.json())
      .then(({ data }) => {
        setSelectedValues(data || {});
        isLoadingRef.current = false;
      })
      .catch((err) => {
        console.log("Erreur chargement pointage:", err.message);
        isLoadingRef.current = false;
      });
  }, [activeEmail, year, month]);

  // 3. Sauvegarde auto continue
  useEffect(() => {
    if (isLoadingRef.current) return;
    if (!activeEmail) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      fetch("http://localhost:5000/pointage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeEmail, year, month, data: selectedValues })
      }).catch((err) => console.log("Erreur sauvegarde auto:", err.message));
    }, 400);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [selectedValues, activeEmail, year, month]);

  const handlePrint = () => {
    window.print();
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const parseNum = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const convertirEnMinutes = (texte) => {
    if (!texte || typeof texte !== "string" || !texte.includes(":")) return null;
    const parts = texte.trim().split(":");
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  const formatMinutes = (totalMinutes) => {
    if (!totalMinutes || totalMinutes <= 0) return "0h 00m";
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    return `${h}h ${String(m).padStart(2, "0")}m`;
  };

  // 1. CUMUL MATIN (à partir de 08:00)
  const totalMatinMinutes = Array.from({ length: daysInMonth }, (_, i) => {
    const debut = convertirEnMinutes(selectedValues[i + "_hd"]);
    if (debut === null) return 0;

    const baseMatin = 8 * 60;
    const finMatin = 12 * 60;

    if (debut > baseMatin && debut <= finMatin) {
      return debut - baseMatin;
    }
    return 0;
  }).reduce((sum, min) => sum + min, 0);

  // 2. CUMUL APRÈS-MIDI (à partir de 13:00)
  const totalApresMidiMinutes = Array.from({ length: daysInMonth }, (_, i) => {
    const fin = convertirEnMinutes(selectedValues[i + "_hf"]);
    if (fin === null) return 0;

    const baseAprem = 13 * 60;
    const finAprem = 18 * 60;

    if (fin > baseAprem && fin <= finAprem) {
      return fin - baseAprem;
    }
    return 0;
  }).reduce((sum, min) => sum + min, 0);

  // Jours fériés tunisiens
  const isJourFerie = (d, m) => {
    if (d === 1 && m === 0) return true;
    if (d === 14 && m === 0) return true;
    if (d === 20 && m === 2) return true;
    if (d === 9 && m === 3) return true;
    if (d === 1 && m === 4) return true;
    if (d === 25 && m === 6) return true;
    if (d === 13 && m === 7) return true;
    if (d === 15 && m === 9) return true;
    return false;
  };

  const totalAbsences = Array.from({ length: daysInMonth }, (_, i) => i).filter((i) => selectedValues[i]).length;
  const totalPresences = Array.from({ length: daysInMonth }, (_, i) => i).filter((i) => selectedValues[i + "_p"]).length;

  const totalHeuresSuppJour = Array.from({ length: daysInMonth }, (_, i) => i).reduce(
    (sum, i) => sum + parseNum(selectedValues[i + "_hsj"]),
    0
  );
  const totalHeuresSuppNuit = Array.from({ length: daysInMonth }, (_, i) => i).reduce(
    (sum, i) => sum + parseNum(selectedValues[i + "_hsn"]),
    0
  );
  const totalHeuresSuppComp = Array.from({ length: daysInMonth }, (_, i) => i).reduce(
    (sum, i) => sum + parseNum(selectedValues[i + "_hsc"]),
    0
  );
  const totalHeuresMoinsNombre = Array.from({ length: daysInMonth }, (_, i) => i).reduce(
    (sum, i) => sum + parseNum(selectedValues[i + "_hmn"]),
    0
  );
  const totalHeuresMoinsRecup = Array.from({ length: daysInMonth }, (_, i) => i).reduce(
    (sum, i) => sum + parseNum(selectedValues[i + "_hmr"]),
    0
  );

  return (
    <div className="calendar-page-wrapper">
      <div className="fiche-card">
        {/* En-tête avec petit logo TPS et navigation */}
        <div className="header-top-bar no-print">
          <img
            src="/TPS.jpg"
            alt="Thyna Petroleum Services"
            className="tps-header-logo"
            onClick={() => navigate("/")}
            title="Retour à l'accueil"
          />

          <div className="calendar-tabs">
            <button
              type="button"
              className={`calendar-tab-btn ${onglet === "fiche" ? "active" : ""}`}
              onClick={() => setOnglet("fiche")}
            >
              Fiche de Présence
            </button>
            <button
              type="button"
              className={`calendar-tab-btn ${onglet === "legende" ? "active" : ""}`}
              onClick={() => setOnglet("legende")}
            >
              Légende des pointages
            </button>
            <button
              type="button"
              className={`calendar-tab-btn ${onglet === "messages" ? "active" : ""}`}
              onClick={() => setOnglet("messages")}
            >
              ✉ Messagerie interne
            </button>
          </div>
        </div>

        {/* CONTENU : LÉGENDE AVEC BOUTON IMPRIMER EN BAS */}
        {onglet === "legende" && (
          <div>
            <Legende />
            <div className="bottom-print-container no-print">
              <button type="button" onClick={handlePrint} className="btn-print">
                🖨️ Imprimer la légende
              </button>
            </div>
          </div>
        )}

        {/* CONTENU : MESSAGERIE */}
        {onglet === "messages" && <BoiteMessagerie userEmail={activeEmail} />}

        {/* CONTENU : FICHE CALENDRIER */}
        {onglet === "fiche" && (
          <div>
            <h2 className="fiche-main-title">FICHE INDIVIDUELLE DE PRÉSENCE</h2>

            {profile && (
              <div className="profile-banner">
                <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <p><b>NOM ET PRÉNOM AGENT :</b> {profile.nom} {profile.prenom}</p>
                  <p><b>NOM DU DIRECTEUR :</b> {profile.directeur}</p>
                  <p><b>NOM DU CHEF HIÉRARCHIQUE :</b> {profile.chef}</p>
                  <p><b>FONCTION :</b> {profile.fonction}</p>
                </div>

                <div style={{ textAlign: "center" }}>
                  <p><b>MATRICULE :</b> {profile.matricule}</p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p><b>DIRECTION :</b> {profile.direction}</p>
                </div>
              </div>
            )}

            <div style={{ textAlign: "center" }}>
              <input
                className="month-selector no-print"
                type="month"
                value={`${year}-${String(month + 1).padStart(2, "0")}`}
                onChange={(e) => {
                  const value = e.target.value.split("-");
                  setYear(parseInt(value[0]));
                  setMonth(parseInt(value[1]) - 1);
                }}
              />
            </div>

            <div className="fiche-table-container">
              <table className="fiche-table" border="1">
                <thead>
                  <tr>
                    <td
                      style={{
                        fontWeight: "bold",
                        textAlign: "left",
                        padding: "10px",
                        color: "#0f2757",
                        minWidth: "60px"
                      }}
                    >
                      Calendrier
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <td key={i}>{i + 1}</td>
                    ))}
                    <td className="sticky-total-cell" style={{ zIndex: 3, minWidth: "60px", padding: "2px" }}>
                      Totaux
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {/* Ligne des jours / SE / DI / Fériés */}
                  <tr>
                    <td></td>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const dateObj = new Date(year, month, day);
                      const dayOfWeek = dateObj.getDay();

                      const ferie = isJourFerie(day, month);

                     let display = "";
let bgColor = "#ffffff";
let textColor = "#0f2757";

// Samedi (SE) : Gris bleuté doux
if (dayOfWeek === 6) {
  display = "SE";
  bgColor = "#e2e8f0";     // Fond gris clair texturé
  textColor = "#334155";   // Texte ardoise foncé
} 
// Dimanche (DI) : Teinte bleue TPS pastel
else if (dayOfWeek === 0) {
  display = "DI";
  bgColor = "#cbd5e1";     // Fond grisé soutenu
  textColor = "#0f2757";   // Texte bleu pétrole TPS
} 
// Jours Fériés (FE) : Orange ambré chaleureux
else if (ferie) {
  display = "FE";
  bgColor = "#fed7aa";     // Fond orange pastel doux
  textColor = "#c2410c";   // Texte orange vif / ambré
}

                      return (
                        <td
  key={i}
  style={{
    border: "1px solid #cbd5e1",
    padding: "5px",
    minWidth: "42px",
    textAlign: "center",
    backgroundColor: bgColor,
    color: textColor,
    fontWeight: ferie || dayOfWeek === 0 || dayOfWeek === 6 ? "bold" : "normal"
  }}
>
  {display}
</td>
                      );
                    })}
                    <td className="sticky-total-cell"></td>
                  </tr>

                  {/* ABSENCES */}
                  <tr>
                    <td style={{ width: "120px", fontWeight: "bold", textAlign: "left", padding: "5px", color: "#0f2757" }}>
                      Absences
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <td key={i} style={{ position: "relative" }}>
                        <div className="pointage-select-box" onClick={() => setOpenCell("a_" + i)}>
                          {selectedValues[i] || "..."}
                        </div>

                        {openCell === "a_" + i && (
                          <div
                            onMouseLeave={() => {
                              setOpenCell(null);
                              setHover(null);
                            }}
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              background: "white",
                              border: "1px solid #ccc",
                              width: "180px",
                              zIndex: 100
                            }}
                          >
                            <div
                              onMouseEnter={(e) => {
                                setHover("conges");
                                e.target.style.background = "#e0e0e0";
                              }}
                              onMouseLeave={(e) => (e.target.style.background = "white")}
                              style={itemStyle}
                            >
                              Congés
                            </div>
                            {hover === "conges" && (
                              <div style={subMenuStyle}>
                                {["CP", "RC", "RP", "SS"].map((v) => (
                                  <div
                                    key={v}
                                    style={itemStyle}
                                    onMouseEnter={(e) => (e.target.style.background = "#eee")}
                                    onMouseLeave={(e) => (e.target.style.background = "white")}
                                    onClick={() => handleSelect(i, v)}
                                  >
                                    {v}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div
                              onMouseEnter={(e) => {
                                setHover("spec");
                                e.target.style.background = "#e0e0e0";
                              }}
                              onMouseLeave={(e) => (e.target.style.background = "white")}
                              style={itemStyle}
                            >
                              Congés spéciaux
                            </div>
                            {hover === "spec" && (
                              <div style={subMenuStyle}>
                                {["CN", "CM", "CD", "CS", "MA"].map((v) => (
                                  <div
                                    key={v}
                                    style={itemStyle}
                                    onMouseEnter={(e) => (e.target.style.background = "#eee")}
                                    onMouseLeave={(e) => (e.target.style.background = "white")}
                                    onClick={() => handleSelect(i, v)}
                                  >
                                    {v}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div
                              onMouseEnter={(e) => {
                                setHover("abs");
                                e.target.style.background = "#e0e0e0";
                              }}
                              onMouseLeave={(e) => (e.target.style.background = "white")}
                              style={itemStyle}
                            >
                              Absences
                            </div>
                            {hover === "abs" && (
                              <div style={subMenuStyle}>
                                {["M", "AT", "AA", "AI", "AP", "MT"].map((v) => (
                                  <div
                                    key={v}
                                    style={itemStyle}
                                    onMouseEnter={(e) => (e.target.style.background = "#eee")}
                                    onMouseLeave={(e) => (e.target.style.background = "white")}
                                    onClick={() => handleSelect(i, v)}
                                  >
                                    {v}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="sticky-total-cell">{totalAbsences}</td>
                  </tr>

                  {/* PRÉSENCES */}
                  <tr>
                    <td style={{ width: "120px", fontWeight: "bold", textAlign: "left", padding: "10px", color: "#0f2757" }}>
                      Présences
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <td key={i} style={{ position: "relative" }}>
                        <div className="pointage-select-box" onClick={() => setOpenCell("p_" + i)}>
                          {selectedValues[i + "_p"] || "..."}
                        </div>

                        {openCell === "p_" + i && (
                          <div
                            onMouseLeave={() => {
                              setOpenCell(null);
                              setHover(null);
                              setHoverChantier(null);
                            }}
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              background: "white",
                              border: "1px solid #ccc",
                              width: "180px",
                              zIndex: 100
                            }}
                          >
                            <div
                              onMouseEnter={(e) => {
                                setHover("presence");
                                e.target.style.background = "#eee";
                              }}
                              onMouseLeave={(e) => (e.target.style.background = "white")}
                              style={itemStyle}
                            >
                              Présences
                            </div>
                            {hover === "presence" && (
                              <div style={subMenuStyle}>
                                {["PN", "PP", "AD", "AB", "MP", "PK"].map((v) => (
                                  <div
                                    key={v}
                                    style={itemStyle}
                                    onMouseEnter={(e) => (e.target.style.background = "#eee")}
                                    onMouseLeave={(e) => (e.target.style.background = "white")}
                                    onClick={() => handleSelect(i + "_p", v)}
                                  >
                                    {v}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div
                              onMouseEnter={(e) => {
                                setHover("dep");
                                e.target.style.background = "#e6e6e6";
                              }}
                              onMouseLeave={(e) => (e.target.style.background = "white")}
                              style={itemStyle}
                            >
                              Déplacements
                            </div>
                            {hover === "dep" && (
                              <div style={subMenuStyle}>
                                {["DT", "DE", "DR", "AU"].map((v) => (
                                  <div
                                    key={v}
                                    style={itemStyle}
                                    onMouseEnter={(e) => (e.target.style.background = "#eee")}
                                    onMouseLeave={(e) => (e.target.style.background = "white")}
                                    onClick={() => handleSelect(i + "_p", v)}
                                  >
                                    {v}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div
                              onMouseEnter={(e) => {
                                setHover("form");
                                e.target.style.background = "#eee";
                              }}
                              onMouseLeave={(e) => (e.target.style.background = "white")}
                              style={itemStyle}
                            >
                              Formation
                            </div>
                            {hover === "form" && (
                              <div style={subMenuStyle}>
                                {["FT", "FF", "FR", "FO"].map((v) => (
                                  <div
                                    key={v}
                                    style={itemStyle}
                                    onMouseEnter={(e) => (e.target.style.background = "#eee")}
                                    onMouseLeave={(e) => (e.target.style.background = "white")}
                                    onClick={() => handleSelect(i + "_p", v)}
                                  >
                                    {v}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div
                              onMouseEnter={(e) => {
                                setHover("chantier");
                                e.target.style.background = "#e6e6e6";
                              }}
                              onMouseLeave={(e) => (e.target.style.background = "white")}
                              style={itemStyle}
                            >
                              Chantiers
                            </div>
                            {hover === "chantier" && (
                              <div style={subMenuStyle}>
                                {[
                                  { name: "BARK BATTERY", jour: "TX", nuit: "TN" },
                                  { name: "EL AIN", jour: "AX", nuit: "AN" },
                                  { name: "GUEBIBA", jour: "GX", nuit: "GN" },
                                  { name: "CERCINA", jour: "FX", nuit: "FN" },
                                  { name: "HAJEB", jour: "HX", nuit: "HN" },
                                  { name: "REMADA", jour: "RX", nuit: "RN" },
                                  { name: "WORK OVER", jour: "WX", nuit: "WF" },
                                  { name: "CFTP", jour: "LX", nuit: "LN" }
                                ].map((c, index) => (
                                  <div key={index} style={{ position: "relative" }}>
                                    <div
                                      onMouseEnter={() => setHoverChantier(index)}
                                      style={itemStyle}
                                    >
                                      {c.name} ▶
                                    </div>
                                    {hoverChantier === index && (
                                      <div
                                        style={{
                                          position: "absolute",
                                          top: 0,
                                          left: "180px",
                                          background: "white",
                                          border: "1px solid gray",
                                          width: "160px",
                                          zIndex: 200
                                        }}
                                      >
                                        <div
                                          style={itemStyle}
                                          onMouseEnter={(e) => (e.target.style.background = "#eee")}
                                          onMouseLeave={(e) => (e.target.style.background = "white")}
                                          onClick={() => handleSelect(i + "_p", c.jour)}
                                        >
                                          De Jour → {c.jour}
                                        </div>
                                        <div
                                          style={itemStyle}
                                          onMouseEnter={(e) => (e.target.style.background = "#eee")}
                                          onMouseLeave={(e) => (e.target.style.background = "white")}
                                          onClick={() => handleSelect(i + "_p", c.nuit)}
                                        >
                                          De Nuit → {c.nuit}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="sticky-total-cell">{totalPresences}</td>
                  </tr>

                  {/* HEURES DE MOUVEMENT */}
                  <tr>
                    <td
                      rowSpan={2}
                      style={{
                        width: "300px",
                        minWidth: "300px",
                        padding: 0,
                        border: "1px solid #0f2757",
                        color: "#0f2757"
                      }}
                    >
                      <table style={{ width: "100%", height: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                          <tr style={{ height: "50%" }}>
                            <td
                              rowSpan={2}
                              style={{
                                borderRight: "1px solid #0f2757",
                                fontWeight: "bold",
                                fontSize: "17px",
                                textAlign: "left",
                                padding: "4px",
                                color: "#0f2757",
                                verticalAlign: "middle"
                              }}
                            >
                              HEURES DE MOUVEMENT
                            </td>
                            <td
                              style={{
                                width: "90px",
                                borderBottom: "1px solid #0f2757",
                                fontWeight: "bold",
                                fontSize: "15px",
                                textAlign: "left",
                                padding: "5px",
                                color: "#0f2757",
                                verticalAlign: "middle"
                              }}
                            >
                              DÉBUT
                            </td>
                          </tr>
                          <tr style={{ height: "50%" }}>
                            <td
                              style={{
                                width: "90px",
                                fontWeight: "bold",
                                fontSize: "15px",
                                textAlign: "left",
                                padding: "4px",
                                color: "#0f2757",
                                verticalAlign: "middle"
                              }}
                            >
                              FIN
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <td key={i}>
                        <input
                          type="time"
                          step="60"
                          value={selectedValues[i + "_hd"] || ""}
                          onChange={(e) => handleSelect(i + "_hd", e.target.value)}
                          style={{
                            width: "90px",
                            fontSize: "12px",
                            padding: "1px",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            textAlign: "center"
                          }}
                        />
                      </td>
                    ))}

                    <td rowSpan={2} className="sticky-total-cell" style={{ fontSize: "14px", fontWeight: "bold" }}>
                      <div>Matin : {formatMinutes(totalMatinMinutes)}</div>
                      <div>Après-midi : {formatMinutes(totalApresMidiMinutes)}</div>
                    </td>
                  </tr>

                  <tr>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <td key={i}>
                        <input
                          type="time"
                          step="60"
                          value={selectedValues[i + "_hf"] || ""}
                          onChange={(e) => handleSelect(i + "_hf", e.target.value)}
                          style={{
                            width: "90px",
                            fontSize: "12px",
                            padding: "1px",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            textAlign: "center"
                          }}
                        />
                      </td>
                    ))}
                  </tr>

                  {/* HEURES SUPPLÉMENTAIRES */}
                  <tr>
                    <td
                      rowSpan={3}
                      style={{
                        width: "300px",
                        minWidth: "300px",
                        padding: 0,
                        border: "1px solid #0f2757"
                      }}
                    >
                      <table style={{ width: "100%", height: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                          <tr style={{ height: "33.33%" }}>
                            <td
                              rowSpan={3}
                              style={{
                                borderRight: "1px solid #0f2757",
                                fontWeight: "bold",
                                fontSize: "17px",
                                textAlign: "left",
                                padding: "5px",
                                color: "#0f2757",
                                verticalAlign: "middle"
                              }}
                            >
                              NOMBRE HEURES<br />SUPPLÉMENTAIRES
                            </td>
                            <td
                              style={{
                                width: "100px",
                                borderBottom: "1px solid #0f2757",
                                fontWeight: "bold",
                                fontSize: "15px",
                                textAlign: "left",
                                padding: "5px",
                                color: "#0f2757",
                                verticalAlign: "middle"
                              }}
                            >
                              DE JOUR
                            </td>
                          </tr>
                          <tr style={{ height: "33.33%" }}>
                            <td
                              style={{
                                width: "100px",
                                borderBottom: "1px solid #0f2757",
                                fontWeight: "bold",
                                fontSize: "15px",
                                textAlign: "left",
                                padding: "5px",
                                color: "#0f2757",
                                verticalAlign: "middle"
                              }}
                            >
                              DE NUIT
                            </td>
                          </tr>
                          <tr style={{ height: "33.33%" }}>
                            <td
                              style={{
                                width: "100px",
                                fontWeight: "bold",
                                fontSize: "15px",
                                textAlign: "left",
                                padding: "5px",
                                color: "#0f2757",
                                verticalAlign: "middle"
                              }}
                            >
                              COMPENSAT
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <td key={i}>
                        <input
                          type="number"
                          min="0"
                          value={selectedValues[i + "_hsj"] || ""}
                          onChange={(e) => handleSelect(i + "_hsj", e.target.value)}
                          style={{ width: "50px", textAlign: "center" }}
                        />
                      </td>
                    ))}
                    <td className="sticky-total-cell">{totalHeuresSuppJour}</td>
                  </tr>

                  <tr>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <td key={i}>
                        <input
                          type="number"
                          min="0"
                          value={selectedValues[i + "_hsn"] || ""}
                          onChange={(e) => handleSelect(i + "_hsn", e.target.value)}
                          style={{ width: "50px", textAlign: "center" }}
                        />
                      </td>
                    ))}
                    <td className="sticky-total-cell">{totalHeuresSuppNuit}</td>
                  </tr>

                  <tr>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <td key={i}>
                        <input
                          type="number"
                          min="0"
                          value={selectedValues[i + "_hsc"] || ""}
                          onChange={(e) => handleSelect(i + "_hsc", e.target.value)}
                          style={{ width: "50px", textAlign: "center" }}
                        />
                      </td>
                    ))}
                    <td className="sticky-total-cell">{totalHeuresSuppComp}</td>
                  </tr>

                  {/* HEURES EN MOINS */}
                  <tr>
                    <td
                      rowSpan={2}
                      style={{
                        width: "300px",
                        minWidth: "300px",
                        padding: 0,
                        border: "1px solid #0f2757"
                      }}
                    >
                      <table style={{ width: "100%", height: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                          <tr style={{ height: "50%" }}>
                            <td
                              rowSpan={2}
                              style={{
                                borderRight: "1px solid #0f2757",
                                fontWeight: "bold",
                                fontSize: "17px",
                                textAlign: "left",
                                padding: "4px",
                                color: "#0f2757",
                                verticalAlign: "middle"
                              }}
                            >
                              HEURES EN MOINS
                            </td>
                            <td
                              style={{
                                width: "100px",
                                borderBottom: "1px solid #0f2757",
                                fontWeight: "bold",
                                fontSize: "15px",
                                textAlign: "left",
                                padding: "4px",
                                color: "#0f2757",
                                verticalAlign: "middle"
                              }}
                            >
                              NOMBRE
                            </td>
                          </tr>
                          <tr style={{ height: "50%" }}>
                            <td
                              style={{
                                width: "100px",
                                fontWeight: "bold",
                                fontSize: "15px",
                                textAlign: "left",
                                padding: "4px",
                                color: "#0f2757",
                                verticalAlign: "middle"
                              }}
                            >
                              RECUPERAT
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <td key={i}>
                        <input
                          type="number"
                          min="0"
                          value={selectedValues[i + "_hmn"] || ""}
                          onChange={(e) => handleSelect(i + "_hmn", e.target.value)}
                          style={{ width: "50px", textAlign: "center" }}
                        />
                      </td>
                    ))}
                    <td className="sticky-total-cell">{totalHeuresMoinsNombre}</td>
                  </tr>

                  <tr>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <td key={i}>
                        <input
                          type="number"
                          min="0"
                          value={selectedValues[i + "_hmr"] || ""}
                          onChange={(e) => handleSelect(i + "_hmr", e.target.value)}
                          style={{ width: "50px", textAlign: "center" }}
                        />
                      </td>
                    ))}
                    <td className="sticky-total-cell">{totalHeuresMoinsRecup}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BOUTON IMPRIMER AU DESSOUS DU TABLEAU */}
            <div className="bottom-print-container no-print">
              <button type="button" onClick={handlePrint} className="btn-print">
                🖨️ Imprimer la fiche
              </button>
            </div>

            {/* PAGE ADMINISTRATION */}
            <div style={{ marginTop: "15px", display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: "1000px" }}>
                <PageAdministration
                  year={year}
                  month={month}
                  joursPris={joursPris}
                  targetEmail={activeEmail}
                  isAdmin={isAdmin}
                  selectedValues={selectedValues}
                  handleSelect={handleSelect}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPage;