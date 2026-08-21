import type { Metadata } from "next";
import { QueryProvider } from "@/components/query-provider";
import { MarketplaceProvider } from "@/components/marketplace-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marqetplace",
  description: "Verified products with interactive 3D prototypes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider><MarketplaceProvider>{children}</MarketplaceProvider></QueryProvider>
      </body>
    </html>
  );
}
