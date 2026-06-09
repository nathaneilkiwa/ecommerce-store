// frontend/src/components/Footer.jsx
import { Link } from "react-router-dom";

const YEAR = new Date().getFullYear();

const STORE_LINKS = [
  { to: "/products",  label: "Shop" },
  { to: "/shipping",  label: "Shipping & Returns" },
  { to: "/policy",    label: "Store Policy" },
  { to: "/faq",       label: "FAQ" },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

// WhatsApp icon
const WhatsAppIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.112 1.528 5.836L.057 23.215a.75.75 0 00.923.899l5.453-1.427A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.709 9.709 0 01-4.989-1.374l-.356-.214-3.693.967.984-3.595-.232-.369A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-white">
      {/* Top rule */}
      <div className="h-px bg-amber-400 w-full" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8">

          {/* ── Brand ─────────────────────────────────────────────────── */}
          <div className="md:col-span-1">
            <span className="font-['Bebas_Neue'] text-3xl tracking-widest text-white block mb-4">
              GEAR UP.
            </span>
            <p className="text-stone-400 text-sm font-['DM_Sans'] font-light leading-relaxed max-w-xs">
              Quality fitness equipment built for every stage of the journey — from first session to competition day.
            </p>
          </div>

          {/* ── Store ─────────────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-['DM_Sans'] tracking-[0.18em] uppercase text-stone-500 mb-5">
              Store
            </p>
            <ul className="space-y-3">
              {STORE_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm font-['DM_Sans'] text-stone-400 hover:text-white transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ───────────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-['DM_Sans'] tracking-[0.18em] uppercase text-stone-500 mb-5">
              Contact
            </p>
            <address className="not-italic space-y-3">
              <p className="text-sm font-['DM_Sans'] text-stone-400">500 Street, City</p>
              <p className="text-sm font-['DM_Sans'] text-stone-400">Tel: +27 00 000 0000</p>
              <a
                href="mailto:info@gearup.co.za"
                className="text-sm font-['DM_Sans'] text-stone-400 hover:text-white transition-colors duration-150 block"
              >
                info@gearup.co.za
              </a>
            </address>
          </div>

          {/* ── Social + CTA ───────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-['DM_Sans'] tracking-[0.18em] uppercase text-stone-500 mb-5">
              Follow Us
            </p>

            <div className="flex items-center gap-5 mb-8">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-stone-500 hover:text-white transition-colors duration-150"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <button
              onClick={() => window.open("https://wa.me/27000000000", "_blank")}
              className="inline-flex items-center gap-2.5 bg-transparent border border-stone-700 text-stone-300 hover:border-amber-400 hover:text-white px-5 py-2.5 text-sm font-['DM_Sans'] font-medium transition-colors duration-200"
            >
              <WhatsAppIcon />
              Chat with us
            </button>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div className="border-t border-stone-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs font-['DM_Sans'] text-stone-600">
            © {YEAR} Gear Up. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/policy" className="text-xs font-['DM_Sans'] text-stone-600 hover:text-stone-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs font-['DM_Sans'] text-stone-600 hover:text-stone-400 transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}