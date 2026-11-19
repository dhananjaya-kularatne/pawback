import { NavLink } from "react-router-dom";
import { useSession } from "../utils/useSession";

const BASE_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/dashboard", label: "My pets", requiresAccount: true },
  { to: "/help", label: "How it works" },
];

export default function HeaderNavLinks() {
  const { token, user } = useSession();
  const links = user?.role === "ADMIN"
    ? [...BASE_LINKS, { to: "/admin", label: "Admin" }]
    : BASE_LINKS.filter(({ requiresAccount }) => !requiresAccount || token);

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
