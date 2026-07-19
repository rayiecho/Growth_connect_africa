"use client";

import { useState, useRef } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import { OtpGate } from "@/components/forms/OtpGate";

const SITE_URL = "https://lpx.growthconnect.africa";

type CertData = {
  code: string;
  first_name: string;
  last_name: string;
  lpx_id: string;
  cohort: string;
  completed_at: string;
};

export default function CertificatePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "not-found" | "not-eligible" | "otp-required" | "ready">("idle");
  const [cert, setCert] = useState<CertData | null>(null);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  async function runLookup() {
    setLoading(true);
    setError(null);
    setStatus("idle");

    try {
      const res = await fetch("/api/public/certificate/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setError(`Server error (status ${res.status}). Please try again.`);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (!data.found) {
        setStatus("not-found");
      } else if (data.otpRequired) {
        setStatus("otp-required");
      } else if (!data.eligible) {
        setStatus("not-eligible");
      } else {
        setCert(data.certificate);
        setStatus("ready");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    await runLookup();
  }

  function drawWaveBorder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, amplitude: number, waveLength: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= w; i += 4) {
      const yOff = Math.sin((i / waveLength) * Math.PI * 2) * amplitude;
      if (i === 0) ctx.moveTo(x + i, y + yOff);
      else ctx.lineTo(x + i, y + yOff);
    }
    ctx.stroke();
  }

  function drawCornerFlourish(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, rotation: number, color: string) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const r = size - i * (size / 6);
      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI, Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  async function drawCertificate(): Promise<HTMLCanvasElement | null> {
    if (!cert) return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const W = 2000;
    const H = 1414;
    canvas.width = W;
    canvas.height = H;

    const CREAM = "#FFFDF5";
    const GREEN = "#16A34A";
    const DARK_GREEN = "#0F6B37";
    const CHARCOAL = "#1F2937";
    const SLATE = "#6B7280";

    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, W, H);

    // Outer thick border
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    // Inner thin border
    ctx.strokeStyle = DARK_GREEN;
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, W - 110, H - 110);

    // Decorative wave bands along top and bottom, inside the border
    drawWaveBorder(ctx, 80, 90, W - 160, H, 6, 40, "rgba(22,163,74,0.35)");
    drawWaveBorder(ctx, 80, H - 90, W - 160, H, 6, 40, "rgba(22,163,74,0.35)");

    // Corner flourishes (four corners, mirrored)
    drawCornerFlourish(ctx, 140, 140, 70, 0, "rgba(15,107,55,0.4)");
    drawCornerFlourish(ctx, W - 140, 140, 70, Math.PI / 2, "rgba(15,107,55,0.4)");
    drawCornerFlourish(ctx, W - 140, H - 140, 70, Math.PI, "rgba(15,107,55,0.4)");
    drawCornerFlourish(ctx, 140, H - 140, 70, -Math.PI / 2, "rgba(15,107,55,0.4)");

    ctx.textAlign = "center";

    // Seal / logo mark, top center
    ctx.save();
    ctx.translate(W / 2, 160);
    const logoScale = 0.32;
    ctx.scale(logoScale, logoScale);
    ctx.fillStyle = CHARCOAL;
    [[70, 275], [190, 275], [190, 155], [310, 155], [310, 35]].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx - 190, cy - 155, 40, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = GREEN;
    ctx.beginPath();
    ctx.arc(310 - 190, 275 - 155, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = CHARCOAL;
    ctx.lineWidth = 8;
    const lines: [number, number, number, number][] = [
      [110, 275, 150, 275], [230, 275, 270, 275], [190, 195, 190, 235],
      [230, 155, 270, 155], [310, 75, 310, 115], [310, 195, 310, 235],
    ];
    lines.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1 - 190, y1 - 155);
      ctx.lineTo(x2 - 190, y2 - 155);
      ctx.stroke();
    });
    ctx.restore();

    ctx.fillStyle = CHARCOAL;
    ctx.font = "bold 34px Georgia, serif";
    ctx.fillText("GROWTHCONNECT AFRICA", W / 2, 270);

    ctx.fillStyle = GREEN;
    ctx.font = "bold 64px Georgia, serif";
    ctx.fillText("CERTIFICATE OF COMPLETION", W / 2, 340);

    ctx.fillStyle = SLATE;
    ctx.font = "20px Arial, sans-serif";
    ctx.fillText(`LAUNCHPADX PROGRAM ID: ${cert.lpx_id}`, W / 2, 385);

    ctx.fillStyle = CHARCOAL;
    ctx.font = "italic 28px Georgia, serif";
    ctx.fillText("hereby certifies that", W / 2, 470);

    ctx.fillStyle = CHARCOAL;
    ctx.font = "bold 84px Georgia, serif";
    ctx.fillText(`${cert.first_name} ${cert.last_name}`, W / 2, 570);

    ctx.fillStyle = SLATE;
    ctx.font = "24px Arial, sans-serif";
    ctx.fillText("is this day recognized as having successfully completed the", W / 2, 640);

    ctx.fillStyle = GREEN;
    ctx.font = "bold 42px Georgia, serif";
    ctx.fillText("LaunchPadX Accelerator Program", W / 2, 690);

    ctx.fillStyle = SLATE;
    ctx.font = "22px Arial, sans-serif";
    const completedDate = cert.completed_at
      ? new Date(cert.completed_at).toLocaleDateString("en-GB", { timeZone: "UTC", day: "2-digit", month: "long", year: "numeric" })
      : "-";
    ctx.fillText(`${cert.cohort || "LaunchPadX Program"} - Given this ${completedDate}`, W / 2, 735);

    // Bottom-left: registration-style details
    ctx.textAlign = "left";
    ctx.fillStyle = SLATE;
    ctx.font = "18px Arial, sans-serif";
    ctx.fillText("CERTIFICATE CODE", 160, 1190);
    ctx.fillStyle = CHARCOAL;
    ctx.font = "bold 26px Arial, sans-serif";
    ctx.fillText(cert.code, 160, 1225);

    // Bottom-center: signature
    ctx.textAlign = "center";
    ctx.strokeStyle = SLATE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 170, 1195);
    ctx.lineTo(W / 2 + 170, 1195);
    ctx.stroke();
    ctx.fillStyle = CHARCOAL;
    ctx.font = "italic 30px Georgia, serif";
    ctx.fillText("GrowthConnect Team", W / 2, 1180);
    ctx.fillStyle = SLATE;
    ctx.font = "16px Arial, sans-serif";
    ctx.fillText("Program Director", W / 2, 1220);

    // Bottom-right: QR code
    try {
      const verifyUrl = `${SITE_URL}/verify/${encodeURIComponent(cert.code)}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 200, color: { dark: "#1F2937", light: "#FFFDF5" } });
      const qrImg = new Image();
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
        qrImg.src = qrDataUrl;
      });
      ctx.drawImage(qrImg, W - 320, 1100, 160, 160);
      ctx.textAlign = "center";
      ctx.fillStyle = SLATE;
      ctx.font = "16px Arial, sans-serif";
      ctx.fillText("Scan to verify", W - 240, 1280);
    } catch (err) {
      console.error("QR generation failed:", err);
    }

    return canvas;
  }

  async function handleDownload() {
    setGenerating(true);
    try {
      const canvas = await drawCertificate();
      if (!canvas) {
        setGenerating(false);
        return;
      }
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`LaunchPadX-Certificate-${cert?.lpx_id ?? "certificate"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
    setGenerating(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <canvas ref={canvasRef} className="hidden" />
      <div className="max-w-xl mx-auto">
        <div className="bg-white border border-brand-line rounded-2xl p-8 shadow-sm">
          <span className="brand-eyebrow-line" />
          <h1 className="text-2xl font-bold text-brand-charcoal mb-2">Download Your Certificate</h1>
          <p className="text-sm text-brand-slate mb-6">
            Enter your email to check eligibility and download your Certificate of Completion.
          </p>

          {status !== "ready" && status !== "otp-required" && (
            <form onSubmit={handleLookup}>
              <label className="block text-sm font-semibold text-brand-charcoal mb-1.5">Email Address</label>
              <TextInput required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
              <Button type="submit" variant="primary" disabled={loading} className="mt-4">
                {loading ? "Checking..." : "Check Eligibility"}
              </Button>
            </form>
          )}

          {status === "not-found" && (
            <p className="text-sm text-red-500 mt-4">
              We couldn't find an application matching that email.
            </p>
          )}
          {status === "not-eligible" && (
            <p className="text-sm text-amber-700 mt-4">
              This email hasn't been marked as having completed the program yet. Please check back later or contact our team.
            </p>
          )}
          {status === "otp-required" && (
            <div className="mt-4">
              <OtpGate email={email.trim().toLowerCase()} onVerified={runLookup} />
            </div>
          )}
          {status === "ready" && cert && (
            <div>
              <p className="text-sm text-brand-green-dark mb-4">
                Congratulations, {cert.first_name}! Your certificate is ready.
              </p>
              <Button variant="primary" disabled={generating} onClick={handleDownload}>
                {generating ? "Preparing PDF..." : "Download Certificate (PDF)"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
