import test from 'node:test';
import assert from 'node:assert/strict';

import { parseBidAmount } from './bid-validation.js';

test('accepts whole and two-decimal bid amounts', () => {
  assert.deepEqual(parseBidAmount('25'), { amount: 25, error: '' });
  assert.deepEqual(parseBidAmount('25.5'), { amount: 25.5, error: '' });
  assert.deepEqual(parseBidAmount('25.50'), { amount: 25.5, error: '' });
});

test('rejects malformed, non-positive, and out-of-range amounts', () => {
  for (const input of ['', '0', '-1', '1.001', '1e3', '1,000', '10000000000']) {
    assert.notEqual(parseBidAmount(input).error, '', `expected ${input} to be rejected`);
  }
});