"use client";

import { MotionConfig, motion } from "motion/react";
import { EASE_CINEMA } from "@/lib/constants";

/**
 * The site's fade-and-rise on entering the viewport, as a client wrapper so
 * server sections (events, FAQ, Instagram) keep their data on the server.
 * With reduced motion, motion drops the rise and keeps only the fade.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Rise distance in px. */
  y?: number;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1, ease: EASE_CINEMA, delay }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
