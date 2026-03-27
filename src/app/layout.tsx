import { CursorProvider } from "@/contexts/CursorContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { WindowThemeProvider } from "@/contexts/WindowThemeContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { Analytics } from "@vercel/analytics/next";
import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import { Baskervville } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const baskervvile = Baskervville({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-baskervville",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "EXOCORPSE",
  description:
    "Desktop-style portfolio, blog, and fantasy archive for EXOCORPSE, featuring artwork, writing, and story worlds by fenrys and morris.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${baskervvile.variable} antialiased`}>
        <Analytics />
        <NuqsAdapter>
          <CursorProvider>
            <SoundProvider>
              <WindowThemeProvider>
                <QueryProvider>{children}</QueryProvider>
                <Toaster position="top-center" />
              </WindowThemeProvider>
            </SoundProvider>
          </CursorProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
