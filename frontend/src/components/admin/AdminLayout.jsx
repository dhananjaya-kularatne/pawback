import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileWarning,
  PawPrint,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { getCurrentUser } from "../../utils/auth";

// Shared chrome for the admin area: a dark fixed sidebar for section nav plus a
// light top bar showing the current page and the signed-in admin. Pages pass
// their heading as `title` and render their body as children.
const NAV = [
  { to: "/admin", label: "Console", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users, end: false },
];

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function signOut() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-16 md:w-60 shrink-0 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center justify-center md:justify-start gap-2.5 px-0 md:px-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <PawPrint size={18} className="text-white" />
          </div>
          <div className="leading-tight hidden md:block">
            <div className="text-white font-bold text-sm">PawBack</div>
            <span className="inline-block mt-0.5 text-[10px] font-bold text-blue-300 bg-blue-500/15 uppercase tracking-wider px-1.5 py-0.5 rounded">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 p-2 md:p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center justify-center md:justify-start gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`
              }
              title={label}
            >
              <Icon size={17} className="shrink-0" />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}

          <div
            className="flex items-center justify-center md:justify-start gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed"
            title="Scan reports — coming soon"
          >
            <FileWarning size={17} className="shrink-0" />
            <span className="hidden md:inline">Scan reports</span>
            <span className="ml-auto hidden md:inline text-[10px] font-semibold uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              Soon
            </span>
          </div>
        </nav>

        <div className="p-2 md:p-3 border-t border-white/10 space-y-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-center md:justify-start gap-3 px-3 py-2 rounded-lg text-sm
                       text-slate-400 hover:bg-slate-800/60 hover:text-white transition-colors cursor-pointer"
            title="Back to app"
          >
            <ArrowLeft size={17} className="shrink-0" />
            <span className="hidden md:inline">Back to app</span>
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center md:justify-start gap-3 px-3 py-2 rounded-lg text-sm
                       text-slate-400 hover:bg-slate-800/60 hover:text-white transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut size={17} className="shrink-0" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-5 md:px-8">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
          <div className="hidden sm:flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-gray-900">
                {user?.name || "Admin"}
              </div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
