import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/lib/theme";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TravelAI - Putuj bez maski",
  description:
    "Prva platforma koja analizira hiljade recenzija pomoću AI agenata kako bi ti pokazala šta se stvarno dešava u hotelu.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-512.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#020205",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr" className={`dark ${inter.variable}`}>
      <body className="antialiased font-sans">
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
          <ServiceWorkerRegister />
        </SessionProvider>
      </body>
    </html>
  );
}
