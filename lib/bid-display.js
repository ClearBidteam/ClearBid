export function getAuctionDisplay(auction) {
  const firstAuction = Array.isArray(auction) ? auction[0] : auction;

  return {
    title: firstAuction?.title ?? 'Auction',
    location: firstAuction?.location ?? 'Location',
  };
}
