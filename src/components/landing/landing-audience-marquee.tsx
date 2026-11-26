const CHIPS = [
  "Creators",
  "Artists",
  "Makers",
  "Educators",
  "Fundraisers",
  "Organizers",
] as const;

export function LandingAudienceMarquee() {
  const loop = [...CHIPS, ...CHIPS, ...CHIPS, ...CHIPS];

  return (
    <section
      className="landing-marquee border-t border-[var(--landing-border)] overflow-hidden"
      aria-labelledby="audience-heading"
    >
      <div className="mx-auto w-full max-w-[var(--landing-max)] px-5 pt-[var(--landing-space-8)] lg:px-8">
        <p className="landing-eyebrow">Built for</p>
        <h2 id="audience-heading" className="sr-only">
          Creators, Artists, Makers, Educators, Fundraisers, Organizers
        </h2>
      </div>
      <div className="mt-6 pb-[var(--landing-space-8)]">
        <div className="landing-marquee-track flex w-max gap-3 px-5">
          {loop.map((chip, i) => (
            <span
              key={`${chip}-${i}`}
              className="inline-flex shrink-0 items-center rounded-[var(--landing-radius-pill)] border border-[var(--landing-border)] bg-[var(--landing-surface)] px-5 py-2.5 text-[15px] font-semibold text-[var(--landing-ink)]"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
