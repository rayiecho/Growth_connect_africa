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
          <span className="absolute bottom-4 left-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 350" className="h-6 w-auto">
              <g fill="#FFFFFF">
                <circle cx="70" cy="275" r="40"/>
                <circle cx="190" cy="275" r="40"/>
                <circle cx="190" cy="155" r="40"/>
                <circle cx="310" cy="155" r="40"/>
                <circle cx="310" cy="35" r="40"/>
              </g>
              <circle cx="310" cy="275" r="40" fill="#16A34A"/>
              <g stroke="#FFFFFF" strokeWidth="8">
                <line x1="110" y1="275" x2="150" y2="275"/>
                <line x1="230" y1="275" x2="270" y2="275"/>
                <line x1="190" y1="195" x2="190" y2="235"/>
                <line x1="230" y1="155" x2="270" y2="155"/>
                <line x1="310" y1="75" x2="310" y2="115"/>
                <line x1="310" y1="195" x2="310" y2="235"/>
              </g>
              <text x="430" y="165" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="140" fill="#FFFFFF" letterSpacing="-4">Growth</text>
              <text x="430" y="295" fontFamily="Arial, sans-serif" fontSize="140" fill="#FFFFFF" letterSpacing="-2">Connect</text>
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
