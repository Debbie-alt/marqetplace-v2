import type { Metadata } from "next";
import { MuseoModerno } from "next/font/google";
import { QueryProvider } from "@/components/query-provider";
import { MarketplaceProvider } from "@/components/marketplace-provider";
import "./globals.css";

const museoModerno = MuseoModerno({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-museo",
});

export const metadata: Metadata = {
  title: "Marqetplace",
  description: "Verified products with interactive 3D prototypes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${museoModerno.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider><MarketplaceProvider>{children}</MarketplaceProvider></QueryProvider>
      </body>
    </html>
  );
}
