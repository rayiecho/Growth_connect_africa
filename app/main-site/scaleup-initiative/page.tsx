import { MainSiteHeader } from "@/components/main-site/MainSiteHeader";
import { MainSiteFooter } from "@/components/main-site/MainSiteFooter";

export default function ScaleUpInitiativePage() {
  return (
    <>
      <MainSiteHeader />

      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-brand-green uppercase tracking-widest mb-4">ScaleUp Initiative</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Empowering Merchants. Elevating Commerce.
          </h1>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            The <strong>ScaleUp Initiative</strong> is a strategic partnership program between GrowthConnect, Lustre
            Africa, and Sharesell aimed at equipping merchants, aspiring sellers, and digital entrepreneurs with the
            skills, tools, and support they need to thrive in the evolving world of e-commerce.
          </p>
          <p className="text-gray-600 leading-relaxed mb-10">
            From onboarding traditional sellers to enabling individuals to start profitable dropshipping businesses,
            ScaleUp helps bridge the digital gap, turning hustle into structure and ideas into income.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            This program is ideal for merchants who want to digitize their sales process, first-time sellers exploring
            dropshipping, and small business owners looking to scale through tech-enabled platforms. With the rise of
            e-commerce across Africa, ScaleUp provides the education and strategic edge needed to stand out and succeed
            in the digital marketplace.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            Participants benefit from seamless onboarding experiences, personalized coaching, and an ecosystem of
            resources that drive real results, from increased product visibility and customer acquisition to improved
            retention and long-term revenue growth. With access to toolkits, training sessions, and community support,
            ScaleUp isn&apos;t just about getting online, it&apos;s about thriving online.
          </p>
          <p className="text-gray-600 leading-relaxed">
            As more African businesses look to tap into the power of digital platforms, the ScaleUp Initiative is
            lighting the path forward, one merchant at a time. Whether you&apos;re new to selling or ready to expand
            your reach, ScaleUp gives you the tools to go further, faster.
          </p>
        </div>
      </section>

      <section className="bg-brand-green py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Start your digital journey with ScaleUp.
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
