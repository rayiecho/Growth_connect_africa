"use client";

import { useState } from "react";
import Link from "next/link";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-line">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="h-10 w-auto flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 350" className="h-9 w-auto">
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
          <a href="https://growthconnect.africa/about-us/" className="hover:text-brand-green transition-colors">ABOUT</a>
          <a href="https://growthconnect.africa/blog/" className="hover:text-brand-green transition-colors">BLOG</a>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-9 h-9 text-brand-charcoal"
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
        <nav className="md:hidden border-t border-brand-line bg-white px-6 py-4 flex flex-col gap-4 text-sm font-bold tracking-wide text-brand-charcoal">
          <a href="https://growthconnect.africa" className="hover:text-brand-green transition-colors" onClick={() => setMenuOpen(false)}>HOME</a>
          <a href="https://growthconnect.africa/about-us/" className="hover:text-brand-green transition-colors" onClick={() => setMenuOpen(false)}>ABOUT</a>
          <a href="https://growthconnect.africa/blog/" className="hover:text-brand-green transition-colors" onClick={() => setMenuOpen(false)}>BLOG</a>
        </nav>
      )}
    </header>
  );
}
