"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SiteNavigationProps = {
  displayName: string | null;
};

export default function SiteNavigation({ displayName }: SiteNavigationProps) {
  const pathname = usePathname();
  const initials = displayName
    ? displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()
    : "";

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-[#d9e6d8] bg-white px-4 py-6 lg:block">
        <Link href="/" className="text-xl font-extrabold text-[#173b2b]">Clear<span className="text-[#1d7a45]">Bid</span></Link>
        <nav aria-label="Quick navigation" className="mt-10 grid gap-2">
          <Link href="/#auctions" className="rounded-md px-3 py-2.5 text-sm font-semibold text-[#29452f] hover:bg-[#edf5ee]">Browse auctions</Link>
          <Link href="/listings/new" className="rounded-md px-3 py-2.5 text-sm font-semibold text-[#29452f] hover:bg-[#edf5ee]">List an auction</Link>
          <Link href="/account" className="rounded-md px-3 py-2.5 text-sm font-semibold text-[#29452f] hover:bg-[#edf5ee]">My account</Link>
          <Link href="/#footer" className="rounded-md px-3 py-2.5 text-sm font-semibold text-[#29452f] hover:bg-[#edf5ee]">Help</Link>
        </nav>
      </aside>
      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[#d9e6d8] bg-white px-1 py-2 lg:hidden">
        <Link href="/#auctions" className="px-1 py-2 text-center text-xs font-semibold text-[#29452f]">Browse</Link>
        <Link href="/listings/new" className="px-1 py-2 text-center text-xs font-semibold text-[#29452f]">List</Link>
        <Link href="/account" className="px-1 py-2 text-center text-xs font-semibold text-[#29452f]">Account</Link>
        <Link href="/#footer" className="px-1 py-2 text-center text-xs font-semibold text-[#29452f]">Help</Link>
      </nav>
      {pathname !== "/" && pathname !== "/login" && pathname !== "/signup" ? <div className="fixed right-4 top-4 z-40 sm:right-6 sm:top-5">
        {displayName ? (
          <Link href="/account" aria-label={`Open ${displayName}'s profile`} title="Your profile" className="grid size-10 place-items-center rounded-full border border-[#c5d7c8] bg-white text-sm font-bold text-[#1d7a45] shadow-sm">
            {initials}
          </Link>
        ) : (
          <Link href="/login" aria-label="Log in" title="Log in" className="grid size-10 place-items-center rounded-full border border-[#c5d7c8] bg-white text-sm font-bold text-[#29452f] shadow-sm">
            Log in
          </Link>
        )}
      </div> : null}
    </>
  );
}