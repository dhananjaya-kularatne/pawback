import { Link } from "react-router-dom";
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
    <main id="main-content" className="content-width flex-1 py-10">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-6 sm:p-8" role={busy ? "status" : undefined} aria-busy={busy}>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {message && <p className="mt-3 text-gray-600">{message}</p>}
        {!busy && <Link to="/" className="button-primary mt-6">Return to PawBack</Link>}
      </div>
    </main>
    <Footer />
  </div>;
}
