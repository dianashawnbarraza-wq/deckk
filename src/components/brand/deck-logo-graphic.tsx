/** Shared SVG for deck logo — floating purple card with a D. */
export function DeckLogoGraphic() {
  return (
    <>
      {/* Soft shadow under card */}
      <ellipse
        cx="20"
        cy="30.5"
        rx="11"
        ry="2.2"
        fill="currentColor"
        opacity="0.14"
      />
      {/* Levitating card */}
      <g transform="translate(8 4)">
        <rect
          x="0"
          y="0"
          width="24"
          height="28"
          rx="5"
          fill="var(--accent, #6a4c86)"
        />
        {/* subtle inner highlight */}
        <rect
          x="1.25"
          y="1.25"
          width="21.5"
          height="25.5"
          rx="4"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
        />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          style={{
            fontFamily: 'var(--font-instrument-serif), Georgia, "Times New Roman", serif',
            fontStyle: "italic",
            fontSize: "16px",
            fontWeight: 500,
          }}
        >
          D
        </text>
      </g>
    </>
  );
}
