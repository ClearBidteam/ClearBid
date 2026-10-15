import test from 'node:test';
import assert from 'node:assert/strict';

import { getAuctionDisplay } from './bid-display.js';

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
