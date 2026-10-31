"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { clipVideo, type ProcessClip } from "@/lib/process-clips";

/**
 * One process clip layered over the tray video in MorningOf. Its poster is
 * always mounted (lazy) so switching steps crossfades instead of popping;
 * the video mounts only while its step is active and motion is welcome
 * (no reduced motion, no Save-Data), so at most one clip decodes at a time.
 */
const REDUCED = "(prefers-reduced-motion: reduce)";
const PHONE = "(max-width: 767px)";

function subscribeTo(query: string) {
  return (onChange: () => void) => {
    const m = window.matchMedia(query);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  };
}
const subscribeReduced = subscribeTo(REDUCED);
const subscribePhone = subscribeTo(PHONE);
const motionWelcome = () => {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return !window.matchMedia(REDUCED).matches && !saveData;
};
const isPhone = () => window.matchMedia(PHONE).matches;
const never = () => false;

export default function StepClip({
  clip,
  active,
  sizes,
  className = "",
}: {
  clip: ProcessClip;
  active: boolean;
  /** next/image `sizes` for the poster. */
  sizes: string;
  className?: string;
}) {
  const motion = useSyncExternalStore(subscribeReduced, motionWelcome, never);
  const phone = useSyncExternalStore(subscribePhone, isPhone, never);
  const video = clipVideo(clip);

  return (
    <div
      aria-hidden={!active}
      className={`overflow-hidden transition-opacity duration-700 ease-cinema ${active ? "opacity-100" : "opacity-0"} ${className}`}
    >
      <Image src={video.poster.src} alt={video.poster.alt} fill sizes={sizes} className="object-cover" />
      {motion && active ? (
        <ClipVideo
          key={phone ? "phone" : "desktop"}
          webm={phone ? video.mobileWebm : video.webm}
          mp4={phone ? video.mobileMp4 : video.mp4}
        />
      ) : null}
    </div>
  );
}

/** Mounted per activation, so it fades in fresh each time its step comes round. */
function ClipVideo({ webm, mp4 }: { webm: string; mp4: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <video
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
    >
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
