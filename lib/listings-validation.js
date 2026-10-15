export function validateListingInput(input = {}) {
  const errors = [];

  const title = String(input.title ?? '').trim();
  if (!title) {
    errors.push('title is required.');
  }

  const description = String(input.description ?? '').trim();
  if (!description) {
    errors.push('description is required.');
  }

  const category = String(input.category ?? '').trim();
  if (!category) {
    errors.push('category is required.');
  }

  const county = String(input.county ?? '').trim();
  if (!county) {
    errors.push('county is required.');
  }

  const location = String(input.location ?? '').trim();
  if (!location) {
    errors.push('location is required.');
  }

  const startPriceRaw = String(input.startPrice ?? '').trim();
  const startPrice = Number.parseFloat(startPriceRaw.replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(startPrice) || startPrice <= 0) {
    errors.push('start price must be greater than zero.');
  }

  const reservePriceRaw = String(input.reservePrice ?? '').trim();
  const reservePrice = Number.parseFloat(reservePriceRaw.replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(reservePrice) || reservePrice <= 0) {
    errors.push('reserve price must be greater than zero.');
  }

  if (Number.isFinite(startPrice) && Number.isFinite(reservePrice) && reservePrice < startPrice) {
    errors.push('reserve price must be greater than the start price.');
  }

  const endsAtValue = new Date(String(input.endsAt ?? ''));
  const isValidEndDate = !Number.isNaN(endsAtValue.getTime()) && endsAtValue > new Date();
  if (!isValidEndDate) {
    errors.push('end date must be a future date.');
  }

  return {
    values: {
      title,
      description,
      category,
      county,
      location,
      startPrice: Number.isFinite(startPrice) ? startPrice : 0,
      reservePrice: Number.isFinite(reservePrice) ? reservePrice : 0,
      endsAt: isValidEndDate ? endsAtValue.toISOString() : '',
    },
    errors,
  };
}
