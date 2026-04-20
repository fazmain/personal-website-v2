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
  description: "Software Engineer and Researcher",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col items-center px-6 py-8 md:px-12 md:py-12 lg:px-24 lg:pt-12 lg:pb-24 bg-[var(--background)] text-[var(--foreground)] selection:bg-[#c9d4e5] selection:text-[#0f172a]">
        <main className="w-full max-w-2xl flex-grow pb-16">
          {children}
        </main>
        <footer className="w-full max-w-2xl flex items-center justify-center py-8 border-t border-[var(--foreground)]/10 text-[var(--foreground)]/50 text-sm font-medium mt-auto">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Faiaz Azmain.</span>
            <span className="italic font-serif">Crafted with</span>
            <span className="text-[#a1b8ce]">☕️</span>
            <span className="italic font-serif">and Antigravity</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
