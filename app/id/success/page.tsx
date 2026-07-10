"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";

function SuccessCardContent() {
  const searchParams = useSearchParams();
  const idValue = searchParams.get("id") || "LPX-PENDING";
  const emailValue = searchParams.get("email") || "";
  
  const [copied, setCopied] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [preferredName, setPreferredName] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  function copyToClipboard() {
    navigator.clipboard.writeText(idValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setPhotoPreviewUrl(reader.result as string); };
    reader.readAsDataURL(file);
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveSuccessMessage(null);
    try {
      const res = await fetch("/api/public/lpx-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailValue,
          action: "generate",
          preferred_name: preferredName,
          consent_stored: true
        }),
      });
      if (!res.ok) throw new Error("Update failed.");
      setSaveSuccessMessage("Profile parameters updated successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  }

  function downloadIdCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGeneratingCard(true);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsGeneratingCard(false);
      return;
    }

    canvas.width = 1000;
    canvas.height = 600;

    // 1. Draw Split Background Layout
    ctx.fillStyle = "#FFFFFF"; 
    ctx.fillRect(0, 0, 1000, 600);

    ctx.fillStyle = "#111827"; 
    ctx.fillRect(0, 0, 360, 600);

    ctx.fillStyle = "#16A34A"; 
    ctx.fillRect(356, 0, 4, 600);

    // 2. Draw Left Side Avatar Ring Frame
    const centerX = 180;
    const centerY = 290;
    const radius = 105;

    ctx.save();
    ctx.strokeStyle = "#16A34A";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    if (photoPreviewUrl) {
      const userImg = new Image();
      userImg.src = photoPreviewUrl;
      ctx.drawImage(userImg, centerX - radius, centerY - radius, radius * 2, radius * 2);
    } else {
      ctx.fillStyle = "#1F2937";
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
      ctx.fillStyle = "#4B5563";
      ctx.beginPath();
      ctx.arc(centerX, centerY - 20, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX, centerY + 80, 70, Math.PI, 0, false);
      ctx.fill();
    }
    ctx.restore();

    // User Text Labels on Left Side Panel
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillText(preferredName ? preferredName.toUpperCase() : "PARTICIPANT NODE", centerX, 445);

    ctx.fillStyle = "#BBF7D0"; 
    ctx.font = "600 15px Arial, sans-serif";
    ctx.fillText("OFFICIAL REPRESENTATIVE", centerX, 480);

    // 3. Draw Right Side Metadata Data Sheet Grid Elements
    ctx.textAlign = "left";
    ctx.fillStyle = "#16A34A";
    ctx.font = "bold 20px Arial, sans-serif";
    ctx.fillText("LAUNCHPADX COHORT PROGRAMME", 410, 65);

    ctx.fillStyle = "#9CA3AF";
    ctx.font = "bold 15px Arial, sans-serif";
    ctx.fillText("OFFICIAL ECOSYSTEM IDENTIFIER", 410, 160);

    ctx.fillStyle = "#111827";
    ctx.font = "bold 44px Arial, sans-serif";
    ctx.fillText(idValue, 410, 215);

    ctx.fillStyle = "#6B7280";
    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText("Linked Channel Account:", 410, 310);
    ctx.fillStyle = "#111827";
    ctx.font = "normal 18px Arial, sans-serif";
    ctx.fillText(emailValue || "Verified Matrix Account", 410, 340);

    ctx.fillStyle = "#6B7280";
    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText("Ecosystem Security Group:", 410, 400);
    ctx.fillStyle = "#111827";
    ctx.font = "normal 18px Arial, sans-serif";
    ctx.fillText("LaunchPadX Cohort 2", 410, 430);

    ctx.fillStyle = "#6B7280";
    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText("Identity Allocation Status:", 410, 490);
    ctx.fillStyle = "#16A34A";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText("ACTIVE INITIALIZED IDENTITY", 410, 520);

    ctx.fillStyle = "#9CA3AF";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillText("Proof of identity issued via secure GrowthConnect platform metrics tracking layout components.", 410, 565);

    // 4. Load & Render Logo SVG Vector On Left Side Panel Top Corner
    const logoImg = new Image();
    logoImg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://w3.org" viewBox="0 0 1000 350"><g fill="#FFFFFF"><circle cx="70" cy="275" r="40"/><circle cx="190" cy="275" r="40"/><circle cx="190" cy="155" r="40"/><circle cx="310" cy="155" r="40"/><circle cx="310" cy="35" r="40"/></g><circle cx="310" cy="275" r="40" fill="#16A34A"/><g stroke="#FFFFFF" stroke-width="8"><line x1="110" y1="275" x2="150" y2="275"/><line x1="230" y1="275" x2="270" y2="275"/><line x1="190" y1="195" x2="190" y2="235"/><line x1="230" y1="155" x2="270" y2="155"/><line x1="310" y1="75" x2="310" y2="115"/><line x1="310" y1="195" x2="310" y2="235"/></g><text x="430" y="165" font-family="Arial" font-weight="bold" font-size="140" fill="#FFFFFF">Growth</text><text x="430" y="295" font-family="Arial" font-size="140" fill="#FFFFFF">Connect</text></svg>`);

    try { ctx.drawImage(logoImg, 45, 35, 270, 78); } catch(e){}

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "LaunchPadX-ID-" + idValue + ".png";
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Canvas export failed:", err);
    } finally {
      setIsGeneratingCard(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen text-brand-charcoal py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <canvas ref={canvasRef} className="hidden" />

        <div className="bg-brand-green/10 border border-brand-green/20 rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-bold text-brand-green-dark mb-1">Congratulations!</h2>
          <p className="text-sm text-brand-slate">Your LaunchPadX ID has been successfully generated.</p>
        </div>

        <div className="bg-white border border-brand-line rounded-2xl shadow-sm overflow-hidden p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-40 h-40 rounded-full border-4 border-brand-green overflow-hidden bg-gray-100 flex items-center justify-center relative">
              {photoPreviewUrl ? (
                <img src={photoPreviewUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">No Photo Uploaded</span>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-3 text-sm">
            <p className="text-xs text-gray-400 font-bold uppercase">Official Identity String</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-bold text-brand-green">{idValue}</span>
              <Button variant="secondary" onClick={copyToClipboard} className="text-xs px-2 py-0.5">{copied ? "Copied!" : "Copy"}</Button>
            </div>
            <p><strong className="text-brand-slate">Preferred Name:</strong> {preferredName || "Not Specified Yet"}</p>
            <p><strong className="text-brand-slate">Account Email:</strong> {emailValue}</p>
          </div>
        </div>

        <div className="bg-white border border-brand-line rounded-2xl p-6">
          <h3 className="text-base font-bold text-brand-charcoal mb-4">Complete and Personalize Your ID Card Details</h3>
          {saveSuccessMessage && <p className="text-sm text-green-600 mb-4 font-medium">âœ“ {saveSuccessMessage}</p>}
          <form onSubmit={handleProfileUpdate} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-brand-slate mb-1">Preferred First Name on Card</label>
              <TextInput placeholder="e.g. Regan" value={preferredName} onChange={(e) => setPreferredName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-slate mb-1">Upload Profile Identification Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-green/10 file:text-brand-green-dark hover:file:bg-brand-green/20" />
            </div>
            <Button type="submit" variant="primary" disabled={isSavingProfile}>
              {isSavingProfile ? "Saving Parameters..." : "Save Identity Parameters"}
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <Button variant="primary" onClick={downloadIdCard} disabled={isGeneratingCard}>
            {isGeneratingCard ? "Building Visual Asset..." : "Download Official ID Card Image"}
          </Button>
          <a href="/verification" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-brand-charcoal rounded-lg text-sm font-medium transition-colors text-center">
            Proceed to Founder Verification
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LaunchpadIDSuccess() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-brand-slate">Loading Profile Node...</div>}>
      <SuccessCardContent />
    </Suspense>
  );
}


