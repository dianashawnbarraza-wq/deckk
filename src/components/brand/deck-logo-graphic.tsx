/** Tarot-style stacked cards — floating deck with a gothic lowercase d. */
export function DeckLogoGraphic() {
  return (
    <>
      {/* Ground shadow */}
      <ellipse cx="28" cy="44" rx="14" ry="2.4" fill="currentColor" opacity="0.12" />

      {/* Back card — tilted left */}
      <g transform="translate(2 12) rotate(-16 14 19)">
        <rect
          x="0"
          y="0"
          width="28"
          height="38"
          rx="4"
          fill="var(--accent, #6a4c86)"
          opacity="0.45"
        />
        <rect
          x="1.5"
          y="1.5"
          width="25"
          height="35"
          rx="3"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
      </g>

      {/* Middle card — slight tilt */}
      <g transform="translate(12 7) rotate(7 14 19)">
        <rect
          x="0"
          y="0"
          width="28"
          height="38"
          rx="4"
          fill="var(--accent, #6a4c86)"
          opacity="0.72"
        />
        <rect
          x="1.5"
          y="1.5"
          width="25"
          height="35"
          rx="3"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1"
        />
      </g>

      {/* Front card — upright, levitating */}
      <g transform="translate(22 2)">
        <rect x="0" y="0" width="28" height="38" rx="4" fill="var(--accent, #6a4c86)" />
        <rect
          x="2.5"
          y="2.5"
          width="23"
          height="33"
          rx="2.5"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.25"
        />
        <circle cx="6" cy="6" r="1.1" fill="rgba(255,255,255,0.55)" />
        <circle cx="22" cy="6" r="1.1" fill="rgba(255,255,255,0.55)" />
        <circle cx="6" cy="32" r="1.1" fill="rgba(255,255,255,0.55)" />
        <circle cx="22" cy="32" r="1.1" fill="rgba(255,255,255,0.55)" />

        <text
          x="14"
          y="22.5"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          style={{
            fontFamily: 'var(--font-gothic), "UnifrakturCook", "Old English Text MT", serif',
            fontSize: "22px",
            fontWeight: 700,
          }}
        >
          d
        </text>
      </g>
    </>
  );
}
