/**
 * Deckk landing patterns — stolen lightly from 21st.dev ideas,
 * adapted to lilac + Duck Sans (not drop-in components).
 *
 * Sources (inspiration only):
 * - Liquid Glass Logo Reveal → deck-logo-glass specular
 * - Melt Mark → deck-logo-bounce idle/hover
 * - Floating Gradient / Bubble Background → landing-atmosphere
 * - Glass Headline / frosted docks → landing-nav-glass
 * - Blur Reveal / Slide Up → ScrollReveal (.deckk-reveal)
 * - Word Fade In → LandingWordReveal
 * - Glass Prism / soft cards → landing-glass-card
 * - Micro Scale Fade → landing-cta press
 */

export const LANDING_PATTERNS = [
  {
    id: "logo-glass",
    name: "Liquid glass mark",
    inspiredBy: "Liquid Glass Logo Reveal",
    className: "deck-logo-glass",
  },
  {
    id: "logo-bounce",
    name: "Melt bounce",
    inspiredBy: "Melt Mark",
    className: "deck-logo-bounce",
  },
  {
    id: "atmosphere",
    name: "Soft atmosphere orbs",
    inspiredBy: "Floating Gradient / Bubble Background",
    className: "landing-atmosphere",
  },
  {
    id: "nav-glass",
    name: "Frosted sticky nav",
    inspiredBy: "Glass Headline / floating docks",
    className: "landing-nav-glass",
  },
  {
    id: "reveal",
    name: "Scroll blur-up",
    inspiredBy: "Blur Reveal / Slide Up Reveal",
    className: "deckk-reveal",
  },
  {
    id: "word-reveal",
    name: "Word fade-in",
    inspiredBy: "Word Fade In",
    className: "landing-word-reveal",
  },
  {
    id: "glass-card",
    name: "Quiet glass card",
    inspiredBy: "Glass Prism Hero",
    className: "landing-glass-card",
  },
  {
    id: "cta-press",
    name: "CTA press scale",
    inspiredBy: "Micro Scale Fade",
    className: "landing-cta",
  },
] as const;
