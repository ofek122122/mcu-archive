import type { Metadata, Viewport } from "next";
import { Anton, Barlow, JetBrains_Mono } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

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
        {/* Clerk's own modals are themed to match the archive rather than
            arriving as a bright white box over a dark starfield. */}
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: {
              colorPrimary: "#e23636",
              colorBackground: "#0e0e18",
              colorForeground: "#edebe6",
              colorMutedForeground: "#8a8a9d",
              colorInput: "#04040a",
              borderRadius: "0.75rem",
            },
          }}
        >
          <ParallaxBackdrop />
          <div className="relative z-10">{children}</div>
        </ClerkProvider>
      </body>
    </html>
  );
}
