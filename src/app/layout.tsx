import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelAI - Pronađi istinu u recenzijama",
  description:
    "AI analizira hiljade recenzija i pronalazi najbolji smestaj za tebe. Otkrij šta se krije iza marketinga.",
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
    <html lang="sr">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
