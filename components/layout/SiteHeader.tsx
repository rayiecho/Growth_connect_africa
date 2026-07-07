import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-line">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="8" cy="8" r="3" fill="#1a1a2e" />
            <circle cx="8" cy="16" r="3" fill="#1a1a2e" />
            <circle cx="8" cy="24" r="3" fill="#2FA36B" />
            <circle cx="16" cy="8" r="3" fill="#1a1a2e" />
            <circle cx="24" cy="16" r="3" fill="#1a1a2e" />
            <line x1="8" y1="8" x2="8" y2="24" stroke="#1a1a2e" strokeWidth="1.5" />
            <line x1="8" y1="8" x2="16" y2="8" stroke="#1a1a2e" strokeWidth="1.5" />
            <line x1="8" y1="16" x2="24" y2="16" stroke="#1a1a2e" strokeWidth="1.5" />
          </svg>
          <span className="font-bold text-brand-charcoal leading-tight text-sm">
            Growth<br />Connect
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-brand-charcoal">
          <a href="https://growthconnect.africa/">HOME</a>
          <a href="https://growthconnect.africa/about-us/">ABOUT</a>
          <a href="https://growthconnect.africa/blog/">BLOG</a>
        </nav>
      </div>
    </header>
  );
}