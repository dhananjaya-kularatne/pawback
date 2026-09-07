import { NavLink } from "react-router-dom";
import { isAdmin } from "../utils/auth";

// Persistent header navigation shared by the landing header and the
// authenticated Navbar, so moving between Home and the Dashboard feels like
// the same app rather than separate pages. Styled for the blue header bar;
// the active route is highlighted. The Admin link only appears for admins.
const BASE_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/dashboard", label: "Dashboard" },
];

export default function HeaderNavLinks() {
  const links = isAdmin()
    ? [...BASE_LINKS, { to: "/admin", label: "Admin" }]
    : BASE_LINKS;

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ to, label, end }) => (
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
