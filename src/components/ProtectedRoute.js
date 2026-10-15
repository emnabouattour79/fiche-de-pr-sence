import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requireAdmin = false }) {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  // Pas connecté → retour au login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Page admin mais utilisateur normal → on le renvoie au calendar
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/calendar" replace />;
  }

  // Page utilisateur normal mais c'est l'admin → on le renvoie à /admin
  if (!requireAdmin && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;