/** Shared by Studio splash. Demo deck metadata only. */
export const DEMO_DECKS = [
  {
    handle: "softkrush",
    name: "Soft Krush",
    blurb: "Musician · shows, merch, listen + socials",
    vibe: "hyperpop nights",
    avatar: "/demo/softkrush-avatar.png",
    accent: "#b967ff",
    cards: ["TV Eye · Ace Hotel", "Listening party", "Soft Krush tee", "Tip jar"],
  },
  {
    handle: "kilncity",
    name: "Kiln City",
    blurb: "Ceramic maker · workshops, shop + socials",
    vibe: "mud & main character energy",
    avatar: "/demo/kilncity-avatar.png",
    accent: "#cba25a",
    cards: [
      "Open Studio · mug night",
      "Wheel throwing 101",
      "Speckled latte mug",
      "Wavy catch-all dish",
    ],
  },
  {
    handle: "goodbatch",
    name: "Good Batch Roastery",
    blurb: "Coffee shop · beans, events + community",
    vibe: "oat milk + open mics",
    avatar: "/demo/goodbatch-avatar.png",
    accent: "#7c3aed",
    cards: ["Cupping this Saturday", "Ethiopia natural", "Open mic night", "Order beans"],
  },
] as const;
