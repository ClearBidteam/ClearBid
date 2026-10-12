import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearBid",
  description: "ClearBid household and garage clearance auctions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}