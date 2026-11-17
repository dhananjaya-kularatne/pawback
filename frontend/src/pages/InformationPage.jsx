import { Link, useLocation } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AccountMenu from "../components/AccountMenu";
import Footer from "../components/layout/Footer";
import { useSession } from "../utils/useSession";

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim();
export default function InformationPage() {
  const { pathname } = useLocation();
  const { token } = useSession();
  const privacy = pathname === "/privacy";
  return <div className="min-h-screen bg-slate-50">
    <AppHeader showNavLinks={Boolean(token)}>{token ? <AccountMenu /> : <Link to="/" className="text-white text-sm">Home</Link>}</AppHeader>
    <main className="mx-auto max-w-3xl px-5 py-10 text-gray-700 space-y-6 leading-relaxed">
      <h1 className="text-3xl font-bold text-gray-900">{privacy ? "Data and privacy" : "PawBack help"}</h1>
      {privacy ? <>
        <section><h2 className="text-lg font-semibold">Pet profiles</h2><p>Anyone with a pet's QR link can see its name, photo, breed, description, instructions, and Safe/Lost status. Avoid including private addresses or other sensitive information in those fields.</p></section>
        <section><h2 className="text-lg font-semibold">Finder reports</h2><p>The pet's owner and administrators can view report messages, attached photos, timestamps, and any shared location. Location is optional and is requested only after the finder chooses to share it. Map links open Google Maps when clicked.</p></section>
        <section><h2 className="text-lg font-semibold">Accounts and providers</h2><p>Account records include a name, email, optional phone number, and a password hash or Google account identity. Google handles optional Google sign-in, Cloudinary stores uploaded photos and QR images, and the email provider delivers account and report messages. Cloud images use shareable URLs; anyone given an image URL may be able to view it.</p></section>
        <section><h2 className="text-lg font-semibold">Browser storage and removal</h2><p>Sign-in credentials are stored in browser session storage and removed on sign-out or session expiry. Removing a pet disables its public profile and removes its report history. Cloud asset removal is queued and retried if the provider is unavailable. An internal removed-pet record and database backups may remain until the service operator's retention process removes them.</p></section>
        <p className="text-sm text-gray-500">This page describes the implemented data flows. The service operator supplies any additional organization-specific policies and retention details.</p>
      </> : <>
        <section><h2 className="text-lg font-semibold">Register and prepare a tag</h2><p>Create an account, open Dashboard, and add a pet with a JPEG or PNG photo. Photos must be at most 5 MB, 4096 pixels per side, and 16 megapixels. Adjust the crop, then download the pet's QR image and print it for the collar.</p></section>
        <section><h2 className="text-lg font-semibold">When a pet is lost</h2><p>Change its status to Lost. A finder can scan the tag without signing in and submit a message, with an optional photo or location. Open View reports on the pet's card to read updates, even if an email notification has not arrived. Mark the pet Safe when it returns.</p></section>
        <section><h2 className="text-lg font-semibold">Broken tags and removal</h2><p>If a tag no longer opens the pet's page, use its QR dialog to regenerate the image, then download and replace the printed tag. Removing a pet disables its QR page and removes its report history; this action cannot be undone from the app.</p></section>
        <section><h2 className="text-lg font-semibold">Sign-in and support</h2><p>Use Forgot password from the sign-in form for account recovery. If reports or uploads are temporarily limited, wait before retrying. {supportEmail ? <a className="text-blue-700 underline" href={`mailto:${supportEmail}`}>Contact support</a> : "For further help, contact the person who manages your PawBack service."}</p></section>
      </>}
    </main><Footer />
  </div>;
}
