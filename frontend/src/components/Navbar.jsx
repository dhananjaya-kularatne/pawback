import { Link } from "react-router-dom";
import { PawPrint, Bell } from "lucide-react";
import AccountMenu from "./AccountMenu";

// Shared navbar for all authenticated pages — logo, notification bell, account menu
function Navbar() {
  return (
    <div className="flex justify-between items-center px-5 py-3 relative">
      <Link to="/dashboard" className="flex items-center gap-2">
        <PawPrint size={20} className="text-white" />
        <span className="font-semibold text-sm text-white">PawBack</span>
      </Link>

      <div className="flex items-center gap-3">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full
                     hover:bg-white/10 text-white cursor-pointer transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <AccountMenu />
      </div>
    </div>
  );
}

export default Navbar;
