import type { Metadata } from "next";
import { UnifrakturMaguntia } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const duckSans = localFont({
  src: [
    {
      path: "./fonts/duck-sans/DuckSans-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/duck-sans/DuckSans-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/duck-sans/DuckSans-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/duck-sans/DuckSans-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-duck-sans",
  display: "swap",
});

const unifrakturMaguntia = UnifrakturMaguntia({
  variable: "--font-gothic",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "deckk.me | Everything you share. One clear page.",
  description:
    "Turn flyers, products, and posts into a structured page with events, a shop, and one bio link. People find what they need without digging. Public beta soon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${duckSans.variable} ${unifrakturMaguntia.variable} h-full`}
    >
      <body className={`min-h-full flex flex-col font-sans ${duckSans.className}`}>
        {children}
      </body>
    </html>
  );
}
