import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileWarning } from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../layout/Footer";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: FileWarning },
];

export default function AdminLayout({ title, children }) {
  return <div className="admin-shell min-h-screen">
    <Navbar />
    <div className="admin-navigation">
      <nav className="content-width" aria-label="Administration">
        {NAV.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end}
          className={({ isActive }) => `header-link ${isActive ? "header-link-active" : ""}`}>
          <Icon size={18} /><span>{label}</span>
        </NavLink>)}
      </nav>
    </div>
    <main id="main-content" tabIndex={-1} className="content-width admin-content">
      <h1 className="page-title">{title}</h1>
      {children}
    </main>
    <Footer />
  </div>;
}
