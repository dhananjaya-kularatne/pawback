import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim();
export default function Footer() {
  return <footer className="bg-slate-900 text-slate-300 px-5 md:px-10 py-9">
    <div className="flex flex-wrap items-center justify-between gap-5">
      <Link to="/" className="flex items-center gap-2 font-bold text-white"><PawPrint size={22} /> PawBack</Link>
      <nav aria-label="Information" className="flex flex-wrap gap-5 text-sm">
        <Link to="/help" className="hover:text-white">Help</Link>
        <Link to="/privacy" className="hover:text-white">Data and privacy</Link>
        {supportEmail && <a href={`mailto:${supportEmail}`} className="hover:text-white">Contact support</a>}
      </nav>
    </div>
    <p className="mt-6 text-xs text-slate-400">? {new Date().getFullYear()} PawBack. All rights reserved.</p>
  </footer>;
}
