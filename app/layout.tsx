import type { Metadata } from "next";
import { EB_Garamond, Geist_Mono } from "next/font/google";
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
  description: "AI safety researcher and creative technologist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] selection:bg-[#c9d4e5] selection:text-[#0f172a]" suppressHydrationWarning>
        {/* The main site's shell lives in app/(site)/layout.tsx; /art has its own in app/art/layout.tsx. */}
        {children}
      </body>
    </html>
  );
}
