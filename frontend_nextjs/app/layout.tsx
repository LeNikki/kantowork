import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { drukBold } from "./fonts/druk";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KantoWork",
  description: "KantoWork",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${drukBold.variable} antialiased`}
    >
      {/* min-h-dvh, not a h-full/min-h-full percentage chain: body has no
          height property, so a child's percentage height would compute to
          auto and the page would collapse to content height. dvh also tracks
          the collapsing mobile URL bar, which screen units do not. */}
      {/* suppressHydrationWarning: browser extensions (notably Grammarly)
          inject attributes such as data-gr-ext-installed onto <body> before
          React hydrates, which React reports as a hydration mismatch. The
          server HTML is clean, so this is client-side noise from an extension.
          One element deep only, so real mismatches below are still reported. */}
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
