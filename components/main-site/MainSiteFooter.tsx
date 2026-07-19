import Link from "next/link";

const PROGRAMS = [
  { label: "LaunchPadX", href: "https://lpx.growthconnect.africa" },
  { label: "ScaleUp Initiative", href: "/scaleup-initiative" },
  { label: "DomiN8", href: "/domin8" },
  { label: "The Capital", href: "/the-capital" },
  { label: "StartWith50k", href: "/startwith50k" },
  { label: "WEinspire Conference", href: "/weinspire" },
];

export function MainSiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg width="28" height="28" viewBox="0 0 1000 350" xmlns="http://www.w3.org/2000/svg">
              <g fill="#ffffff">
                <circle cx="70" cy="275" r="40"/>
                <circle cx="190" cy="275" r="40"/>
                <circle cx="190" cy="155" r="40"/>
                <circle cx="310" cy="155" r="40"/>
                <circle cx="310" cy="35" r="40"/>
              </g>
              <circle cx="310" cy="275" r="40" fill="#16A34A"/>
              <g stroke="#ffffff" strokeWidth="10">
                <line x1="110" y1="275" x2="150" y2="275"/>
                <line x1="230" y1="275" x2="270" y2="275"/>
                <line x1="190" y1="195" x2="190" y2="235"/>
                <line x1="230" y1="155" x2="270" y2="155"/>
                <line x1="310" y1="75" x2="310" y2="115"/>
                <line x1="310" y1="195" x2="310" y2="235"/>
              </g>
            </svg>
            <span className="text-base font-bold text-white">GrowthConnect</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Growth Connect links entrepreneurs to opportunities and tools for real impact and sustainable growth.
          </p>
          <div className="flex gap-4 text-sm">
            <a href="https://www.facebook.com/lustreafrica" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green transition-colors">Facebook</a>
            <a href="https://instagram.com/joingrowthconnect" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green transition-colors">Instagram</a>
            <a href="https://twitter.com/lustreafrica" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green transition-colors">X</a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Useful Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/login" className="hover:text-brand-green transition-colors">Dashboard</a></li>
            <li><Link href="/about-us" className="hover:text-brand-green transition-colors">About Us</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-green transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-brand-green transition-colors">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Programs</h4>
          <ul className="space-y-2 text-sm">
            {PROGRAMS.map((p) => (
              <li key={p.label}>
                <a href={p.href} className="hover:text-brand-green transition-colors">{p.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Contact Us</h4>
          <p className="text-sm text-gray-400 mb-2">Kigali Innovation City, Bumbogo, Gasabo District, Kigali, Rwanda</p>
          <p className="text-sm text-gray-400 mb-2">+250 791 336 179</p>
          <a href="mailto:hello@growthconnect.africa" className="text-sm text-gray-400 hover:text-brand-green transition-colors">
            hello@growthconnect.africa
          </a>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Growth Connect. All rights reserved.
      </div>
    </footer>
  );
}
