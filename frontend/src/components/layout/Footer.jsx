import { PawPrint, Mail, Globe, MessageCircle } from "lucide-react";

// Marketing footer for the landing page — dark brand band, link columns and a
// bottom legal bar. Matches the CTA banner's slate-900 surface and the header's
// full-bleed width + padding.
const LINK_GROUPS = [
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Community", href: "#" },
      { label: "System Status", href: "#" },
      { label: "Contact", href: "mailto:hello@pawback.app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

const SOCIALS = [
  { label: "Email us", href: "mailto:hello@pawback.app", Icon: Mail },
  { label: "Website", href: "#", Icon: Globe },
  { label: "Community", href: "#", Icon: MessageCircle },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-white/10">
      <div className="w-full px-6 md:px-10 lg:px-16 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-white">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <PawPrint size={20} className="text-blue-400" />
              </div>
              <span className="font-bold text-xl tracking-tight">PawBack</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed max-w-xs">
              Digital pet profiles and scannable QR tags that help lost pets find
              their way home faster.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10
                             flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} PawBack. All rights reserved.
          </p>
          <a
            href="mailto:hello@pawback.app"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            hello@pawback.app
          </a>
        </div>
      </div>
    </footer>
  );
}
