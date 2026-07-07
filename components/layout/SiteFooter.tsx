import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-brand-charcoal text-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="8" cy="8" r="3" fill="#fff" />
              <circle cx="8" cy="16" r="3" fill="#fff" />
              <circle cx="8" cy="24" r="3" fill="#2FA36B" />
              <circle cx="16" cy="8" r="3" fill="#fff" />
              <circle cx="24" cy="16" r="3" fill="#fff" />
              <line x1="8" y1="8" x2="8" y2="24" stroke="#fff" strokeWidth="1.5" />
              <line x1="8" y1="8" x2="16" y2="8" stroke="#fff" strokeWidth="1.5" />
              <line x1="8" y1="16" x2="24" y2="16" stroke="#fff" strokeWidth="1.5" />
            </svg>
            <span className="font-bold leading-tight text-sm">
              Growth<br />Connect
            </span>
          </div>
          <p className="text-white/60 text-sm mb-4">
            Growth Connect links entrepreneurs to opportunities and tools for
            real impact and sustainable growth.
          </p>
          <div className="flex gap-4 text-white">
            <span>FB</span>
            <span>IG</span>
            <span>TW</span>
            <span>LI</span>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-4">Useful links</h4>
          <ul className="space-y-3 text-white/70 text-sm">
            <li>Dashboard</li>
            <li>About Us</li>
            <li>Privacy Policy</li>
            <li>Terms &amp; condition</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">Programs</h4>
          <ul className="space-y-3 text-white/70 text-sm">
            <li>DomiN8</li>
            <li>LaunchPadX</li>
            <li>ScaleUp Initiative</li>
            <li>Explore More</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">Contact Us</h4>
          <div className="space-y-3 text-white/70 text-sm">
            <p>Kigali Innovation City, Bumbogo, Gasabo District, Kigali, Rwanda</p>
            <p>+250 791 336 179</p>
            <p>hello@growthconnect.africa</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-white/50 text-sm relative">
          © Copyright {new Date().getFullYear()} Growth Connect. All rights reserved.
          <Link
            href="/admin/login"
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 hover:text-white/30 transition-colors tracking-widest select-none"
            aria-label="Admin"
          >
            ···
          </Link>
        </div>
      </div>
    </footer>
  );
}