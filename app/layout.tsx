import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearBid",
  description: "ClearBid household and garage clearance auctions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[linear-gradient(145deg,#f3f6f1_0%,#e7efe5_100%)] font-[Arial,Helvetica,sans-serif] text-[#182522]">
        {children}
      </body>
    </html>
  );
}