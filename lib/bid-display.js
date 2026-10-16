export function getAuctionDisplay(auction) {
  const firstAuction = Array.isArray(auction) ? auction[0] : auction;

  return {
    title: firstAuction?.title ?? 'Auction',
    location: firstAuction?.location ?? 'Location',
  };
}

export function getHighestBid(summary) {
  if (!summary || summary.highest_bid === null || summary.highest_bid === undefined) {
    return null;
  }

  const value = Number(summary.highest_bid);
  return Number.isFinite(value) ? value : null;
}

export function getMinimumBid({ starting_price, highest_bid }) {
  const startingPrice = Number(starting_price);
  const highestBid = getHighestBid({ highest_bid });

  if (!Number.isFinite(startingPrice)) {
    return null;
  }

  if (highestBid === null) {
    return startingPrice;
  }

  return Math.max(startingPrice, highestBid + 0.01);
}
