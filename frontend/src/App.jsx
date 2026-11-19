import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ScanPage from "./pages/ScanPage";
import AdminPage from "./pages/AdminPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import SessionMonitor from "./components/SessionMonitor";
import InformationPage from "./pages/InformationPage";
import PageStatus from "./components/PageStatus";

function RouteScrollReset() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const section = hash && document.getElementById(hash.slice(1));
    if (section) section.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function LandingRoute() {
  const { key } = useLocation();
  return <LandingPage key={key} />;
}

function App() {
  return (
    <BrowserRouter>
      <RouteScrollReset />
      <SessionMonitor />
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/help" element={<InformationPage />} />
        <Route path="/privacy" element={<InformationPage />} />
        <Route path="*" element={<PageStatus title="Page not found" message="This page may have moved, or the link may be incomplete." />} />
        <Route path="/scan/:petUuid" element={<ScanPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <AdminReportsPage />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
