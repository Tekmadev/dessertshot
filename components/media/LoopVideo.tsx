"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { VideoAsset } from "@/lib/media";

/**
 * A silent looping clip that never costs the first paint: the poster is a
 * normal image (the LCP element when `priority`), and the video only loads
 * in the browser, after hydration, when motion is welcome (no reduced-motion,
 * no Save-Data). `lazy` waits until the clip is near the viewport. Phones get
 * the lighter encode. Once it plays, a pause button sits in the corner.
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

export default function LoopVideo({
  video,
  sizes,
  priority = false,
  lazy = false,
  className = "",
}: {
  video: VideoAsset;
  /** next/image `sizes` for the poster. */
  sizes: string;
  /** The poster is the page's largest image (hero). */
  priority?: boolean;
  /** Load the clip only when it nears the viewport (below the fold). */
  lazy?: boolean;
  className?: string;
}) {
  const motion = useSyncExternalStore(subscribeReduced, motionWelcome, never);
  const phone = useSyncExternalStore(subscribePhone, isPhone, never);
  const [near, setNear] = useState(!lazy);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // WCAG 2.2.2: anything that loops past five seconds needs a way to stop it.
  const togglePause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) void v.play().catch(() => {});
    else v.pause();
    setPaused(!paused);
  };

  useEffect(() => {
    if (near || !boxRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true);
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(boxRef.current);
    return () => io.disconnect();
  }, [near]);

  return (
    <div ref={boxRef} className={`relative overflow-hidden ${className}`}>
      <Image
        src={video.poster.src}
        alt={video.poster.alt}
        fill
        preload={priority}
        fetchPriority={priority ? "high" : undefined}
        sizes={sizes}
        className="object-cover"
      />
      {motion && near ? (
        <>
          <video
            ref={videoRef}
            key={phone ? "phone" : "desktop"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
            autoPlay={!paused}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onPlaying={() => setPlaying(true)}
          >
            <source src={phone ? video.mobileWebm : video.webm} type="video/webm" />
            <source src={phone ? video.mobileMp4 : video.mp4} type="video/mp4" />
          </video>
          {playing ? (
            <button
              type="button"
              onClick={togglePause}
              aria-pressed={paused}
              aria-label="Pause video"
              className="absolute bottom-3 right-3 z-10 flex size-11 items-center justify-center rounded-full bg-bone-soft/90 text-ink shadow-[0_8px_24px_-12px_rgba(58,29,40,0.5)] transition-colors hover:bg-bone-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {paused ? <Play aria-hidden="true" size={16} strokeWidth={1.8} /> : <Pause aria-hidden="true" size={16} strokeWidth={1.8} />}
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
