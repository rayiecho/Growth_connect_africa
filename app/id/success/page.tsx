"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import { PhotoCameraCapture } from "@/components/ui/PhotoCameraCapture";
import { OtpGate } from "@/components/forms/OtpGate";

function SuccessCardContent() {
  const searchParams = useSearchParams();
  const idValue = searchParams.get("id") || "LPX-PENDING";
  const emailValue = searchParams.get("email") || "";

  const [loadStatus, setLoadStatus] = useState<"loading" | "otp-required" | "loaded">(
    emailValue ? "loading" : "loaded"
  );

  const [copied, setCopied] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cohort, setCohort] = useState("LaunchPadX Cohort Two");
  const [preferredName, setPreferredName] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  function runLookup() {
    fetch("/api/public/lpx-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailValue, action: "lookup" }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.otpRequired) {
          setLoadStatus("otp-required");
          return;
        }
        if (data?.data) {
          setCohort(data.data.cohort || "LaunchPadX Cohort Two");
          setPreferredName(data.data.preferred_name || "");
          setAltPhone(data.data.alternate_phone || "");
          setLinkedin(data.data.linkedin || "");
          if (data.data.photo_path) {
            setPhotoPath(data.data.photo_path);
            const segments = data.data.photo_path.split("/").map(encodeURIComponent).join("/");
            setPhotoPreviewUrl(`/api/public/lpx-id/photo/${segments}?email=${encodeURIComponent(emailValue)}`);
          }
        }
        setLoadStatus("loaded");
      })
      .catch(() => {
        setLoadStatus("loaded");
      });
  }

  useEffect(() => {
    if (!emailValue) return;
    runLookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailValue]);

  function copyToClipboard() {
    navigator.clipboard.writeText(idValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function uploadPhoto(file: File | Blob) {
    setIsUploadingPhoto(true);
    setPhotoError(null);

    const localPreview = URL.createObjectURL(file);
    setPhotoPreviewUrl(localPreview);

    try {
      const formData = new FormData();
      formData.append("file", file, "photo.jpg");
      formData.append("email", emailValue);

      const res = await fetch("/api/public/lpx-id/upload-photo", {
        method: "POST",
        body: formData,
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setPhotoError(`Server error (status ${res.status}). Please try again.`);
        setIsUploadingPhoto(false);
        return;
      }

      if (!res.ok) {
        setPhotoError(data.error || "Photo upload failed.");
        setIsUploadingPhoto(false);
        return;
      }

      setPhotoPath(data.key);

      const saveRes = await fetch("/api/public/lpx-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailValue,
          action: "update_profile",
          photo_path: data.key,
        }),
      });
      if (!saveRes.ok) {
        setPhotoError("Photo uploaded but failed to save to your profile. Please try saving again.");
      }
    } catch {
      setPhotoError("Network error uploading photo. Please try again.");
    }
    setIsUploadingPhoto(false);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadPhoto(file);
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveSuccessMessage(null);
    setSaveError(null);
    try {
      const res = await fetch("/api/public/lpx-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailValue,
          action: "update_profile",
          preferred_name: preferredName,
          alternate_phone: altPhone,
          linkedin: linkedin,
          photo_path: photoPath,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setSaveError(`Server error (status ${res.status}). Please try again.`);
        setIsSavingProfile(false);
        return;
      }

      if (!res.ok) {
        setSaveError(data.error || "Update failed.");
        setIsSavingProfile(false);
        return;
      }

      setSaveSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setSaveError("Network error. Please try again.");
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

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 1000, 600);

    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, 360, 600);

    ctx.fillStyle = "#16A34A";
    ctx.fillRect(356, 0, 4, 600);

    const centerX = 180;
    const centerY = 290;
    const radius = 105;

    function drawRestOfCard(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      ctx.save();
      ctx.strokeStyle = "#16A34A";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px Arial, sans-serif";
      ctx.fillText(preferredName ? preferredName.toUpperCase() : "PARTICIPANT", centerX, 445);

      ctx.fillStyle = "#BBF7D0";
      ctx.font = "600 15px Arial, sans-serif";
      ctx.fillText("PROGRAM PARTICIPANT", centerX, 480);

      ctx.textAlign = "left";
      ctx.fillStyle = "#16A34A";
      ctx.font = "bold 20px Arial, sans-serif";
      ctx.fillText(`${cohort.toUpperCase()} PROGRAMME`, 410, 65);

      ctx.fillStyle = "#9CA3AF";
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.fillText("LAUNCHPADX PROGRAM ID", 410, 160);

      ctx.fillStyle = "#111827";
      ctx.font = "bold 44px Arial, sans-serif";
      ctx.fillText(idValue, 410, 215);

      ctx.fillStyle = "#6B7280";
      ctx.font = "bold 16px Arial, sans-serif";
      ctx.fillText("Linked Channel Account:", 410, 310);
      ctx.fillStyle = "#111827";
      ctx.font = "normal 18px Arial, sans-serif";
      ctx.fillText(emailValue || "Verified Account", 410, 340);

      ctx.fillStyle = "#6B7280";
      ctx.font = "bold 16px Arial, sans-serif";
      ctx.fillText("Ecosystem Security Group:", 410, 400);
      ctx.fillStyle = "#111827";
      ctx.font = "normal 18px Arial, sans-serif";
      ctx.fillText(cohort, 410, 430);

      ctx.fillStyle = "#6B7280";
      ctx.font = "bold 16px Arial, sans-serif";
      ctx.fillText("Identity Allocation Status:", 410, 490);
      ctx.fillStyle = "#16A34A";
      ctx.font = "bold 18px Arial, sans-serif";
      ctx.fillText("ACTIVE INITIALIZED IDENTITY", 410, 520);

      ctx.fillStyle = "#9CA3AF";
      ctx.font = "12px Arial, sans-serif";
      ctx.fillText("Proof of identity issued via secure GrowthConnect platform records.", 410, 565);

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

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    if (photoPreviewUrl) {
      const userImg = new Image();
      userImg.crossOrigin = "anonymous";
      userImg.onload = () => {
        ctx.drawImage(userImg, centerX - radius, centerY - radius, radius * 2, radius * 2);
        ctx.restore();
        drawRestOfCard(ctx, canvas);
      };
      userImg.onerror = () => {
        ctx.fillStyle = "#1F2937";
        ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        ctx.restore();
        drawRestOfCard(ctx, canvas);
      };
      userImg.src = photoPreviewUrl;
    } else {
      ctx.fillStyle = "#1F2937";
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
      ctx.restore();
      drawRestOfCard(ctx, canvas);
    }
  }

  if (loadStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-brand-slate">
        Loading your details...
      </div>
    );
  }

  if (loadStatus === "otp-required") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <OtpGate email={emailValue} onVerified={runLookup} />
      </div>
    );
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
            <p><strong className="text-brand-slate">Cohort:</strong> {cohort}</p>
            <p><strong className="text-brand-slate">Preferred Name:</strong> {preferredName || "Not set yet"}</p>
            <p><strong className="text-brand-slate">Account Email:</strong> {emailValue}</p>
          </div>
        </div>

        <div className="bg-white border border-brand-line rounded-2xl p-6">
          <h3 className="text-base font-bold text-brand-charcoal mb-4">Complete and Personalize Your ID Card Details</h3>
          {saveSuccessMessage && <p className="text-sm text-green-600 mb-4 font-medium">Saved: {saveSuccessMessage}</p>}
          {saveError && <p className="text-sm text-red-500 mb-4">{saveError}</p>}
          <form onSubmit={handleProfileUpdate} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-brand-slate mb-1">Preferred First Name on Card</label>
              <TextInput placeholder="e.g. Regan" value={preferredName} onChange={(e) => setPreferredName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-slate mb-1">Alternate Phone</label>
              <TextInput placeholder="e.g. +234..." value={altPhone} onChange={(e) => setAltPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-slate mb-1">LinkedIn URL</label>
              <TextInput placeholder="https://linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-slate mb-1">Upload Profile Photo</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoChange}
                disabled={isUploadingPhoto}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-green/10 file:text-brand-green-dark hover:file:bg-brand-green/20"
              />
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                disabled={isUploadingPhoto}
                className="mt-2 text-xs font-semibold text-brand-green-dark hover:underline"
              >
                Or take a photo now
              </button>
              {isUploadingPhoto && <p className="text-xs text-brand-slate mt-1">Uploading photo...</p>}
              {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
              {showCamera && (
                <PhotoCameraCapture
                  onCapture={(blob) => {
                    setShowCamera(false);
                    uploadPhoto(blob);
                  }}
                  onClose={() => setShowCamera(false)}
                />
              )}
            </div>
            <Button type="submit" variant="primary" disabled={isSavingProfile}>
              {isSavingProfile ? "Saving..." : "Save Profile Details"}
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <Button variant="primary" onClick={downloadIdCard} disabled={isGeneratingCard}>
            {isGeneratingCard ? "Building Card..." : "Download ID Card Image"}
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
    <Suspense fallback={<div className="p-12 text-center text-sm text-brand-slate">Loading...</div>}>
      <SuccessCardContent />
    </Suspense>
  );
}







