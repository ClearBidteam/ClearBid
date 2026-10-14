import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearBid",
  description: "ClearBid household and garage clearance auctions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[linear-gradient(145deg,#f3f6f1_0%,#e7efe5_100%)] font-[Arial,Helvetica,sans-serif] text-[#182522]">
        {children}
      </body>
    </html>
  );
}