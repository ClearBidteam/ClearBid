"use client";

import { useEffect } from "react";

import { recordAuctionView } from "@/app/actions/listings";

export default function AuctionViewTracker({ auctionId }: { auctionId: string }) {
  useEffect(() => {
    const key = `clearbid-viewed-${auctionId}`;
    if (window.sessionStorage.getItem(key)) return;

    window.sessionStorage.setItem(key, "1");
    void recordAuctionView(auctionId);
  }, [auctionId]);

  return null;
}