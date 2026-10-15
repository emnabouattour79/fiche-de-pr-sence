import "./Legende.css";

function Legende() {
  const absences = [
    ["Congés payés", "CP"],
    ["Repos compensateur", "RC"],
    ["Repos compensateur C.P.", "RP"],
    ["Maladie", "M"],
    ["Congés spéciaux Naissance", "CN"],
    ["Congés spéciaux Mariage", "CM"],
    ["Congés spéciaux Décès", "CD"],
    ["Congés spéciaux Spécial", "CS"],
    ["Accident de travail", "AT"],
    ["Maternité", "MA"],
    ["Absence autorisée", "AA"],
    ["Absence irrégulière", "AI"],
    ["Absence Mise à Pied", "AP"],
    ["Mi-temps médecin", "MT"],
    ["Congé sans solde", "SS"],
  ];

  const presences = [
    ["Présence normale", "PN"],
    ["Permanence", "PP"],
    ["Astreinte domicile", "AD"],
    ["Astreinte bureau ou base", "AB"],
    ["Présence Magasin/Parc", "MP"],
    ["Présence Sédentaire Kerkennah", "PK"],
  ];

  const deplacements = [
    ["Tunisie", "DT"],
    ["Etranger", "DE"],
    ["Délais de Route", "DR"],
    ["Autres", "AU"],
  ];

  const formations = [
    ["Cycle ON-SHORE", "FT"],
    ["Cycle OFF-SHORE", "FF"],
    ["Pendant la Récupération", "FR"],
    ["Personnel sédentaire", "FO"],
  ];

  const chantiers = [
    ["Tank Battery — Jour / Nuit", "TX / TN"],
    ["EL AIN — Jour / Nuit", "AX / AN"],
    ["Rhemoura — Jour / Nuit", "RX / RN"],
    ["GUEBIBA — Jour / Nuit", "GX / GN"],
    ["EL HAJEJ — Jour / Nuit", "HX / HN"],
    ["CERCINA — Jour / Nuit", "FX / FN"],
    ["Work Over — Onshore / Offshore", "WX / WF"],
    ["CFTP — Jour / Nuit", "LX / LN"],
  ];

  return (
    <div className="legende-wrapper">
      <div className="legende-card">
        <div className="legende-topbar"></div>

        <h2 className="legende-title">LÉGENDE POUR LES POINTAGES</h2>
        <p className="legende-subtitle">
          Thyna Petroleum Services • Codes de référence opérationnels
        </p>

        <div className="legende-grid">
          {/* COLONNE 1 */}
          <div className="legende-column">
            <div className="legende-section">
              <div className="section-title">(1) ABSENCES</div>
              {absences.map(([label, c]) => (
                <div key={c} className="pointage-row">
                  <span>{label}</span>
                  <span className="badge-light">{c}</span>
                </div>
              ))}
            </div>

            <div className="legende-section">
              <div className="section-title">(2) PRÉSENCES</div>
              {presences.map(([label, c]) => (
                <div key={c} className="pointage-row">
                  <span>{label}</span>
                  <span className="badge-light">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COLONNE 2 */}
          <div className="legende-column">
            <div className="legende-section">
              <div className="section-title">DÉPLACEMENTS</div>
              {deplacements.map(([label, c]) => (
                <div key={c} className="pointage-row">
                  <span>{label}</span>
                  <span className="badge-light">{c}</span>
                </div>
              ))}
            </div>

            <div className="legende-section">
              <div className="section-title">FORMATION</div>
              {formations.map(([label, c]) => (
                <div key={c} className="pointage-row">
                  <span>{label}</span>
                  <span className="badge-light">{c}</span>
                </div>
              ))}
            </div>

            <div className="legende-section">
              <div className="section-title">CHANTIERS</div>
              {chantiers.map(([label, c]) => (
                <div key={c} className="pointage-row">
                  <span>{label}</span>
                  <span className="badge-light">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COLONNE 3 */}
          <div className="legende-column">
            <div className="legende-section">
              <div className="section-title">(3) HEURES DE MOUVEMENT</div>
              <p className="section-text">
                <strong>Chantier terre :</strong> heures de commencement et de fin de travail.<br />
                <strong>Chantier mer :</strong> heures d'embarquement et de débarquement sur la plateforme.
              </p>
            </div>

            <div className="legende-section">
              <div className="section-title">(4) HEURES SUPPLÉMENTAIRES</div>
              <p className="section-text">
                Le chef de service doit indiquer sur la ligne compensation :
              </p>
              {[
                ["NC", "Heures payées"],
                ["C", "Heures compensées"],
                ["CA", "Compensation d'heures en moins du mois"],
              ].map(([c, label]) => (
                <div key={c} className="pointage-row">
                  <span className="badge-dark">{c}</span>
                  <span style={{ flex: 1 }}>{label}</span>
                </div>
              ))}
            </div>

            <div className="legende-section">
              <div className="section-title">(5) HEURES EN MOINS</div>
              <p className="section-text">
                Le chef de service doit indiquer sur la ligne récupération :
              </p>
              {[
                ["AR", "Heures récupérées"],
                ["CA", "Récupération d'heures sup. du mois précédent"],
              ].map(([c, label]) => (
                <div key={c} className="pointage-row">
                  <span className="badge-dark">{c}</span>
                  <span style={{ flex: 1 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Legende;