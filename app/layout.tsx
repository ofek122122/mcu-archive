import type { Metadata, Viewport } from "next";
import { Anton, Barlow, JetBrains_Mono } from "next/font/google";

import { ParallaxBackdrop } from "@/components/parallax-backdrop";

import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const barlow = Barlow({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MCU Archive — Marvel Movie Tracker",
  description:
    "A private tracker for every Marvel Cinematic Universe film, Phase One through Phase Six.",
};

export const viewport: Viewport = {
  themeColor: "#04040a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${barlow.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ParallaxBackdrop />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
