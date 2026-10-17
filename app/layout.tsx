import type { Metadata } from "next";

import SiteNavigation from "@/app/site-navigation";
import { createClient } from "@/utils/supabase/server";

import "./globals.css";

export const metadata: Metadata = {
  title: "ClearBid",
  description: "ClearBid household and garage clearance auctions.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = String(user?.user_metadata?.full_name ?? "").trim();
  const firstName = String(user?.user_metadata?.first_name ?? "").trim();
  const lastName = String(user?.user_metadata?.last_name ?? "").trim();
  const displayName = user ? fullName || [firstName, lastName].filter(Boolean).join(" ") || user.email || "Account" : null;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[linear-gradient(145deg,#f3f6f1_0%,#e7efe5_100%)] font-[Arial,Helvetica,sans-serif] text-[#182522]">
        <SiteNavigation displayName={displayName} />
        <div className="pt-11 lg:pl-56 lg:pt-0">{children}</div>
      </body>
    </html>
  );
}