import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CalendarPage from "./CalendarPage";
import "./Admin.css";

// --- COMPOSANT DE MESSAGERIE DÉDIÉ À L'ADMINISTRATEUR ---
function AdminMessagerie({ selectedUserEmail, selectedUserName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [sujet, setSujet] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const adminEmail = "admin@entreprise.com";

  const fetchMessages = () => {
    if (!selectedUserEmail) return;
    fetch(`http://localhost:5000/messages/${encodeURIComponent(selectedUserEmail)}`)
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erreur chargement messages:", err));
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedUserEmail]);

  const handleReply = (e) => {
    e.preventDefault();
    if (!contenu.trim() || !selectedUserEmail) return;

    setEnvoiEnCours(true);
    fetch("http://localhost:5000/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_email: adminEmail,
        receiver_email: selectedUserEmail,
        sujet: sujet.trim() || "Réponse Direction",
        contenu: contenu.trim()
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
        return data;
      })
      .then(() => {
        setContenu("");
        setSujet("");
        fetchMessages();
      })
      .catch((err) => alert(err.message))
      .finally(() => setEnvoiEnCours(false));
  };

  return (
    <div className="admin-panel-card">
      <div className="admin-panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={process.env.PUBLIC_URL + "/TPS.jpg"}
            alt="TPS Logo"
            onError={(e) => {
              if (!e.target.dataset.triedPng) {
                e.target.dataset.triedPng = "true";
                e.target.src = process.env.PUBLIC_URL + "/TPS.png";
              } else {
                e.target.style.display = "none";
              }
            }}
            style={{
              height: "38px",
              width: "auto",
              borderRadius: "4px",
              objectFit: "contain"
            }}
          />
          <div>
            <span className="admin-panel-eyebrow">Messagerie avec l'employé :</span>
            <h3 className="admin-panel-name">
              {selectedUserName || selectedUserEmail} ({selectedUserEmail})
            </h3>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={fetchMessages} className="admin-btn-refresh">
            🔄 Actualiser
          </button>
          <button type="button" onClick={onClose} className="admin-btn-close">
            ✕ Fermer la messagerie
          </button>
        </div>
      </div>

      {/* Zone de discussion */}
      <div className="messagerie-feed" style={{ height: "300px", marginBottom: "15px" }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", marginTop: "110px", fontStyle: "italic" }}>
            Aucun message échangé avec cet employé.
          </p>
        ) : (
          messages.map((m) => {
            const isAdminSender = m.sender_email === adminEmail;
            return (
              <div key={m.id} className="msg-wrapper">
                <div className={`msg-bubble ${isAdminSender ? "me" : "admin"}`}>
                  <div className="msg-meta">
                    <b>{isAdminSender ? "Moi (Admin)" : (selectedUserName || m.sender_email)}</b> • {new Date(m.date_envoi).toLocaleString()}
                  </div>
                  {m.sujet && <div className="msg-subject">{m.sujet}</div>}
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.contenu}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Formulaire de réponse */}
      <form onSubmit={handleReply} className="messagerie-form" style={{ padding: 0, border: "none" }}>
        <input
          type="text"
          className="msg-input"
          placeholder="Objet / Sujet de la réponse..."
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
        />
        <textarea
          rows="3"
          className="msg-input"
          placeholder={`Écrire une réponse à ${selectedUserName || selectedUserEmail}...`}
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          style={{ resize: "vertical" }}
        />
        <button type="submit" disabled={envoiEnCours} className="btn-send">
          {envoiEnCours ? "Envoi..." : "Envoyer la réponse"}
        </button>
      </form>
    </div>
  );
}

// --- PORTAIL ADMINISTRATION PRINCIPAL ---
function Admin() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedEmpEmail, setSelectedEmpEmail] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const [selectedMessageEmp, setSelectedMessageEmp] = useState(null);

  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    matricule: "",
    fonction: "",
    direction: "",
    directeur: "",
    chef: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
      return;
    }
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    setLoading(true);
    fetch("http://localhost:5000/profiles", {
      headers: { "x-user-role": currentUser?.role },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Accès non autorisé ou serveur indisponible");
        return res.json();
      })
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const handleEditClick = (emp) => {
    setEditingEmp(emp);
    setFormData({
      nom: emp.nom || "",
      prenom: emp.prenom || "",
      matricule: emp.matricule || "",
      fonction: emp.fonction || "",
      direction: emp.direction || "",
      directeur: emp.directeur || "",
      chef: emp.chef || ""
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaving(true);

    fetch(`http://localhost:5000/admin/profile/${editingEmp.email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": currentUser.role
      },
      body: JSON.stringify(formData)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de sauvegarde");
        return res.json();
      })
      .then(() => {
        alert("Informations mises à jour ✅");
        setEditingEmp(null);
        loadEmployees();
      })
      .catch((err) => alert(err.message))
      .finally(() => setSaving(false));
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.toLowerCase();
    const fullName = `${emp.nom || ""} ${emp.prenom || ""} ${emp.name || ""}`.toLowerCase();
    const email = (emp.email || "").toLowerCase();
    const matricule = (emp.matricule || "").toLowerCase();
    return fullName.includes(q) || email.includes(q) || matricule.includes(q);
  });

  return (
    <div className="admin-wrapper">
      <div className="admin-container">
        
        {/* HEADER UNIQUE AVEC LOGO ET TITRE */}
        <header className="admin-header-card">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src={process.env.PUBLIC_URL + "/TPS.jpg"}
                alt="TPS Logo"
                onError={(e) => {
                  if (!e.target.dataset.triedPng) {
                    e.target.dataset.triedPng = "true";
                    e.target.src = process.env.PUBLIC_URL + "/TPS.png";
                  } else {
                    e.target.style.display = "none";
                  }
                }}
                style={{
                  height: "36px",
                  width: "auto",
                  borderRadius: "6px",
                  objectFit: "contain",
                  cursor: "pointer"
                }}
                onClick={() => navigate("/")}
                title="Retour à l'accueil"
              />
              <h1 className="admin-header-title" style={{ margin: 0 }}>
                Portail Administration
              </h1>
            </div>

            <p className="admin-header-subtitle" style={{ marginTop: "6px" }}>
              Supervision globale des comptes employés, présences et pointages TPS
            </p>
          </div>

          <button type="button" onClick={handleLogout} className="admin-btn-logout">
            Déconnexion
          </button>
        </header>

        {/* MESSAGERIE EMPLOYÉ SÉLECTIONNÉ */}
        {selectedMessageEmp && (
          <AdminMessagerie
            selectedUserEmail={selectedMessageEmp.email}
            selectedUserName={selectedMessageEmp.nom ? `${selectedMessageEmp.nom} ${selectedMessageEmp.prenom}` : selectedMessageEmp.name}
            onClose={() => setSelectedMessageEmp(null)}
          />
        )}

        {/* VUE CALENDRIER EMPLOYÉ SÉLECTIONNÉ */}
        {selectedEmpEmail && (
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <div>
                <span className="admin-panel-eyebrow">Consultation en cours :</span>
                <h3 className="admin-panel-name">
                  {employees.find(e => e.email === selectedEmpEmail)?.nom || selectedEmpEmail}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedEmpEmail(null)}
                className="admin-btn-close"
              >
                ✕ Fermer la fiche
              </button>
            </div>

            <CalendarPage
              year={year}
              month={month}
              setYear={setYear}
              setMonth={setMonth}
              targetEmail={selectedEmpEmail}
            />
          </div>
        )}

        {/* CARTES STATISTIQUES */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Employés</div>
            <div className="admin-stat-value admin-stat-blue">
              {employees.length}
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Profils Complets</div>
            <div className="admin-stat-value admin-stat-green">
              {employees.filter(e => e.matricule).length}
            </div>
          </div>
        </div>

        {/* RECHERCHE & SÉLECTEUR */}
        <div className="admin-filter-bar">
          <input 
            type="text"
            placeholder="🔍 Rechercher par nom, email, ou matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />

          <select
            value={selectedEmpEmail || ""}
            onChange={(e) => setSelectedEmpEmail(e.target.value || null)}
            className="admin-select-quick"
          >
            <option value="">Sélectionner un employé directement...</option>
            {employees.map((emp) => (
              <option key={emp.email} value={emp.email}>
                {emp.nom ? `${emp.nom} ${emp.prenom}` : emp.name || emp.email} ({emp.matricule || "Sans matricule"})
              </option>
            ))}
          </select>
        </div>

        {/* TABLEAU PRINCIPAL */}
        <div className="admin-table-container">
          {loading && <p style={{ padding: "30px", textAlign: "center", color: "#666" }}>Chargement des employés...</p>}
          {error && <p style={{ padding: "30px", textAlign: "center", color: "#d9534f" }}>{error}</p>}

          {!loading && !error && (
            <table className="admin-main-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Email</th>
                  <th>Matricule</th>
                  <th>Fonction & Direction</th>
                  <th>Statut Profil</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#888" }}>
                      Aucun employé correspondant.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id || emp.email}>
                      <td>
                        <strong>{emp.nom ? `${emp.nom} ${emp.prenom}` : emp.name}</strong>
                      </td>
                      <td>{emp.email}</td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>
                          {emp.matricule || "—"}
                        </span>
                      </td>
                      <td>
                        <div>{emp.fonction || "Non renseignée"}</div>
                        <small style={{ color: "#777" }}>{emp.direction || ""}</small>
                      </td>
                      <td>
                        {emp.matricule ? (
                          <span className="admin-badge-success">Complet</span>
                        ) : (
                          <span className="admin-badge-warning">À renseigner</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          onClick={() => handleEditClick(emp)}
                          className="admin-btn-action admin-btn-edit"
                        >
                          ✏️ Profil
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMessageEmp(emp);
                            window.scrollTo({ top: 120, behavior: "smooth" });
                          }}
                          className="admin-btn-action admin-btn-msg"
                        >
                          ✉️ Message
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmpEmail(emp.email);
                            window.scrollTo({ top: 120, behavior: "smooth" });
                          }}
                          className="admin-btn-action admin-btn-calendar"
                        >
                          📅 Pointage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* MODALE ÉDITION DU PROFIL */}
        {editingEmp && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h3>Modifier les coordonnées de {editingEmp.nom || editingEmp.name}</h3>
                <button type="button" onClick={() => setEditingEmp(null)} className="admin-modal-close">✕</button>
              </div>

              <form onSubmit={handleSaveProfile} className="admin-modal-form">
                <div className="admin-modal-grid-2">
                  <div>
                    <label className="admin-modal-label">Nom</label>
                    <input 
                      className="admin-modal-input" 
                      value={formData.nom} 
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="admin-modal-label">Prénom</label>
                    <input 
                      className="admin-modal-input" 
                      value={formData.prenom} 
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div className="admin-modal-grid-2">
                  <div>
                    <label className="admin-modal-label">Matricule</label>
                    <input 
                      className="admin-modal-input" 
                      value={formData.matricule} 
                      onChange={(e) => setFormData({ ...formData, matricule: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="admin-modal-label">Fonction</label>
                    <input 
                      className="admin-modal-input" 
                      value={formData.fonction} 
                      onChange={(e) => setFormData({ ...formData, fonction: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-modal-label">Direction</label>
                  <input 
                    className="admin-modal-input" 
                    value={formData.direction} 
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value })} 
                    required 
                  />
                </div>

                <div className="admin-modal-grid-2">
                  <div>
                    <label className="admin-modal-label">Nom Directeur</label>
                    <input 
                      className="admin-modal-input" 
                      value={formData.directeur} 
                      onChange={(e) => setFormData({ ...formData, directeur: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="admin-modal-label">Nom Chef Hiérarchique</label>
                    <input 
                      className="admin-modal-input" 
                      value={formData.chef} 
                      onChange={(e) => setFormData({ ...formData, chef: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="admin-modal-actions">
                  <button 
                    type="button" 
                    onClick={() => setEditingEmp(null)} 
                    className="admin-btn-cancel"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="admin-btn-save"
                  >
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Admin;