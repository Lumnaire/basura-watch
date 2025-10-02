import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminLeaderboard from "./pages/AdminLeaderboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
