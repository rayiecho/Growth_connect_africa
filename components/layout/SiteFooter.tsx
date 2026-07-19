"use client";

import { useState } from "react";
import Link from "next/link";
import { ContactFormModal } from "@/components/ui/ContactFormModal";

export function SiteFooter() {
  const [modalOpen, setModalOpen] = useState<"contact" | "sos" | null>(null);

  return (
    <footer className="bg-brand-charcoal text-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10 md:gap-8">
        <div>
          <div className="flex items-center gap-2 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 350" className="h-8 w-auto">
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
          <p className="text-white/60 text-sm mb-6 max-w-xs leading-relaxed">
            Growth Connect links entrepreneurs to opportunities and tools for real impact and sustainable growth.
          </p>
          <div className="flex gap-3">
            <a href="https://instagram.com/joingrowthconnect" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold hover:bg-brand-green hover:border-brand-green hover:text-white transition-colors">IG</a>
            <a href="https://www.tiktok.com/@joingrowthconnect" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold hover:bg-brand-green hover:border-brand-green hover:text-white transition-colors">TT</a>
            <a href="https://www.linkedin.com/company/joingrowthconnect" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold hover:bg-brand-green hover:border-brand-green hover:text-white transition-colors">LI</a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Useful links</h4>
          <ul className="space-y-3.5 text-white/70 text-sm">
            <li><a href="https://growthconnect.africa/login/" className="hover:text-brand-green transition-colors">Dashboard</a></li>
            <li><a href="https://growthconnect.africa" className="hover:text-brand-green transition-colors">About Us</a></li>
            <li><Link href="/faq" className="hover:text-brand-green transition-colors">FAQs</Link></li>
            <li><button type="button" onClick={() => setModalOpen("contact")} className="hover:text-brand-green transition-colors text-left">Contact Team</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Programs</h4>
          <ul className="space-y-3.5 text-white/70 text-sm">
            <li><a href="https://growthconnect.africa/domin8/" className="hover:text-brand-green transition-colors">DomiN8</a></li>
            <li><a href="https://growthconnect.africa/" className="hover:text-brand-green transition-colors">LaunchPadX</a></li>
            <li><a href="https://growthconnect.africa/scaleup-initiative/" className="hover:text-brand-green transition-colors">ScaleUp Initiative</a></li>
            <li><a href="https://growthconnect.africa/programs/" className="hover:text-brand-green transition-colors">Explore More</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Contact Us</h4>
          <div className="space-y-3 text-white/70 text-sm mb-6">
            <p className="leading-relaxed">Kigali Innovation City, Bumbogo,<br />Gasabo District, Kigali, Rwanda</p>
            <p><a href="tel:+250791336179" className="hover:text-brand-green transition-colors">+250 791 336 179</a></p>
            <p><a href="mailto:hello@growthconnect.africa" className="hover:text-brand-green transition-colors">hello@growthconnect.africa</a></p>
          </div>
          <button type="button" onClick={() => setModalOpen("sos")} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-red-600/20 transition-colors">
            <span aria-hidden="true">&#9888;&#65039;</span>
            SOS
          </button>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-white/50 text-sm relative">
          <span>(c) Copyright {new Date().getFullYear()} Growth Connect. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white/80 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/80 transition-colors">Terms &amp; Conditions</Link>
          </div>
          <Link href="/admin/login" className="md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 text-white/10 hover:text-white/30 transition-colors tracking-widest select-none" aria-label="Admin">...</Link>
        </div>
      </div>

      {modalOpen && <ContactFormModal variant={modalOpen} onClose={() => setModalOpen(null)} />}
    </footer>
  );
}

