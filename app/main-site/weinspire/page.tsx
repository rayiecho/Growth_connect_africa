import { MainSiteHeader } from "@/components/main-site/MainSiteHeader";
import { MainSiteFooter } from "@/components/main-site/MainSiteFooter";

const HAPPENINGS = [
  { title: "Visionary Talks", desc: "from industry disruptors and culture shapers" },
  { title: "Action Workshops", desc: "on leadership, innovation, growth, and impact" },
  { title: "Live Stories", desc: "of transformation from past participants" },
  { title: "Networking Lounges", desc: "for collaboration and mentorship" },
  { title: "Activation Booths", desc: "for launching real-life projects and initiatives" },
];

const IMPACT = [
  "Thousands of attendees across Nigeria and Africa",
  "Dozens of new businesses and social projects launched",
  "Powerful life shifts, fresh ideas, and renewed purpose",
  "A growing community of change-driven young leaders",
];

export default function WEinspirePage() {
  return (
    <>
      <MainSiteHeader />

      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-brand-green uppercase tracking-widest mb-4">WEinspire Conference</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Igniting Minds. Unleashing Possibilities.
          </h1>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            The <strong>WEinspire Conference</strong> is GrowthConnect&apos;s flagship annual gathering, an
            electrifying experience designed to awaken purpose, catalyze action, and elevate the minds of young
            changemakers, creators, and builders across Africa.
          </p>
          <p className="text-gray-600 leading-relaxed mb-10">
            With thousands of participants every year and four powerful editions already held, WEinspire has become
            more than just an event. It&apos;s a movement. A launchpad. A reset point for purpose-driven lives and big
            ideas.
          </p>
          <p className="text-gray-600 leading-relaxed mb-10">
            WEinspire is where thought leadership meets real-life transformation. We bring together trailblazers,
            innovators, entrepreneurs, and community leaders to share stories, spark shifts in perspective, and ignite
            the bold action needed to shape the future of Africa. Through powerful keynotes, panels, workshops, and
            action-focused breakout sessions, we create a space for people to gain clarity, build confidence, and leave
            with a renewed sense of mission.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mb-4">What Happens at WEinspire</h2>
          <ul className="space-y-3 mb-10">
            {HAPPENINGS.map((h) => (
              <li key={h.title} className="text-gray-600">
                <strong className="text-gray-900">{h.title}</strong> {h.desc}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-4">The Impact So Far</h2>
          <ul className="space-y-2 mb-10">
            {IMPACT.map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-600">
                <span className="text-brand-green mt-1">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-gray-600 leading-relaxed">
            WEinspire isn&apos;t just another conference. It&apos;s a spark that becomes a wildfire. A room that
            becomes a revolution. A moment that becomes a movement.
          </p>
        </div>
      </section>

      <section className="bg-brand-green py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Join the next edition. Step into the room. Be inspired to lead, create, and transform.
          </h2>
          <a href="/signup" className="inline-flex items-center justify-center text-sm font-semibold rounded-full px-8 py-4 bg-gray-900 text-white hover:bg-black transition-colors">
            See Past Highlights
          </a>
        </div>
      </section>

      <MainSiteFooter />
    </>
  );
}
