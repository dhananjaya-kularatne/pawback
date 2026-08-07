import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddPet from "./pages/AddPet";
import PetDetail from "./pages/PetDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pets/new" element={<AddPet />} />
        <Route path="/pets/:id" element={<PetDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;