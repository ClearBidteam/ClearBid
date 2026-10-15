import test from 'node:test';
import assert from 'node:assert/strict';

import { validateListingInput } from './listings-validation.js';

test('accepts a valid listing payload with item condition and image info', () => {
  const result = validateListingInput({
    title: 'Garage full of tools',
    description: 'A full garage with drills and ladders',
    shortDescription: 'Cordless drill set and ladder bundle',
    itemCondition: 'good',
    category: 'garage',
    county: 'cork',
    location: 'Cork City',
    startPrice: '150',
    reservePrice: '450',
    endsAt: '2035-12-31T18:00:00.000Z',
    imageUrl: 'https://example.com/item.jpg',
  });

  assert.deepEqual(result.errors, []);
  assert.equal(typeof result.values.startPrice, 'number');
  assert.equal(typeof result.values.reservePrice, 'number');
  assert.equal(result.values.itemCondition, 'good');
  assert.equal(result.values.shortDescription, 'Cordless drill set and ladder bundle');
});

test('rejects a missing title, missing condition, and invalid pricing', () => {
  const result = validateListingInput({
    title: '',
    description: 'Some item',
    shortDescription: '',
    itemCondition: '',
    category: '',
    county: 'cork',
    location: 'Cork City',
    startPrice: '0',
    reservePrice: '-10',
    endsAt: '2020-01-01T00:00:00.000Z',
  });

  assert.ok(result.errors.length > 0);
  assert.ok(result.errors.some((error) => error.includes('title')));
  assert.ok(result.errors.some((error) => error.includes('short description')));
  assert.ok(result.errors.some((error) => error.includes('item condition')));
  assert.ok(result.errors.some((error) => error.includes('start price')));
  assert.ok(result.errors.some((error) => error.includes('reserve price')));
  assert.ok(result.errors.some((error) => error.includes('end date')));
});
