import { MainSiteHeader } from "@/components/main-site/MainSiteHeader";
import { MainSiteFooter } from "@/components/main-site/MainSiteFooter";

export default function DomiN8Page() {
  return (
    <>
      <MainSiteHeader />

      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-brand-green uppercase tracking-widest mb-4">DomiN8</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Own Your Story. Live with Intention. Dominate Your Journey.
          </h1>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            DomiN8 is more than a program, it&apos;s a personal transformation experience designed to help individuals
            break past limiting beliefs, discover who they truly are, and live boldly with purpose. Powered by
            GrowthConnect, DomiN8 is a space for inner growth, clarity, and courageous action.
          </p>
          <p className="text-gray-600 leading-relaxed mb-10">
            In a world full of noise, confusion, and comparison, DomiN8 cuts through the chaos to awaken people to
            their full potential. It&apos;s crafted for anyone feeling stuck, uncertain, or unfulfilled, offering a
            clear pathway to reclaim confidence, unlock purpose, and move with clarity.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            Through its practical tools, mind-shifting frameworks, guided challenges, and a vibrant growth community,
            DomiN8 empowers individuals to build powerful habits, sharpen their mindset, and take ownership of their
            life&apos;s direction. It&apos;s a movement for those who are done playing small and are ready to step into
            a higher version of themselves, mentally, emotionally, and spiritually.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            DomiN8 goes beyond surface motivation. It provides the structure and accountability needed to rewire old
            patterns, adopt a purpose-driven lifestyle, and take consistent action. Every experience is deeply rooted
            in transformation, from curated learning sessions to mentorship, and real-life success stories that
            inspire bold execution.
          </p>
          <p className="text-gray-600 leading-relaxed">
            If you&apos;ve ever felt like there&apos;s more to your life than what you&apos;re currently living, DomiN8
            is the system to help you unlock it. It&apos;s not just about personal development, it&apos;s about life
            alignment, and walking fully in your purpose.
          </p>
        </div>
      </section>

      <section className="bg-brand-green py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            This is your invitation to stop shrinking and start rising.
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
