import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("currentUser"));
  const profiles = JSON.parse(localStorage.getItem("profiles")) || [];

  // ✅ trouver le profil de l'utilisateur
  const profile = profiles.find(p => p.email === user?.email);

  return (
    <div>
      <h2>Attendance Page</h2>

      {/* ✅ afficher données */}
      {profile && (
        <div style={{ border: "1px solid black", padding: "10px" }}>
          <p><b>nom et prenom </b> {profile.nom} {profile.prenom}</p>
          <p><b>Director:</b> {profile.directeur}</p>
          <p><b>Manager:</b> {profile.chef}</p>
          <p><b>Function:</b> {profile.fonction}</p>
          <p><b>Matricule:</b> {profile.matricule}</p>
          <p><b>Direction:</b> {profile.direction}</p>
        </div>
      )}

      <br />

     
      
    </div>
  );
}

export default Dashboard;