import { MainSiteHeader } from "@/components/main-site/MainSiteHeader";
import { MainSiteFooter } from "@/components/main-site/MainSiteFooter";

const PROGRAMS = [
  { name: "LaunchPadX", tagline: "Startup Empowerment Engine", href: "https://lpx.growthconnect.africa" },
  { name: "StartWith50k", tagline: "Micro-Funding Launchpad", href: "/startwith50k" },
  { name: "DomiN8", tagline: "Purpose-Driven Growth", href: "/domin8" },
  { name: "The Capital", tagline: "Live Investor Pitch", href: "/the-capital" },
  { name: "ScaleUp Initiative", tagline: "Digital Commerce Acceleration", href: "/scaleup-initiative" },
  { name: "WEinspire Conference", tagline: "Annual Impact Gathering", href: "/weinspire" },
];

const PILLARS = [
  { title: "Entrepreneur Support", desc: "Mentorship & Community." },
  { title: "Opportunity Access", desc: "Funding. Tools. Networks." },
  { title: "Scalable Growth", desc: "Learn. Build. Scale." },
];

const VALUES = [
  { title: "Access for All", desc: "Democratizing opportunities, knowledge, and tools for entrepreneurs regardless of background." },
  { title: "Sustainable Impact", desc: "Focusing on long-term growth and real-world transformation, not just short-term wins." },
  { title: "Founder-First Culture", desc: "Supporting the journey of every entrepreneur with care, clarity, and community." },
];

const TESTIMONIALS = [
  { quote: "Before LaunchPadX, I had ideas but no direction. Now, I've launched my business, found a mentor, and secured early customers.", name: "Amaka Chukwu", program: "LaunchPadX" },
  { quote: "WEinspire left me in awe. I walked away with clarity, confidence, and a plan. It's more than an event, it's an ignition switch for purpose.", name: "Adam Yusuf", program: "WEinspire Conference" },
  { quote: "DomiN8 broke my limiting beliefs and helped me rebuild from the inside out. I found my voice, vision, and value.", name: "Joseph Uche", program: "DomiN8" },
  { quote: "Pitching at The Capital was life-changing. I not only met investors, but also formed new partnerships and gained massive exposure.", name: "Olumide Daniel", program: "The Capital" },
];

export default function MainSiteHomePage() {
  return (
    <>
      <MainSiteHeader />

      <section className="relative overflow-hidden bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand-green uppercase tracking-widest mb-4">GrowthConnect Africa</p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Connect to Growth.<br />Fuel Your Future.
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-xl">
              Get linked to the tools, funding, and mentorship you need to build, scale, and succeed as an entrepreneur.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/signup" className="inline-flex items-center justify-center text-sm font-semibold rounded-full px-7 py-3.5 bg-brand-green text-white hover:bg-brand-green-dark transition-colors">
                Get Started
              </a>
              <a href="/programs" className="inline-flex items-center justify-center text-sm font-semibold rounded-full px-7 py-3.5 border border-white/30 text-white hover:bg-white/10 transition-colors">
                Explore Programs
              </a>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <svg width="100%" height="100%" viewBox="0 0 1000 350" preserveAspectRatio="xMidYMid slice">
            <g fill="#ffffff">
              <circle cx="70" cy="275" r="60"/>
              <circle cx="250" cy="275" r="60"/>
              <circle cx="250" cy="115" r="60"/>
              <circle cx="430" cy="115" r="60"/>
              <circle cx="430" cy="-45" r="60"/>
            </g>
            <g stroke="#ffffff" strokeWidth="14">
              <line x1="130" y1="275" x2="190" y2="275"/>
              <line x1="310" y1="275" x2="370" y2="275"/>
              <line x1="250" y1="175" x2="250" y2="215"/>
              <line x1="310" y1="115" x2="370" y2="115"/>
              <line x1="430" y1="15" x2="430" y2="55"/>
            </g>
          </svg>
        </div>
      </section>

      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((p) => (
            <div key={p.title} className="text-center md:text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{p.title}</h3>
              <p className="text-sm text-gray-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Explore Our Programs</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Get equipped &amp; empowered at every stage of your journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map((program) => (
              <a key={program.name} href={program.href} className="group bg-white rounded-2xl border border-gray-100 p-8 hover:border-brand-green hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-green transition-colors">{program.name}</h3>
                <p className="text-sm text-gray-500">{program.tagline}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">The Work We Do</h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            At GrowthConnect, we are building a thriving ecosystem where entrepreneurs don&apos;t just survive, they scale.
            From programs to funding bridges, mentorship to resources, everything we do is designed to empower founders
            across Africa to move from idea to impact.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {VALUES.map((v) => (
              <div key={v.title} className="border-l-2 border-brand-green pl-5">
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-14">What Our Community Is Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <p className="text-gray-300 mb-5 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-brand-green">{t.program}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-green py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Discover how GrowthConnect empowers entrepreneurs by turning bold ideas into thriving ventures.
          </h2>
          <a href="/signup" className="inline-flex items-center justify-center text-sm font-semibold rounded-full px-8 py-4 bg-gray-900 text-white hover:bg-black transition-colors">
            Sign Up Now
          </a>
        </div>
      </section>

      <MainSiteFooter />
    </>
  );
}

