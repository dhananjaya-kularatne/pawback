import { Link } from "react-router-dom";
import HeaderNavLinks from "./HeaderNavLinks";
import BrandMark from "./BrandMark";
export default function AppHeader({ children }) {
  return <header className="site-header">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="site-header-inner">
      <Link to="/" className="brand"><BrandMark /><span>PawBack</span></Link>
      <HeaderNavLinks />
      <div className="header-actions">{children}</div>
    </div>
  </header>;
}
