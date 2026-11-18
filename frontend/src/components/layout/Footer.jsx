import { Link } from "react-router-dom";
import BrandMark from "../BrandMark";
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim();
export default function Footer() {
  return <footer className="site-footer"><div className="content-width footer-row">
    <div><Link to="/" className="brand"><BrandMark /><span>PawBack</span></Link><p className="mt-3 text-sm">For the ones who make a house a home.</p></div>
    <nav aria-label="Information" className="flex flex-wrap gap-6 text-sm font-semibold"><Link to="/help">How it works</Link><Link to="/privacy">Data and privacy</Link>{supportEmail && <a href={`mailto:${supportEmail}`}>Contact support</a>}</nav>
  </div><p className="content-width mt-8 text-xs">&copy; {new Date().getFullYear()} PawBack. Made for pets and their people.</p></footer>;
}
