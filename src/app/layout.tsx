import type { Metadata } from "next";
import { Instrument_Serif, Space_Grotesk, UnifrakturCook } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const unifrakturCook = UnifrakturCook({
  variable: "--font-gothic",
  subsets: ["latin"],
  weight: "700",
});

export const metadata: Metadata = {
  title: "deckk.me — your whole deck, dealt in one link",
  description:
    "A living micro site for makers — events, shop, and links with hierarchy that actually helps visitors find what matters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${spaceGrotesk.variable} ${unifrakturCook.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
