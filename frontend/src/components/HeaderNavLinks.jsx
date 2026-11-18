import { NavLink } from "react-router-dom";
import { useSession } from "../utils/useSession";

// Persistent header navigation shared by the landing header and the
// authenticated Navbar, so moving between Home and the Dashboard feels like
// the same app rather than separate pages. Styled for the blue header bar;
// the active route is highlighted. The Admin link only appears for admins.
const BASE_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/dashboard", label: "My pets" },
  { to: "/help", label: "How it works" },
];

export default function HeaderNavLinks() {
  const { user } = useSession();
  const links = user?.role === "ADMIN"
    ? [...BASE_LINKS, { to: "/admin", label: "Admin" }]
    : BASE_LINKS;

  return (
    <nav aria-label="Main" className="flex items-center gap-1">
      {links.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `header-link ${isActive ? "header-link-active" : ""}`}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
