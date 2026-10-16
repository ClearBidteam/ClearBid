const MAX_BID_AMOUNT = 9999999999.99;

export function parseBidAmount(input) {
  const value = String(input ?? '').trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    return { amount: null, error: 'Enter a positive amount with no more than two decimal places.' };
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_BID_AMOUNT) {
    return { amount: null, error: 'Enter a positive amount within the allowed range.' };
  }

  return { amount, error: '' };
}