/**
 * The share card, as satori JSX (flexbox only; every element with more than
 * one child is display:flex). Blush ground, the wordmark top left, kicker
 * and headline in the middle, the domain at the foot, and a 4:5 photo with
 * the site's rounded card corners on the right.
 */
import { BUSINESS } from "../../lib/business";
import { OG_HEIGHT, OG_WIDTH, type OgCard } from "../../lib/og";
import type { FittedText } from "./layout";

export const COLORS = {
  blush: "#fce4e7",
  ink: "#3a1d28",
  ink75: "rgba(58, 29, 40, 0.75)",
  ink65: "rgba(58, 29, 40, 0.65)",
  ink15: "rgba(58, 29, 40, 0.15)",
  rose: "#d04864",
  berry: "#b3213f",
};

/** The photo card on the right: 4:5, inset from the edges like the site's framed stills. */
export const PHOTO = { width: 440, height: 550, inset: 40, radius: 24 };

/** The text column on the left. */
export const COLUMN = { left: 76, top: 58, bottom: 54, width: 584 };

export const TYPE = {
  kicker: { size: 16, tracking: 0.2 },
  headline: { lineHeight: 1.02, tracking: -0.03 },
  subline: { lineHeight: 1.18, tracking: -0.01 },
  footer: { size: 18 },
};

export const LOGO = { width: 38, height: 69 };

type Props = {
  card: OgCard;
  headline: FittedText;
  subline?: FittedText;
  photo: string;
  logo: string;
};

function Lines({ text, tracking, lineHeight, italic, color }: { text: FittedText; tracking: number; lineHeight: number; italic?: boolean; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {text.lines.map((line, i) => {
        // Consecutive words in the same style share one span; the space before a new span leads it.
        const spans: { text: string; accent: boolean }[] = [];
        for (const w of line) {
          const last = spans[spans.length - 1];
          if (last && last.accent === w.accent) last.text += ` ${w.text}`;
          else spans.push({ text: spans.length ? ` ${w.text}` : w.text, accent: w.accent });
        }
        return (
          <div
            key={i}
            style={{
              display: "flex",
              whiteSpace: "pre",
              fontSize: text.size,
              lineHeight,
              letterSpacing: tracking * text.size,
              height: Math.round(lineHeight * text.size),
            }}
          >
            {spans.map((s, j) => (
              <span
                key={j}
                style={{
                  fontStyle: italic || s.accent ? "italic" : "normal",
                  color: s.accent ? COLORS.rose : color,
                }}
              >
                {s.text}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Wordmark({ logo }: { logo: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain <img> */}
      <img src={logo} width={LOGO.width} height={LOGO.height} alt="" style={{ marginRight: 16 }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontFamily: "Fraunces", color: COLORS.ink }}>
        <div style={{ display: "flex", fontSize: 38, lineHeight: 1, letterSpacing: -0.95 }}>
          <span>Dessert</span>
          <span style={{ fontStyle: "italic", color: COLORS.rose, marginLeft: 8 }}>Shot</span>
        </div>
        <div style={{ display: "flex", fontSize: 21, lineHeight: 1, fontStyle: "italic", color: COLORS.ink75, marginTop: 7 }}>
          by Farhana
        </div>
      </div>
    </div>
  );
}

export function Card({ card, headline, subline, photo, logo }: Props) {
  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: "flex",
        position: "relative",
        backgroundColor: COLORS.blush,
        fontFamily: "Inter Tight",
        color: COLORS.ink,
      }}
    >
      {/* Soft rose light behind the photo, as behind the site's hero frame. */}
      <div
        style={{
          position: "absolute",
          right: -120,
          top: -110,
          width: 760,
          height: 850,
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(208, 72, 100, 0.2) 0%, rgba(208, 72, 100, 0.07) 34%, rgba(208, 72, 100, 0) 62%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: COLUMN.left,
          top: COLUMN.top,
          bottom: COLUMN.bottom,
          width: COLUMN.width,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Wordmark logo={logo} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
            <div style={{ width: 28, height: 2, backgroundColor: COLORS.rose, marginRight: 14 }} />
            <div
              style={{
                display: "flex",
                fontSize: TYPE.kicker.size,
                fontWeight: 600,
                letterSpacing: TYPE.kicker.tracking * TYPE.kicker.size,
                color: COLORS.berry,
                lineHeight: 1,
              }}
            >
              {card.kicker.toUpperCase()}
            </div>
          </div>
          <div style={{ display: "flex", fontFamily: "Fraunces" }}>
            <Lines text={headline} tracking={TYPE.headline.tracking} lineHeight={TYPE.headline.lineHeight} color={COLORS.ink} />
          </div>
          {subline && (
            <div style={{ display: "flex", fontFamily: "Fraunces", marginTop: 18 }}>
              <Lines text={subline} tracking={TYPE.subline.tracking} lineHeight={TYPE.subline.lineHeight} italic color={COLORS.rose} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: TYPE.footer.size, fontWeight: 500, color: COLORS.ink65, lineHeight: 1 }}>
          {`${BUSINESS.domain} · ${BUSINESS.location.city} & ${BUSINESS.location.regionShort}`}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: PHOTO.inset,
          right: PHOTO.inset,
          width: PHOTO.width,
          height: PHOTO.height,
          display: "flex",
          borderRadius: PHOTO.radius,
          backgroundColor: "#fff8fa",
          boxShadow: "0 40px 80px -48px rgba(58, 29, 40, 0.55)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain <img> */}
        <img src={photo} width={PHOTO.width} height={PHOTO.height} alt="" style={{ borderRadius: PHOTO.radius }} />
      </div>
    </div>
  );
}
