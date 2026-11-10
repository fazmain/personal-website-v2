import type { Metadata } from "next";
import { EB_Garamond, Geist_Mono } from "next/font/google";
import CityscapeFooter from '@/components/CityscapeFooter';
import SiteNav from '@/components/SiteNav';
import { riverScript } from '@/lib/river';
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Google Analytics 4 Measurement ID ("G-..."). Set it where the site is built
// (e.g. Vercel → Settings → Environment Variables). When it's unset, as in
// local development, no analytics script is loaded.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
    <html lang="en" className={`${ebGaramond.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Picks this visit's colours before first paint; see lib/river.ts */}
        <script dangerouslySetInnerHTML={{ __html: riverScript() }} />
      </head>
      <body className="min-h-full flex flex-col items-center overflow-x-clip px-6 pt-8 md:px-12 md:pt-12 lg:px-24 bg-[var(--background)] text-[var(--foreground)] selection:bg-accent-soft selection:text-[var(--foreground)]" suppressHydrationWarning>
        <main className="relative w-full max-w-2xl flex-grow pb-16">
          <SiteNav />
          {children}
        </main>
        <CityscapeFooter />
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
