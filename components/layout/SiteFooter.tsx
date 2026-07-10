import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-brand-charcoal text-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            {/* White-Accented Branded Vector Logo Emblem Container */}
            <svg xmlns="http://w3.org" viewBox="0 0 1000 350" className="h-8 w-auto">
              <g fill="#FFFFFF">
                <circle cx="70" cy="275" r="40"/>
                <circle cx="190" cy="275" r="40"/>
                <circle cx="190" cy="155" r="40"/>
                <circle cx="310" cy="155" r="40"/>
                <circle cx="310" cy="35" r="40"/>
              </g>
              <circle cx="310" cy="275" r="40" fill="#16A34A"/>
              <g stroke="#FFFFFF" strokeWidth="8">
                <line x1="110" y1="275" x2="150" y2="275"/>
                <line x1="230" y1="275" x2="270" y2="275"/>
                <line x1="190" y1="195" x2="190" y2="235"/>
                <line x1="230" y1="155" x2="270" y2="155"/>
                <line x1="310" y1="75" x2="310" y2="115"/>
                <line x1="310" y1="195" x2="310" y2="235"/>
              </g>
              <text x="430" y="165" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="140" fill="#FFFFFF" letterSpacing="-4">Growth</text>
              <text x="430" y="295" fontFamily="Arial, sans-serif" fontSize="140" fill="#FFFFFF" letterSpacing="-2">Connect</text>
            </svg>
          </div>
          <p className="text-white/60 text-sm mb-4">
            Growth Connect links entrepreneurs to opportunities and tools for real impact and sustainable growth.
          </p>
          <div className="flex gap-4 text-white/40 text-xs">
            <span>FB</span>
            <span>IG</span>
            <span>TW</span>
            <span>LI</span>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-4">Useful links</h4>
          <ul className="space-y-3 text-white/70 text-sm">
            <li>
              <Link href="/admin/dashboard" className="hover:text-brand-green transition-colors">Dashboard</Link>
            </li>
            <li>
              <a href="https://growthconnect.africa" className="hover:text-brand-green transition-colors">About Us</a>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-brand-green transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-brand-green transition-colors">Terms &amp; condition</Link>
            </li>
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