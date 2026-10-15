import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import CalendarPage from "./pages/CalendarPage";
import Profile from "./pages/Profile";
import PageAdministration from "./pages/PageAdministration";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState } from "react";

function App() {
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState(1);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes utilisateur normal */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage
                year={year}
                month={month}
                setYear={setYear}
                setMonth={setMonth}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Route admin uniquement */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* <Route path="/administration" element={<PageAdministration year={year} month={month} />} /> */}
      </Routes>
    </Router>
  );
}

export default App;