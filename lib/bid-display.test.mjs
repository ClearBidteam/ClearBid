import test from 'node:test';
import assert from 'node:assert/strict';

import { getAuctionDisplay, getHighestBid, getMinimumBid } from './bid-display.js';

test('reads auction title and location from a Supabase object relation', () => {
  const result = getAuctionDisplay({ title: 'Vintage dining set', location: 'Killarney' });

  assert.equal(result.title, 'Vintage dining set');
  assert.equal(result.location, 'Killarney');
});

test('supports the legacy array shape as a fallback', () => {
  const result = getAuctionDisplay([{ title: 'Garage tools', location: 'Clonmel' }]);

  assert.equal(result.title, 'Garage tools');
  assert.equal(result.location, 'Clonmel');
});

test('treats a real zero bid as a valid current bid and keeps the minimum bid logic sound', () => {
  assert.equal(getHighestBid({ highest_bid: 0 }), 0);
  assert.equal(getMinimumBid({ starting_price: 50, highest_bid: 0 }), 50);
  assert.equal(getMinimumBid({ starting_price: 50, highest_bid: 100.5 }), 100.51);
});
