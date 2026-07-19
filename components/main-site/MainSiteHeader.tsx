"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Programs", href: "/programs" },
  { label: "Blog", href: "/blog" },
];

export function MainSiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 1000 350" xmlns="http://www.w3.org/2000/svg">
            <g fill="#111827">
              <circle cx="70" cy="275" r="40"/>
              <circle cx="190" cy="275" r="40"/>
              <circle cx="190" cy="155" r="40"/>
              <circle cx="310" cy="155" r="40"/>
              <circle cx="310" cy="35" r="40"/>
            </g>
            <circle cx="310" cy="275" r="40" fill="#16A34A"/>
            <g stroke="#111827" strokeWidth="10">
              <line x1="110" y1="275" x2="150" y2="275"/>
              <line x1="230" y1="275" x2="270" y2="275"/>
              <line x1="190" y1="195" x2="190" y2="235"/>
              <line x1="230" y1="155" x2="270" y2="155"/>
              <line x1="310" y1="75" x2="310" y2="115"/>
              <line x1="310" y1="195" x2="310" y2="235"/>
            </g>
          </svg>
          <span className="text-lg font-bold tracking-tight text-gray-900">GrowthConnect</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-700 hover:text-brand-green transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a href="/login" className="text-sm font-medium text-gray-700 hover:text-brand-green transition-colors">
            Login
          </a>
          <a href="/signup" className="inline-flex items-center justify-center text-sm font-semibold rounded-full px-5 py-2.5 bg-gray-900 text-white hover:bg-brand-green transition-colors">
            Get Started
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-9 h-9 text-gray-900"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <a href="/login" className="text-sm font-medium text-gray-700">Login</a>
          <a href="/signup" className="text-sm font-semibold text-brand-green">Get Started</a>
        </nav>
      )}
    </header>
  );
}

