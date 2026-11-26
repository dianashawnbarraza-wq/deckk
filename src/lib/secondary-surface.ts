/** Shared Wispr-style lilac secondary surfaces (light) / soft violet (dark). */
export const secondarySurface =
  "border border-secondary-stroke bg-secondary text-secondary-foreground";

export const secondaryPill = `rounded-full ${secondarySurface}`;

/** Desktop-only hover grow + press shrink. */
export const desktopPress =
  "lg:transition-[transform,opacity,background-color] lg:duration-200 lg:ease-[cubic-bezier(0.16,1,0.3,1)] lg:hover:scale-[1.04] lg:active:scale-[0.96] motion-reduce:lg:transform-none motion-reduce:lg:transition-none";

export const secondaryButton =
  `inline-flex items-center justify-center rounded-full ${secondarySurface} font-semibold transition-opacity hover:opacity-90 ${desktopPress}`;
