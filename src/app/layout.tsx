/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import "katex/dist/katex.min.css";
import "./globals.css";

import Footer from "@/components/ui/Footer";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: { icon: "/favicon.svg" },
  title: "The Calabi-Yau Explorer | Daniel Minton",
  description:
    "An interactive WebGPU visualization of Calabi-Yau manifolds and the hidden dimensions of String Theory. Built by Daniel Minton.",
  authors: [{ name: "Daniel Minton" }],
  openGraph: {
    title: "The Calabi-Yau Explorer | Daniel Minton",
    description:
      "An interactive WebGPU visualization of Calabi-Yau manifolds and the hidden dimensions of String Theory. Built by Daniel Minton.",
    type: "website",
    siteName: "Calabi-Yau Explorer",
    images: [
      {
        url: `${siteUrl}/images/og-preview.png`,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Calabi-Yau Explorer | Daniel Minton",
    description:
      "An interactive WebGPU visualization of Calabi-Yau manifolds and the hidden dimensions of String Theory.",
    images: [`${siteUrl}/images/og-preview.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#0a0a0f] text-white`}
        suppressHydrationWarning
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
