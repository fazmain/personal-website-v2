import type { Metadata } from "next";
import { EB_Garamond, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import CityscapeFooter from '@/components/CityscapeFooter';
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Faiaz Azmain",
  description: "Software Engineer and Researcher",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col items-center px-6 py-8 md:px-12 md:py-12 lg:px-24 lg:pt-12 lg:pb-24 bg-[var(--background)] text-[var(--foreground)] selection:bg-[#c9d4e5] selection:text-[#0f172a]" suppressHydrationWarning>
        <main className="w-full max-w-2xl flex-grow pb-16">
          {children}
        </main>
        <CityscapeFooter />
      </body>
    </html>
  );
}
