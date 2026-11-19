import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../utils/useSession";
import { QrCode, ArrowRight, Camera, Heart, Check } from "lucide-react";
import { Link } from "react-router-dom";
import scanImg from "../assets/scan-collar.webp";
import heroImg from "../assets/collar-dog.webp";
import RegisterModal from "../components/auth/RegisterModal";
import LoginModal from "../components/auth/LoginModal";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";
import AccountMenu from "../components/AccountMenu";
import AppHeader from "../components/AppHeader";
import Footer from "../components/layout/Footer";

// Landing page , the register form opens as a modal overlay when a CTA is clicked
function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth state is derived from token presence , kept in state so signing in or
  // out updates the page in place. The storage listener catches token changes
  // from other contexts in this tab session.
  const { token } = useSession();
  const isLoggedIn = Boolean(token);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(() => Boolean(location.state?.openLogin || location.state?.authError || location.state?.sessionExpired));
  const [forgotOpen, setForgotOpen] = useState(false);

  // Called by both auth modals once a token has been stored , close the modal
  // and reflect the logged-in state without leaving the landing page.
  function handleAuthSuccess() {
    setLoginOpen(false);
    setRegisterOpen(false);
  }

  function closeLogin() {
    setLoginOpen(false);
    if (location.state) navigate("/", { replace: true, state: null });
  }

  function openLogin() {
    setRegisterOpen(false);
    setForgotOpen(false);
    setLoginOpen(true);
  }

  function openRegister() {
    setLoginOpen(false);
    setForgotOpen(false);
    setRegisterOpen(true);
  }

  function openForgot() {
    setLoginOpen(false);
    setRegisterOpen(false);
    setForgotOpen(true);
  }

  return <div className="landing-page">
    <AppHeader showNavLinks={isLoggedIn}>{isLoggedIn ? <AccountMenu /> : <><button className="header-link" onClick={openLogin}>Sign in</button><button className="button-primary button-small" onClick={openRegister}>Get started</button></>}</AppHeader>
    <main id="main-content">
      <section className="hero-section">
        <div className="content-width hero-grid">
          <div className="hero-copy">
            <h1>Help them find <em>their way home.</em></h1>
            <p>Attach a PawBack QR tag to your pet’s collar. If they get lost, anyone who finds them can scan the tag and tell you where they saw them.</p>
            <div className="hero-actions"><button className="button-primary" onClick={isLoggedIn ? () => navigate("/dashboard") : openRegister}>{isLoggedIn ? "My pets" : "Create a pet profile"}<ArrowRight size={18} /></button><Link className="button-secondary" to="/help">How it works</Link></div>
          </div>
          <figure className="hero-visual"><img src={heroImg} alt="Golden retriever wearing a blue collar with a QR identification tag" fetchPriority="high" width="1536" height="1024" /><figcaption><QrCode size={19} /> PawBack collar tag</figcaption></figure>
        </div>
      </section>
      <div className="promise-strip"><div className="content-width"><span><Check size={17} /> No app needed to scan</span><span><Check size={17} /> A unique tag for every pet</span><span><Check size={17} /> Finder reports in your dashboard</span></div></div>
      <section className="content-width story-section">
        <div className="story-image"><img src={scanImg} alt="A finder scanning a QR tag attached to a beagle's blue collar" loading="lazy" width="1536" height="1024" /></div>
        <div className="story-copy"><h2>What happens when someone scans the tag?</h2><p>They see your pet’s photo and the instructions you’ve left. If your pet is marked Lost, they can send you a report with a message, photo or location.</p><Link className="text-link" to="/help#found">See what a finder should do <ArrowRight size={18} /></Link></div>
      </section>
      <section className="walkthrough-section"><div className="content-width"><div className="section-heading"><h2>Set up your pet’s tag</h2></div>
        <ol className="walkthrough-grid">{[{icon: Camera,title:"Create a profile",text:"Add your pet’s name, a clear photo and instructions for anyone who finds them."},{icon: QrCode,title:"Print and attach the tag",text:"Download the QR code, print it on a durable tag and attach it to their collar."},{icon: Heart,title:"Know what to do if they go missing",text:"Mark your pet Lost to receive reports. Mark them Safe when they’re home."}].map(({icon: Icon,title,text})=><li key={title}><Icon className="feature-icon" size={26} strokeWidth={1.75} /><h3>{title}</h3><p>{text}</p></li>)}</ol>
        <div className="text-center mt-10"><Link to="/help" className="button-secondary">Your step-by-step guide <ArrowRight size={17} /></Link></div>
      </div></section>
      <section className="content-width home-cta"><h2>Get a tag ready before the next walk.</h2><button className="button-primary" onClick={isLoggedIn ? () => navigate("/dashboard") : openRegister}>{isLoggedIn ? "Open my pets" : "Create a pet profile"}<ArrowRight size={18} /></button></section>
    </main><Footer />
    {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} onSuccess={handleAuthSuccess} onSwitchToLogin={openLogin} />}
    {loginOpen && <LoginModal initialError={location.state?.authError || (location.state?.sessionExpired ? "Your session has ended. Please sign in again." : "")} onClose={closeLogin} onSuccess={handleAuthSuccess} onSwitchToRegister={openRegister} onForgotPassword={openForgot} />}
    {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} onSwitchToLogin={openLogin} />}
  </div>;
}
export default LandingPage;
