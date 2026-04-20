import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL("https://sgi-africa.com"),
  applicationName: "SGI VICOBA",
  title: {
    default: "SGI VICOBA",
    template: "SGI VICOBA | %s",
  },
  description:
    "SGI VICOBA helps savings groups manage members, contributions, loans, meetings, and records securely.",
  keywords: [
    "SGI VICOBA",
    "VICOBA",
    "savings group",
    "group savings",
    "microfinance",
    "loans",
    "contributions",
    "Tanzania",
    "Africa",
  ],
  authors: [{ name: "SGI Africa", url: "https://sgi-africa.com" }],
  creator: "SGI Africa",
  publisher: "SGI Africa",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SGI VICOBA",
    title: "SGI VICOBA | Get started, stay secure",
    description:
      "SGI VICOBA helps savings groups manage members, contributions, loans, meetings, and records securely.",
    locale: "en_US",
    images: [
      {
        url: "/sgi-image.png",
        width: 1200,
        height: 630,
        alt: "SGI VICOBA",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
