import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../utils/useSession";
import { PawPrint, QrCode, ArrowRight, ArrowUpRight, Camera, Heart, Check } from "lucide-react";
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
    <AppHeader showNavLinks={isLoggedIn}>{isLoggedIn ? <AccountMenu /> : <><button className="header-link" onClick={openLogin}>Sign in</button><button className="button-primary button-small" onClick={openRegister}>Get started <ArrowUpRight size={16} /></button></>}</AppHeader>
    <main id="main-content">
      <section className="hero-section">
        <div className="content-width hero-grid">
          <div className="hero-copy"><span className="eyebrow"><PawPrint size={16} /> BIG LOVE. LITTLE TAG.</span>
            <h1>More adventures.<br /><span>Always a way<br className="hidden lg:block" /> back home.</span></h1>
            <p>A familiar face. A little blue collar. A QR tag that helps a kind stranger tell you where your best friend has been found.</p>
            <div className="flex flex-wrap gap-3 mt-8"><button className="button-primary" onClick={isLoggedIn ? () => navigate("/dashboard") : openRegister}>{isLoggedIn ? "Meet your pets" : "Create your pet's profile"}<ArrowUpRight size={19} /></button><Link className="button-secondary" to="/help">See how it works</Link></div>
            <div className="hero-note"><span className="mini-paw"><PawPrint size={20} /></span><span>One profile. One unique QR tag.<br /><strong>A little more peace of mind.</strong></span></div>
          </div>
          <div className="hero-visual"><img src={heroImg} alt="Golden retriever wearing a blue collar with a QR identification tag" fetchPriority="high" width="1536" height="1024" /></div>
        </div>
      </section>
      <div className="promise-strip"><div className="content-width"><span><Check size={17} /> No app needed to scan</span><span><Check size={17} /> A unique tag for every pet</span><span><Check size={17} /> Finder reports in your dashboard</span></div></div>
      <section className="content-width story-section">
        <div className="story-image"><img src={scanImg} alt="A finder scanning a QR tag attached to a beagle's blue collar" loading="lazy" width="1536" height="1024" /><span className="image-caption">A small act of kindness can lead them home.</span></div>
        <div className="story-copy"><span className="eyebrow">FOR PETS. FOR THEIR PEOPLE.</span><h2>Happy tails.<br />Reassured humans.</h2><p>They turn everyday walks into adventures. Give your curious companion a simple way to be recognised if they wander a little too far.</p><p>PawBack connects a collar tag to your pet's profile. When your pet is marked Lost, a finder can leave a message, photo or location for you to follow up.</p><Link className="text-link" to="/help">A closer look at PawBack <ArrowRight size={18} /></Link></div>
      </section>
      <section className="walkthrough-section"><div className="content-width"><div className="section-heading"><span className="eyebrow">A LITTLE PREPARATION GOES A LONG WAY</span><h2>Their way home starts with you.</h2><p>From a favourite photo to a tag on their collar. Here's how it comes together.</p></div>
        <ol className="walkthrough-grid">{[{icon: Camera,title:"Make it theirs",text:"Add a photo, a name and helpful instructions to your pet's profile."},{icon: QrCode,title:"Tag along",text:"Download the unique QR image, print a clear tag and attach it securely to their collar."},{icon: Heart,title:"Stay connected",text:"Mark your pet Lost if they wander. Read finder reports and mark them Safe when they're home."}].map(({icon: Icon,title,text},i)=><li key={title}><span className="step-top"><span className="step-number">0{i+1}</span><Icon size={31} strokeWidth={1.5} /></span><h3>{title}</h3><p>{text}</p></li>)}</ol>
        <div className="text-center mt-10"><Link to="/help" className="button-secondary">Your step-by-step guide <ArrowRight size={17} /></Link></div>
      </div></section>
      <section className="content-width home-cta"><div><span className="eyebrow">FOR ALL THE WALKS STILL TO COME</span><h2>Give their next adventure<br />a way back to you.</h2></div><button className="button-primary" onClick={isLoggedIn ? () => navigate("/dashboard") : openRegister}>{isLoggedIn ? "Open my pets" : "Let's get your pet ready"}<ArrowUpRight size={19} /></button></section>
    </main><Footer />
    {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} onSuccess={handleAuthSuccess} onSwitchToLogin={openLogin} />}
    {loginOpen && <LoginModal initialError={location.state?.authError || (location.state?.sessionExpired ? "Your session has ended. Please sign in again." : "")} onClose={closeLogin} onSuccess={handleAuthSuccess} onSwitchToRegister={openRegister} onForgotPassword={openForgot} />}
    {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} onSwitchToLogin={openLogin} />}
  </div>;
}
export default LandingPage;
