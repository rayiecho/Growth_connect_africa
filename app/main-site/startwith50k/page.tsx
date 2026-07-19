import { MainSiteHeader } from "@/components/main-site/MainSiteHeader";
import { MainSiteFooter } from "@/components/main-site/MainSiteFooter";

export default function StartWith50kPage() {
  return (
    <>
      <MainSiteHeader />

      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-brand-green uppercase tracking-widest mb-4">StartWith50k</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Small Capital. Big Dreams. Real Impact.
          </h1>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            StartWith50k is a monthly funding initiative under GrowthConnect designed to give emerging entrepreneurs a
            real shot at launching or scaling their business ideas, with just &#8358;50,000.
          </p>
          <p className="text-gray-600 leading-relaxed mb-10">
            We believe that sometimes, all a dream needs is a small spark to ignite big impact. StartWith50k is that
            spark.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            Each month, aspiring business owners across Nigeria submit their ideas or growth plans, showing how
            &#8358;50,000 can create meaningful change. After a shortlisting process, the top 20 entries are put up for
            public voting. The most compelling idea wins the &#8358;50,000 grant, no strings attached.
          </p>
          <p className="text-gray-600 leading-relaxed mb-2">But the support doesn&apos;t stop at funding. Winners also gain access to:</p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-gray-600">
              <span className="text-brand-green mt-1">&bull;</span>
              <span>Business mentorship and strategy support</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600">
              <span className="text-brand-green mt-1">&bull;</span>
              <span>Visibility and spotlight across our platforms</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600">
              <span className="text-brand-green mt-1">&bull;</span>
              <span>Entry into the GrowthConnect entrepreneur network</span>
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Whether it&apos;s starting a mobile food business, launching a side hustle, or expanding a small venture,
            StartWith50k is proof that your hustle matters, and it deserves a chance. This initiative has already
            birthed new businesses, inspired job creation, and empowered everyday dreamers to take action, one idea at
            a time.
          </p>
        </div>
      </section>

      <section className="bg-brand-green py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Got a business dream? Start with 50k. We&apos;ll help you take it from idea to impact.
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
