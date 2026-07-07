"use client";

import { useState } from "react";

const YOUTUBE_ID = "hCl0ZSNAFB0";

export function VideoHero() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
      {playing ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1`}
          title="LaunchPadX introduction video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 w-full h-full group"
          aria-label="Play introduction video"
        >
          <img
            src={`https://img.youtube.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

          {/* "Press Play" text stamp */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/90 font-extrabold text-5xl md:text-6xl tracking-tight select-none [text-shadow:_0_2px_12px_rgb(0_0_0_/_40%)]">
              Press Play
            </span>
          </span>

          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-green text-white shadow-lg group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>

          {/* Dual-logo lockup, bottom-left */}
          <span className="absolute bottom-4 left-4 flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-white text-sm font-bold">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <circle cx="8" cy="8" r="3" fill="#fff" />
                <circle cx="8" cy="16" r="3" fill="#fff" />
                <circle cx="8" cy="24" r="3" fill="#2FA36B" />
                <circle cx="16" cy="8" r="3" fill="#fff" />
                <circle cx="24" cy="16" r="3" fill="#fff" />
                <line x1="8" y1="8" x2="8" y2="24" stroke="#fff" strokeWidth="1.5" />
                <line x1="8" y1="8" x2="16" y2="8" stroke="#fff" strokeWidth="1.5" />
                <line x1="8" y1="16" x2="24" y2="16" stroke="#fff" strokeWidth="1.5" />
              </svg>
              Growth Connect
            </span>
            <span className="w-px h-5 bg-white/40" />
            <span className="text-white text-sm font-bold italic">
              LaunchPad<span className="text-brand-green">X</span>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}