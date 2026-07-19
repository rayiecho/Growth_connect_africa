import { MainSiteHeader } from "@/components/main-site/MainSiteHeader";
import { MainSiteFooter } from "@/components/main-site/MainSiteFooter";

const PITCH_FOR = [
  "Seed and growth funding",
  "Partnership opportunities",
  "Mentorship and strategic advisory",
  "Access to broader ecosystems",
];

const UNIQUE_TRAITS = [
  "A live event with top ecosystem players",
  "Carefully curated high-impact pitches",
  "Direct feedback and deal opportunities from investors",
  "Visibility and exposure to media and communities",
];

export default function TheCapitalPage() {
  return (
    <>
      <MainSiteHeader />

      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-brand-green uppercase tracking-widest mb-4">The Capital</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Where Ideas Meet Investors. Where Vision Meets Opportunity.
          </h1>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            <strong>The Capital</strong> is GrowthConnect&apos;s high-stakes pitch arena, an exclusive platform where
            standout entrepreneurs from our programs present their ideas live to a panel of investors, business
            leaders, and ecosystem stakeholders for a chance to secure real funding and strategic backing.
          </p>
          <p className="text-gray-600 leading-relaxed mb-10">
            It&apos;s more than a pitch, it&apos;s a launch moment.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mb-4">How it Works</h2>
          <p className="text-gray-600 leading-relaxed mb-10">
            Each cycle, top-performing founders from initiatives like LaunchPadX, StartWith50k, and the ScaleUp
            Initiative are selected based on traction, clarity of purpose, and potential for impact. These
            entrepreneurs are then groomed through intensive pitch training and investment readiness sessions before
            stepping into The Capital.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">At The Capital, they pitch for:</h3>
              <ul className="space-y-2">
                {PITCH_FOR.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-600">
                    <span className="text-brand-green mt-1">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">What Makes The Capital Unique:</h3>
              <ul className="space-y-2">
                {UNIQUE_TRAITS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-600">
                    <span className="text-brand-green mt-1">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">
            From dream to deal, The Capital is where we bridge ambition with access. It&apos;s the stage for bold
            thinkers, builders, and problem-solvers ready to scale impact with the right resources.
          </p>
        </div>
      </section>

      <section className="bg-brand-green py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Because every great business deserves its moment. And this is it.
          </h2>
          <a href="/signup" className="inline-flex items-center justify-center text-sm font-semibold rounded-full px-8 py-4 bg-gray-900 text-white hover:bg-black transition-colors">
            Get Started Now
          </a>
        </div>
      </section>

      <MainSiteFooter />
    </>
  );
}
