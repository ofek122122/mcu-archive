import type { Metadata, Viewport } from "next";
import { Anton, Barlow, JetBrains_Mono } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { GOOGLE_SITE_VERIFICATION, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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

const TITLE = "MCU Archive — every Marvel film and series";

export const metadata: Metadata = {
  // Absolute URLs for the OG card and the manifest. Vercel injects the branch
  // URL on previews, so a preview links to itself rather than to production.
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — MCU Archive" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Every filter combination is a query string on this one page. Without a
  // canonical, `?view=mcu&order=chrono&phase=4` and a dozen others look like
  // separate near-identical pages and split whatever authority the site has.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  verification: { google: GOOGLE_SITE_VERIFICATION },
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
