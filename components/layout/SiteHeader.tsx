import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-line">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="h-10 w-auto flex items-center">
            <svg xmlns="http://w3.org" viewBox="0 0 1000 350" className="h-9 w-auto">
              <g fill="#111827">
                <circle cx="70" cy="275" r="40"/>
                <circle cx="190" cy="275" r="40"/>
                <circle cx="190" cy="155" r="40"/>
                <circle cx="310" cy="155" r="40"/>
                <circle cx="310" cy="35" r="40"/>
              </g>
              <circle cx="310" cy="275" r="40" fill="#16A34A"/>
              <g stroke="#111827" strokeWidth="8">
                <line x1="110" y1="275" x2="150" y2="275"/>
                <line x1="230" y1="275" x2="270" y2="275"/>
                <line x1="190" y1="195" x2="190" y2="235"/>
                <line x1="230" y1="155" x2="270" y2="155"/>
                <line x1="310" y1="75" x2="310" y2="115"/>
                <line x1="310" y1="195" x2="310" y2="235"/>
              </g>
              <text x="430" y="165" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="140" fill="#111827" letterSpacing="-4">Growth</text>
              <text x="430" y="295" fontFamily="Arial, sans-serif" fontSize="140" fill="#111827" letterSpacing="-2">Connect</text>
            </svg>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wide text-brand-charcoal">
          <a href="https://growthconnect.africa" className="hover:text-brand-green transition-colors">HOME</a>
          <a href="https://growthconnect.africaabout-us/" className="hover:text-brand-green transition-colors">ABOUT</a>
          <a href="https://growthconnect.africablog/" className="hover:text-brand-green transition-colors">BLOG</a>
        </nav>
      </div>
    </header>
  );
}

