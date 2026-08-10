import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddPet from "./pages/AddPet";
import PetDetail from "./pages/PetDetail";
import ScanPage from "./pages/ScanPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pets/new" element={<AddPet />} />
        <Route path="/pets/:id" element={<PetDetail />} />
        <Route path="/scan/:petUuid" element={<ScanPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;