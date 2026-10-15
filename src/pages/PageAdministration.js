import React, { useRef, useEffect } from "react";
import "./PageAdministration.css";

function SignaturePad({ disabled = false, value = null, onSave = () => {} }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = value;
    }
  }, [value]);

  const startDraw = (e) => {
    if (disabled) return;
    drawingRef.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!drawingRef.current || disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#003366";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  const stopDraw = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL("image/png"));
    }
  };

  const clear = () => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSave("");
  };

  return (
    <div className="admin-signature-pad-container" style={{ opacity: disabled ? 0.75 : 1 }}>
      <canvas
        ref={canvasRef}
        width={180}
        height={80}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        className="admin-signature-canvas"
        style={{
          cursor: disabled ? "not-allowed" : "crosshair",
          background: disabled ? "#f8fafc" : "#ffffff"
        }}
      />
      {!disabled && (
        <button type="button" onClick={clear} className="admin-signature-clear-btn">
          Effacer
        </button>
      )}
    </div>
  );
}

function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0);
}

function getLastDayPreviousMonth(year, month) {
  return new Date(year, month, 0);
}

function formatDate(date) {
  if (!date || isNaN(new Date(date).getTime())) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function PageAdministration({
  year,
  month,
  joursPris = 0,
  targetEmail,
  isAdmin = false,
  selectedValues = {},
  handleSelect = () => {}
}) {
  const soldeInitial = parseFloat(selectedValues[`solde_initial_${year}`]) || 0;
  const soldeConges = soldeInitial + 22 - (joursPris || 0);

  return (
    <div className="admin-page-container">
      <h2 className="admin-page-title">
        RÉSERVÉ À L'ADMINISTRATION DU PERSONNEL
      </h2>

      {/* 3 TABLES RUBRIQUES */}
      <div className="admin-rubriques-grid">
        {[1, 2, 3].map((tableIndex) => (
          <table key={tableIndex} className="admin-table admin-table-third">
            <thead>
              <tr>
                <th className="admin-th">RUBRIQUE</th>
                <th className="admin-th">BASE</th>
                <th className="admin-th">TAUX OU %</th>
                <th className="admin-th">MONTANT</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((row) => (
                <tr key={row}>
                  <td className="admin-td">
                    <input
                      disabled={!isAdmin}
                      className="admin-input-cell"
                      value={selectedValues[`t${tableIndex}_r${row}_rub`] || ""}
                      onChange={(e) => handleSelect(`t${tableIndex}_r${row}_rub`, e.target.value)}
                    />
                  </td>
                  <td className="admin-td">
                    <input
                      disabled={!isAdmin}
                      className="admin-input-cell"
                      value={selectedValues[`t${tableIndex}_r${row}_base`] || ""}
                      onChange={(e) => handleSelect(`t${tableIndex}_r${row}_base`, e.target.value)}
                    />
                  </td>
                  <td className="admin-td">
                    <input
                      disabled={!isAdmin}
                      className="admin-input-cell"
                      value={selectedValues[`t${tableIndex}_r${row}_taux`] || ""}
                      onChange={(e) => handleSelect(`t${tableIndex}_r${row}_taux`, e.target.value)}
                    />
                  </td>
                  <td className="admin-td">
                    <input
                      disabled={!isAdmin}
                      className="admin-input-cell"
                      value={selectedValues[`t${tableIndex}_r${row}_montant`] || ""}
                      onChange={(e) => handleSelect(`t${tableIndex}_r${row}_montant`, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>

      <div className="admin-bottom-split">
        {/* REPARTITION D'ACTIVITE */}
        <div className="admin-bottom-left">
          <table className="admin-table">
            <thead>
              <tr>
                <th colSpan={2} className="admin-th">
                  RÉPARTITION D'ACTIVITÉ
                </th>
              </tr>
              <tr>
                <th className="admin-th">A F E</th>
                <th className="admin-th">TOTAL DES JOURS OUVRÉS</th>
              </tr>
            </thead>

            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  <td className="admin-td-dotted">
                    <input
                      disabled={!isAdmin}
                      className="admin-input-cell"
                      value={selectedValues[`rep_afe_${i}`] || ""}
                      onChange={(e) => handleSelect(`rep_afe_${i}`, e.target.value)}
                    />
                  </td>
                  <td className="admin-td-dotted">
                    <input
                      disabled={!isAdmin}
                      className="admin-input-cell"
                      value={selectedValues[`rep_jours_${i}`] || ""}
                      onChange={(e) => handleSelect(`rep_jours_${i}`, e.target.value)}
                    />
                  </td>
                </tr>
              ))}

              <tr>
                <td className="admin-td-total">TOTAL</td>
                <td className="admin-td-dotted">
                  <input
                    disabled={!isAdmin}
                    className="admin-input-cell"
                    style={{ fontWeight: "bold" }}
                    value={selectedValues[`rep_total`] || ""}
                    onChange={(e) => handleSelect(`rep_total`, e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION SOLDES, OBSERVATIONS ET VISAS */}
        <div className="admin-bottom-right">
          <table className="admin-table">
            <tbody>
              <tr>
                <td className="admin-td">
                  <b>À LA DATE DU</b>
                  <br />
                  {isAdmin ? (
                    <input
                      type="date"
                      className="admin-date-input"
                      value={
                        selectedValues[`date_en_haut_fin`] ||
                        `${year}-${String(month + 1).padStart(2, "0")}-${String(getLastDayOfMonth(year, month).getDate()).padStart(2, "0")}`
                      }
                      onChange={(e) => handleSelect(`date_en_haut_fin`, e.target.value)}
                    />
                  ) : (
                    <b>
                      {selectedValues[`date_en_haut_fin`]
                        ? formatDate(new Date(selectedValues[`date_en_haut_fin`]))
                        : formatDate(getLastDayOfMonth(year, month))}
                    </b>
                  )}
                </td>

                <td className="admin-td" colSpan={2}>
                  <b>VOTRE CRÉDIT EN CONGÉS PAYÉS</b>
                  <div className="solde-container">
                    <span>Solde année précédente :</span>
                    <input
                      type="number"
                      className="solde-input"
                      value={soldeInitial}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleSelect(`solde_initial_${year}`, val);
                      }}
                    />
                    <br />
                    <b className="solde-badge">Solde actuel : {soldeConges} jours</b>
                  </div>
                </td>

                <td className="admin-td">
                  <b>REPOS COMPENSATEURS AU</b>
                  <br />
                  {isAdmin ? (
                    <input
                      type="date"
                      className="admin-date-input"
                      value={
                        selectedValues[`date_en_haut_repos`] ||
                        `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, "0")}-${String(getLastDayPreviousMonth(year, month).getDate()).padStart(2, "0")}`
                      }
                      onChange={(e) => handleSelect(`date_en_haut_repos`, e.target.value)}
                    />
                  ) : (
                    <b>
                      {selectedValues[`date_en_haut_repos`]
                        ? formatDate(new Date(selectedValues[`date_en_haut_repos`]))
                        : formatDate(getLastDayPreviousMonth(year, month))}
                    </b>
                  )}
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="admin-th">
                  OBSERVATIONS
                </td>
              </tr>

              <tr>
                <td colSpan={4} className="admin-textarea-cell">
                  <textarea
                    disabled={!isAdmin}
                    className="admin-textarea"
                    placeholder={
                      !isAdmin
                        ? "Zone réservée aux observations de l'administrateur."
                        : "Observations administratives..."
                    }
                    value={selectedValues[`observations`] || ""}
                    onChange={(e) => handleSelect(`observations`, e.target.value)}
                  />
                </td>
              </tr>

              <tr>
                <td colSpan={1} className="admin-th">
                  VISA AGENT
                </td>
                <td colSpan={2} className="admin-th">
                  VISA HIÉRARCHIE
                </td>
                <td colSpan={1} className="admin-th">
                  VISA DIRECTEUR
                </td>
              </tr>

              <tr>
                {/* VISA AGENT */}
                <td colSpan={1} className="admin-visa-box">
                  <SignaturePad
                    disabled={isAdmin}
                    value={selectedValues[`visa_agent_signature`] || null}
                    onSave={(signatureData) => handleSelect(`visa_agent_signature`, signatureData)}
                  />
                  <div className="admin-visa-date-row">
                    <span>DATE :</span>
                    <input
                      type="date"
                      disabled={isAdmin}
                      className="admin-date-input"
                      value={selectedValues[`date_visa_agent`] || ""}
                      onChange={(e) => handleSelect(`date_visa_agent`, e.target.value)}
                    />
                  </div>
                </td>

                {/* VISA HIERARCHIE */}
                <td colSpan={2} className="admin-visa-box">
                  <SignaturePad
                    disabled={!isAdmin}
                    value={selectedValues[`visa_hierarchie_signature`] || null}
                    onSave={(signatureData) => handleSelect(`visa_hierarchie_signature`, signatureData)}
                  />
                  <div className="admin-visa-date-row">
                    <span>DATE :</span>
                    <input
                      type="date"
                      disabled={!isAdmin}
                      className="admin-date-input"
                      value={selectedValues[`date_visa_hierarchie`] || ""}
                      onChange={(e) => handleSelect(`date_visa_hierarchie`, e.target.value)}
                    />
                  </div>
                </td>

                {/* VISA DIRECTEUR */}
                <td colSpan={1} className="admin-visa-box">
                  <SignaturePad
                    disabled={!isAdmin}
                    value={selectedValues[`visa_directeur_signature`] || null}
                    onSave={(signatureData) => handleSelect(`visa_directeur_signature`, signatureData)}
                  />
                  <div className="admin-visa-date-row">
                    <span>DATE :</span>
                    <input
                      type="date"
                      disabled={!isAdmin}
                      className="admin-date-input"
                      value={selectedValues[`date_visa_directeur`] || ""}
                      onChange={(e) => handleSelect(`date_visa_directeur`, e.target.value)}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PageAdministration;