import { MainSiteHeader } from "@/components/main-site/MainSiteHeader";
import { MainSiteFooter } from "@/components/main-site/MainSiteFooter";

const PROGRAMS = [
  { name: "LaunchPadX", tagline: "Your Launch Starts Here.", href: "https://lpx.growthconnect.africa" },
  { name: "ScaleUp Initiative", tagline: "Empowering & Elevating Commerce.", href: "/scaleup-initiative" },
  { name: "DomiN8", tagline: "Own Your Mind. Shape Your Life.", href: "/domin8" },
  { name: "StartWith50k", tagline: "Small Capital. Big Starts.", href: "/startwith50k" },
  { name: "The Capital", tagline: "Where Ideas Meet Opportunity", href: "/the-capital" },
  { name: "WEinspire Conference", tagline: "Fueling Minds. Igniting Movements.", href: "/weinspire" },
];

export default function ProgramsPage() {
  return (
    <>
      <MainSiteHeader />

      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-brand-green uppercase tracking-widest mb-4">Our Programs</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            Empowering entrepreneurs at every stage of their journey.
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore our suite of high-impact initiatives designed to help you launch, grow, and scale. Each program is
            purpose-built with tools, training, funding, and community support to fuel your entrepreneurial journey.
          </p>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Explore Our Growth Pathways</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A diverse suite of programs designed to ignite potential, fuel ideas, and accelerate purpose-driven
              success. Whether you&apos;re just starting out or scaling your journey, there&apos;s a place for you here.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map((program) => (
              <a key={program.name} href={program.href} className="group bg-gray-50 rounded-2xl border border-gray-100 p-8 hover:border-brand-green hover:bg-white hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-green transition-colors">{program.name}</h3>
                <p className="text-sm text-gray-500">{program.tagline}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <MainSiteFooter />
    </>
  );
}
