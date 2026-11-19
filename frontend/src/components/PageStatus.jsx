import { Link } from "react-router-dom";
import { ArrowRight, Info, LoaderCircle } from "lucide-react";
import AppHeader from "./AppHeader";
import AccountMenu from "./AccountMenu";
import Footer from "./layout/Footer";
import { useSession } from "../utils/useSession";

export default function PageStatus({ title, message, busy = false }) {
  const { token } = useSession();
  return <div className="min-h-screen flex flex-col">
    <AppHeader showNavLinks={!!token}>
      {token ? <AccountMenu /> : <Link to="/" state={{ openLogin: true }} className="header-link">Sign in</Link>}
    </AppHeader>
    <main id="main-content" tabIndex={-1} className="content-width flex-1 py-10">
      <div className="surface max-w-xl mx-auto p-6 sm:p-10" role={busy ? "status" : undefined} aria-busy={busy}>
        <div className="status-icon mb-5">{busy ? <LoaderCircle className="motion-safe:animate-spin" size={23} /> : <Info size={23} />}</div>
        <h1 className="status-title">{title}</h1>
        {message && <p className="mt-3 text-gray-600">{message}</p>}
        {!busy && <Link to="/" className="button-primary mt-6">Return to PawBack <ArrowRight size={17} /></Link>}
      </div>
    </main>
    <Footer />
  </div>;
}
