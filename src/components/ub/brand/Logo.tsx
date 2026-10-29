import Image, { type StaticImageData } from "next/image";
import clsx from "clsx";
import logoBlue from "/public/img/brand/Primary-Logo-Blue.png";
import logoLight from "/public/img/brand/Primary-Logo-White.png";

// Unibexs logo (brief §7.1). PNG assets for now: SVG logos and the mono navy
// logo/symbol are a known missing asset (brief §11.8). The logo never
// mirrors in RTL, so the crop below is laid out in a fixed LTR box.

/** The surface the logo sits on. "auto" follows the theme (surface colour). */
export type LogoBackground = "auto" | "white" | "light-blue" | "navy" | "primary-blue";
export type LogoSize = "sm" | "md" | "lg" | "xl";

export interface LogoProps {
  /** Background the logo is placed on; picks the full-colour or light-on-dark artwork. Default "auto". */
  background?: LogoBackground;
  /** Show the symbol only (no wordmark), e.g. collapsed sidebar or favicon-sized slots. */
  symbolOnly?: boolean;
  /** Height of the artwork: sm 24 · md 32 · lg 48 · xl 64, or a number in px. Default "md". */
  size?: LogoSize | number;
  /** Accessible name. Pass "" when the logo sits next to visible "Unibexs" text. */
  alt?: string;
  className?: string;
  /** Load eagerly (above-the-fold placements such as the top bar). */
  priority?: boolean;
}

export const LOGO_SIZES: Record<LogoSize, number> = { sm: 24, md: 32, lg: 48, xl: 64 };

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Artwork {
  src: StaticImageData;
  /** Intrinsic pixel size of the PNG. */
  w: number;
  h: number;
  /** Visible lockup, excluding the asset's transparent padding. */
  full: Box;
  /** The symbol alone. */
  symbol: Box;
}

// Measured from the PNGs in public/img/brand/. Update when SVGs arrive.
const ARTWORK: Record<"color" | "light", Artwork> = {
  // Blue symbol + navy wordmark, for white and Light Blue backgrounds.
  color: { src: logoBlue, w: 378, h: 188, full: { x: 24, y: 58, w: 330, h: 72 }, symbol: { x: 24, y: 58, w: 76, h: 72 } },
  // Light Blue artwork, for navy, Primary Blue and the dark theme.
  light: { src: logoLight, w: 1268, h: 317, full: { x: 0, y: 0, w: 1268, h: 317 }, symbol: { x: 0, y: 0, w: 330, h: 317 } },
};

function Crop({ art, symbolOnly, height, className, priority }: { art: Artwork; symbolOnly: boolean; height: number; className?: string; priority?: boolean }) {
  const box = symbolOnly ? art.symbol : art.full;
  const scale = height / box.h;
  return (
    <span dir="ltr" aria-hidden="true" className={clsx("relative shrink-0 overflow-hidden", className)} style={{ width: Math.round(box.w * scale), height }}>
      <Image
        src={art.src}
        alt=""
        width={art.w}
        height={art.h}
        priority={priority}
        className="absolute max-w-none select-none"
        style={{ width: art.w * scale, height: art.h * scale, insetInlineStart: -box.x * scale, insetBlockStart: -box.y * scale }}
        draggable={false}
      />
    </span>
  );
}

/**
 * Unibexs logo for white, Light Blue, navy and Primary Blue backgrounds.
 * With background="auto" it shows the full-colour logo in the light theme and
 * the light-on-dark artwork under data-ub-theme="dark".
 */
export default function Logo({ background = "auto", symbolOnly = false, size = "md", alt = "Unibexs", className, priority }: LogoProps) {
  const height = typeof size === "number" ? size : LOGO_SIZES[size];
  const a11y = alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true as const };
  const crop = { symbolOnly, height, priority };

  return (
    <span {...a11y} className={clsx("inline-flex shrink-0 align-middle", className)}>
      {background === "auto" ? (
        <>
          <Crop art={ARTWORK.color} {...crop} className="inline-block dark:hidden" />
          <Crop art={ARTWORK.light} {...crop} className="hidden dark:inline-block" />
        </>
      ) : (
        <Crop art={background === "navy" || background === "primary-blue" ? ARTWORK.light : ARTWORK.color} {...crop} className="inline-block" />
      )}
    </span>
  );
}
