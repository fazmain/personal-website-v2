import type { Metadata } from "next";
import { Anton, Caveat, EB_Garamond, Geist_Mono } from "next/font/google";
import CityscapeFooter from '@/components/CityscapeFooter';
import SiteNav from '@/components/SiteNav';
import Ticker from '@/components/Ticker';
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Faiaz Azmain",
  description: "AI safety researcher and creative technologist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${geistMono.variable} ${anton.variable} ${caveat.variable} h-full antialiased`} suppressHydrationWarning>
      <body id="top" className="min-h-full flex flex-col items-center px-6 py-8 md:px-12 md:py-12 lg:px-24 lg:pt-12 lg:pb-24 bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-[var(--background)]" suppressHydrationWarning>
        <Ticker />
        <main className="relative w-full max-w-2xl flex-grow pb-16">
          <SiteNav />
          {children}
        </main>
        <CityscapeFooter />
      </body>
    </html>
  );
}
