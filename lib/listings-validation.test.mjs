import test from 'node:test';
import assert from 'node:assert/strict';

import { validateListingInput } from './listings-validation.js';

test('accepts a valid listing payload', () => {
  const result = validateListingInput({
    title: 'Garage full of tools',
    description: 'A full garage with drills and ladders',
    category: 'garage',
    county: 'cork',
    location: 'Cork City',
    startPrice: '150',
    reservePrice: '450',
    endsAt: '2035-12-31T18:00:00.000Z',
  });

  assert.deepEqual(result.errors, []);
  assert.equal(typeof result.values.startPrice, 'number');
  assert.equal(typeof result.values.reservePrice, 'number');
});

test('rejects a missing title and invalid pricing', () => {
  const result = validateListingInput({
    title: '',
    description: 'Some item',
    category: '',
    county: 'cork',
    location: 'Cork City',
    startPrice: '0',
    reservePrice: '-10',
    endsAt: '2020-01-01T00:00:00.000Z',
  });

  assert.ok(result.errors.length > 0);
  assert.ok(result.errors.some((error) => error.includes('title')));
  assert.ok(result.errors.some((error) => error.includes('start price')));
  assert.ok(result.errors.some((error) => error.includes('reserve price')));
  assert.ok(result.errors.some((error) => error.includes('end date')));
});
