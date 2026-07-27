import { Link } from "react-router-dom";
import { PawPrint, Bell, ChevronDown } from "lucide-react";

// Shared navbar for all authenticated pages — logo, notification bell, account menu
function Navbar() {
  return (
    <div className="flex justify-between items-center px-5 py-3 border-b border-gray-300 bg-white">
      <Link to="/dashboard" className="flex items-center gap-2">
        <PawPrint size={20} className="text-blue-700" />
        <span className="font-semibold text-sm text-gray-900">PawBack</span>
      </Link>

      <div className="flex items-center gap-3">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full
                     hover:bg-gray-100 text-gray-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full
                     border border-gray-300 hover:bg-gray-50 hover:border-gray-400
                     transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-medium text-white">
            D
          </div>
          <span className="text-sm text-gray-700">Account</span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export default Navbar;