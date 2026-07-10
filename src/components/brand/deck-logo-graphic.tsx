/** Shared SVG markup for deck logo — used in component + static favicon. */
export function DeckLogoGraphic({
  classNames = {},
}: {
  classNames?: {
    paper?: string;
    paperSunken?: string;
    ink?: string;
  };
}) {
  const c = {
    paper: classNames.paper ?? "fill-paper",
    paperSunken: classNames.paperSunken ?? "fill-paper-sunken",
    ink: classNames.ink ?? "fill-ink stroke-ink",
  };

  return (
    <>
      <g transform="translate(4 10) rotate(-14 14 18)">
        <rect x="0" y="0" width="28" height="38" rx="3" className={`${c.paper} stroke-ink`} strokeWidth="1.25" />
      </g>

      <g transform="translate(14 6) rotate(4 14 18)">
        <rect
          x="0"
          y="0"
          width="28"
          height="38"
          rx="3"
          className={`${c.paperSunken} stroke-ink`}
          strokeWidth="1.25"
        />
      </g>

      <g transform="translate(24 2)">
        <rect x="0" y="0" width="28" height="38" rx="3" className={c.ink} strokeWidth="1.35" />
        <text
          x="14"
          y="23.5"
          textAnchor="middle"
          dominantBaseline="middle"
          className={c.paper}
          style={{
            fontFamily: 'var(--font-instrument-serif), Georgia, "Times New Roman", serif',
            fontStyle: "italic",
            fontSize: "20px",
          }}
        >
          d
        </text>
      </g>
    </>
  );
}
