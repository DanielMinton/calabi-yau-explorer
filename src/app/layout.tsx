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

export const metadata: Metadata = {
  metadataBase: new URL("https://github.com/DanielMinton/calabi-yau-explorer"),
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
    images: ["/images/OpossumLogo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Calabi-Yau Explorer | Daniel Minton",
    description:
      "An interactive WebGPU visualization of Calabi-Yau manifolds and the hidden dimensions of String Theory.",
    images: ["/images/OpossumLogo.png"],
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
