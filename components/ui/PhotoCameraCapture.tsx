"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

export function PhotoCameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setReady(true);
        }
      })
      .catch(() => {
        setError("Could not access your camera. Please check permissions, or upload a photo file instead.");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
      },
      "image/jpeg",
      0.9
    );
  }

  function handleClose() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold text-brand-charcoal mb-3">Take a Photo</h3>
        {error ? (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-gray-100 mb-4" />
        )}
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-3">
          {ready && !error && (
            <Button variant="primary" onClick={handleCapture} className="flex-1">
              Capture
            </Button>
          )}
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
