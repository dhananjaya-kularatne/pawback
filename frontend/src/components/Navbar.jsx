import { Bell } from "lucide-react";
import AppHeader from "./AppHeader";
import AccountMenu from "./AccountMenu";

// Header for the authenticated pages — the shared AppHeader bar with a
// notification bell and the account menu in the right-hand slot.
function Navbar() {
  return (
    <AppHeader>
      <button
        className="w-9 h-9 flex items-center justify-center rounded-full
                   hover:bg-white/10 text-white cursor-pointer transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
      </button>
      <AccountMenu />
    </AppHeader>
  );
}

export default Navbar;
