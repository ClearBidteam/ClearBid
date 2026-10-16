"use client";

import { useActionState } from "react";

import { placeBid } from "@/app/actions/bids";

const initialState = { status: "idle" as const, message: "" };

export default function BidForm({
  auctionId,
  minimumBid,
}: {
  auctionId: string;
  minimumBid: number;
}) {
  const [state, formAction, pending] = useActionState(placeBid, initialState);

  return (
    <form action={formAction} className="mt-5 grid gap-3">
      <input type="hidden" name="auctionId" value={auctionId} />
      <label htmlFor="bid-amount" className="text-sm font-semibold text-[#29452f]">Your bid (EUR)</label>
      <input
        id="bid-amount"
        name="amount"
        type="number"
        min={minimumBid.toFixed(2)}
        step="0.01"
        placeholder={minimumBid.toFixed(2)}
        required
        disabled={pending}
        className="min-h-12 rounded-md border border-[#c5d7c8] px-3.5 focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20 disabled:opacity-60"
      />
      <p className="text-xs text-[#58665d]">Minimum next bid: €{minimumBid.toFixed(2)}</p>
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={state.status === "error"
            ? "rounded-md bg-[#fff3f1] px-4 py-3 text-sm font-semibold text-[#8b2924]"
            : "rounded-md bg-[#eefaf1] px-4 py-3 text-sm font-semibold text-[#1f5d39]"}
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 min-h-12 rounded-md bg-[#1d7a45] px-5 font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Placing bid..." : "Place bid"}
      </button>
    </form>
  );
}