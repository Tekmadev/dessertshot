"use client";

import { MotionConfig } from "motion/react";

/**
 * Every motion/react animation on the site follows the visitor's
 * reduced-motion setting: transforms are skipped, fades stay. Sections no
 * longer need their own MotionConfig to get this.
 */
export function MotionPreferences({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
