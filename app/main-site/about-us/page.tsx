import { MainSiteHeader } from "@/components/main-site/MainSiteHeader";
import { MainSiteFooter } from "@/components/main-site/MainSiteFooter";

export default function AboutUsPage() {
  return (
    <>
      <MainSiteHeader />

      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-brand-green uppercase tracking-widest mb-4">About Us</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Connecting purpose to action, by bridging the gap between ideas and execution through access, community, and opportunity.
          </h1>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Why We Exist</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            At <strong>GrowthConnect</strong>, our mission is simple yet powerful: to connect entrepreneurs to the right
            opportunities, tools, and resources they need to grow and scale.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            We envision a thriving ecosystem where African entrepreneurs are equipped, empowered, and enabled to build
            sustainable businesses that impact communities and change the world.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Whether it&apos;s funding, mentorship, skill-building, or revenue-generating systems, we create the bridge
            between purpose and real growth.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Powered by Lustre Africa</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            GrowthConnect is proudly powered by <strong>Lustre Africa</strong>, a creative impact-driven company at the
            forefront of entrepreneurship, innovation, and digital transformation.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Through Lustre Africa&apos;s initiatives arm, we&apos;ve birthed GrowthConnect as a vehicle to help young
            founders, dreamers, and doers unlock their highest potential by providing access to everything they need to
            launch, grow, and scale. With a proven track record of building impactful platforms and empowering
            communities, Lustre Africa remains the backbone of GrowthConnect&apos;s infrastructure, strategy, and success.
          </p>
        </div>
      </section>

      <section className="bg-brand-green py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Discover how GrowthConnect empowers entrepreneurs by turning bold ideas into thriving ventures, one
            opportunity at a time.
          </h2>
          <a href="/programs" className="inline-flex items-center justify-center text-sm font-semibold rounded-full px-8 py-4 bg-gray-900 text-white hover:bg-black transition-colors">
            Explore Our Programs
          </a>
        </div>
      </section>

      <MainSiteFooter />
    </>
  );
}
