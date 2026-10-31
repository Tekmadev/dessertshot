import LoopVideo from "@/components/media/LoopVideo";
import { HERO_VIDEO } from "@/lib/media";
import styles from "./hero.module.css";

/**
 * The hero's portrait 4:5 frame: the Dubai Chocolate push-in (poster first,
 * preloaded as the LCP) and the "made fresh" tag.
 * Full content width on phones, right-hand column on desktop.
 */
export default function HeroFrame({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto w-full max-w-[30rem] lg:ml-auto lg:mr-0 lg:w-[min(100%,calc(74svh*0.8))] lg:max-w-none">
        {/* Soft blush light behind the cup; a gradient, not a blur filter, so it costs no paint. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[12%]"
          style={{
            background:
              "radial-gradient(closest-side at 50% 55%, rgba(208,72,100,0.20) 0%, rgba(208,72,100,0.08) 55%, rgba(208,72,100,0) 100%)",
          }}
        />
        <div className="relative">
          <div
            className={`relative aspect-[4/5] overflow-hidden rounded-[20px] bg-cream shadow-[0_40px_90px_-50px_rgba(58,29,40,0.55)] ${styles.settle}`}
          >
            <LoopVideo
              video={HERO_VIDEO}
              priority
              sizes="(min-width: 1024px) 36vw, (min-width: 768px) 30rem, calc(100vw - 48px)"
              className="h-full w-full"
            />
          </div>

          <div className="absolute left-3 top-3 rounded-2xl border border-ink/10 bg-bone-soft/95 px-4 py-3 shadow-[0_24px_60px_-20px_rgba(58,29,40,0.18)] lg:-left-10 lg:bottom-10 lg:top-auto">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/70">Made fresh</p>
            <p className="font-display text-[17px] leading-[1.1] tracking-[-0.02em] text-ink lg:text-[20px]">
              The morning of pickup
              <br />
              or delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
