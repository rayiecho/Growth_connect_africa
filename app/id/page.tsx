"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";

export default function LaunchpadIDOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<any>(null);
  const [preferredName, setPreferredName] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [confirmData, setConfirmData] = useState(false);
  const [confirmPermanent, setConfirmPermanent] = useState(false);
  const [consent, setConsent] = useState(false);

  async function handleEmailLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/public/lpx-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), action: "lookup" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed.");
      if (data.hasId) {
        router.push(`/id/success?id=${data.data.lpx_id}&email=${encodeURIComponent(email)}`);
        return;
      }
      setProfile(data.data);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleIdActivation(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmData || !confirmPermanent || !consent) {
      setErrorMessage("Please accept all mandatory confirmations and data consents.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/public/lpx-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          action: "generate",
          preferred_name: preferredName,
          alternate_phone: altPhone,
          linkedin: linkedin,
          consent_stored: consent
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Activation failed.");
      router.push(`/id/success?id=${data.lpx_id}&email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate ID.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen text-brand-charcoal">
      <div className="bg-gradient-to-r from-gray-900 to-black text-center py-16 px-4 border-b border-brand-line">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Complete Your LaunchPadX Onboarding</h1>
          <div className="w-16 h-1 bg-brand-green mx-auto mb-6"></div>
          <p className="text-gray-300 text-sm md:text-base mb-4">The Launchpad X ID is the foundation of your participation in this program.</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-2">Launchpad X ID Registration Form</h2>
        {errorMessage && <div className="bg-red-50 text-red-600 p-4 mb-6 rounded-lg">{errorMessage}</div>}
        {step === 1 ? (
          <form onSubmit={handleEmailLookup} className="max-w-md bg-gray-50 p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">Step 1: Enter Your Application Email</h3>
            <div className="mb-4"><TextInput type="email" required placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <Button variant="primary" type="submit" className="w-full" disabled={loading}>{loading ? "Searching..." : "Validate Email"}</Button>
          </form>
        ) : (
          <form onSubmit={handleIdActivation} className="space-y-8">
            <div className="bg-gray-50 border p-6 rounded-xl space-y-4">
              <h3 className="font-bold">What is the LaunchPadX ID?</h3>
              <p className="text-sm text-brand-slate">Your LaunchPadX ID is your official program identifier connected to FCMB.</p>
            </div>
            <div className="border p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Verified Profile (Read-Only)</h3>
              <p className="text-sm"><strong>Name:</strong> {profile?.first_name} {profile?.last_name}</p>
              <p className="text-sm"><strong>Email:</strong> {profile?.email}</p>
              <p className="text-sm"><strong>Business Name:</strong> {profile?.business_name || "-"}</p>
            </div>
            <div className="border p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="text-xs">Preferred Name</label><TextInput value={preferredName} onChange={(e) => setPreferredName(e.target.value)} /></div>
                <div><label className="text-xs">Alt Phone</label><TextInput value={altPhone} onChange={(e) => setAltPhone(e.target.value)} /></div>
                <div><label className="text-xs">LinkedIn URL</label><TextInput value={linkedin} onChange={(e) => setLinkedin(e.target.value)} /></div>
              </div>
            </div>
            <div className="bg-amber-50/50 border p-6 rounded-xl space-y-4">
              <label className="flex gap-3 text-sm select-none cursor-pointer"><input type="checkbox" required checked={confirmData} onChange={(e) => setConfirmData(e.target.checked)} /> <span>Information matches my records.*</span></label>
              <label className="flex gap-3 text-sm select-none cursor-pointer"><input type="checkbox" required checked={confirmPermanent} onChange={(e) => setConfirmPermanent(e.target.checked)} /> <span>I understand this ID is permanent.*</span></label>
              <label className="flex gap-3 text-sm select-none cursor-pointer"><input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} /> <span>I consent to data storage rules.*</span></label>
            </div>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? "Activating..." : "Submit & Generate My LaunchPadX ID"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}