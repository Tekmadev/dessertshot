"use client";

import { motion } from "motion/react";
import { EASE_CINEMA } from "@/lib/constants";

/**
 * A short rise when the block scrolls into view (transform only). These blocks
 * carry prices, layers and allergens, so they never start transparent: they
 * read before the script loads, and without it. Reduced motion skips the rise
 * (the root MotionConfig). Keep it off the page's LCP element.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: 24 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: EASE_CINEMA, delay }}
    >
      {children}
    </motion.div>
  );
}
