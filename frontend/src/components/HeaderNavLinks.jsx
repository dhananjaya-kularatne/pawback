import { NavLink } from "react-router-dom";

// Persistent header navigation shared by the landing header and the
// authenticated Navbar, so moving between Home and the Dashboard feels like
// the same app rather than separate pages. Styled for the blue header bar;
// the active route is highlighted.
const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/dashboard", label: "Dashboard" },
];

export default function HeaderNavLinks() {
  return (
    <nav className="flex items-center gap-1">
      {LINKS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isActive
                ? "bg-white/15 text-white"
                : "text-blue-100 hover:text-white hover:bg-white/10"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
