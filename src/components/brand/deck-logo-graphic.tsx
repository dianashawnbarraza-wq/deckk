/** Compact tarot-card stack with a gothic lowercase d. */
export function DeckLogoGraphic() {
  return (
    <>
      {/* Back card */}
      <rect
        x="1"
        y="4"
        width="16"
        height="20"
        rx="2.5"
        fill="var(--accent, #6a4c86)"
        opacity="0.55"
        transform="rotate(-12 9 14)"
      />
      {/* Front card */}
      <rect x="7" y="2" width="16" height="20" rx="2.5" fill="var(--accent, #6a4c86)" />
      <rect
        x="8.5"
        y="3.5"
        width="13"
        height="17"
        rx="1.5"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.9"
      />
      <text
        x="15"
        y="14.2"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        style={{
          fontFamily: 'var(--font-gothic), "UnifrakturMaguntia", "Old English Text MT", serif',
          fontSize: "15px",
          fontWeight: 400,
        }}
      >
        d
      </text>
    </>
  );
}
