/** Shared SVG markup for deck logo — used in component + static favicon. */
export function DeckLogoGraphic({
  classNames = {},
}: {
  classNames?: {
    paper?: string;
    paperSunken?: string;
    ink?: string;
    line?: string;
  };
}) {
  const c = {
    paper: classNames.paper ?? "fill-paper",
    paperSunken: classNames.paperSunken ?? "fill-paper-sunken",
    ink: classNames.ink ?? "fill-ink stroke-ink",
    line: classNames.line ?? "stroke-line",
  };

  return (
    <>
      {/* back card — plain */}
      <g transform="translate(4 10) rotate(-14 14 18)">
        <rect x="0" y="0" width="28" height="38" rx="3" className={`${c.paper} stroke-ink`} strokeWidth="1.25" />
      </g>

      {/* middle card — plain */}
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

      {/* front card — black with moon + d */}
      <g transform="translate(24 2)">
        <rect x="0" y="0" width="28" height="38" rx="3" className={`${c.ink}`} strokeWidth="1.35" />

        <path
          d="M14 10 C11.8 10 10 11.9 10 14.2 C10 16.5 11.8 18.2 14 18.2 C12.4 16.9 11.7 15.2 12 13.5 C12.3 11.8 13.1 10.6 14 10 Z"
          className={c.paper}
        />

        <text
          x="14"
          y="30.5"
          textAnchor="middle"
          className={c.paper}
          style={{
            fontFamily: 'var(--font-instrument-serif), Georgia, "Times New Roman", serif',
            fontStyle: "italic",
            fontSize: "17px",
          }}
        >
          d
        </text>
      </g>
    </>
  );
}
