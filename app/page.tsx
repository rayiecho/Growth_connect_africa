import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="brand-eyebrow-line" />
      <h1 className="text-2xl font-bold text-brand-charcoal">LaunchPadX</h1>
      <p className="text-brand-slate max-w-md">
        This is the applicant-tracking rebuild. Public forms and the admin
        dashboard live at the routes below.
      </p>
      <div className="flex gap-4 mt-4">
        <Link href="/apply" className="text-brand-green font-medium hover:underline">
          Application Form
        </Link>
        <Link href="/video-pitch" className="text-brand-green font-medium hover:underline">
          Video Pitch Form
        </Link>
        <Link href="/admin/login" className="text-brand-green font-medium hover:underline">
          Admin Login
        </Link>
      </div>
    </main>
  );
}
