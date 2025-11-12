import { CursorProvider } from "@/contexts/CursorContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { WindowThemeProvider } from "@/contexts/WindowThemeContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { Analytics } from "@vercel/analytics/next";
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
  title: "EXOCORPSE",
  description:
    "the duo of artist and writer in one vessel: a portfolio and terminal to the works created by the officers - fenrys & morris - who overlook the security and future of exocorpse. exocorpse is a corporation - ran by director lykomedes and surgeon aeveilith - that aims to cleanse the world from all sins by devoting themselves to becoming sinners - saints who taint their hands with blood are luminaries, shining stars that choose to burn out more quickly for the sake of humanity in a twisted manner. if you wish to enlist yourself, register your name within our terminal at any time.",
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
