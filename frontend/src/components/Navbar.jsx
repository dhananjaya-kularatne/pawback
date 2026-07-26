import { Link } from "react-router-dom";
import { PawPrint, Bell, ChevronDown } from "lucide-react";

// Shared navbar for all authenticated pages — logo, notification bell, account menu
function Navbar() {
  return (
    <div className="flex justify-between items-center px-5 py-3 border-b border-gray-300 bg-white">
      <Link to="/dashboard" className="flex items-center gap-2">
        <PawPrint size={18} className="text-blue-700" />
        <span className="font-medium text-sm text-gray-900">PawBack</span>
      </Link>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell size={18} className="text-gray-700" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700">
            D
          </div>
          <span className="text-xs text-gray-700">Account</span>
          <ChevronDown size={12} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
}

export default Navbar;