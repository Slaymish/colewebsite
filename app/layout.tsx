import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://coleanderson.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cole Anderson",
    template: "Cole Anderson — %s",
  },
  description: "Cole Anderson — portfolio of projects, work, and ideas.",
  authors: [{ name: "Cole Anderson" }],
  creator: "Cole Anderson",
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: SITE_URL,
    siteName: "Cole Anderson",
    title: "Cole Anderson",
    description: "Cole Anderson — portfolio of projects, work, and ideas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cole Anderson",
    description: "Cole Anderson — portfolio of projects, work, and ideas.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Umami analytics */}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="7cc4085a-8090-4a85-9261-e75cc28da832"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
