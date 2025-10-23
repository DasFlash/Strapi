export const VAT_RATE = 0.21;

export const PLATE_TYPES = {
  FIRST: 'first',
  SECOND: 'second',
  DESSERT: 'dessert',
};
export const RELATIONS = {
  FIRST_PLATE: 'firstPlate',
  SECOND_PLATE: 'secondPlate',
  DESSERT: 'dessert',
  ALLERGEN: 'allergen',
};

// errorMessages.ts
export const ERROR_MESSAGES = {
  MISSING_EXCLUDED_PARAM: 'Missing "excluded" query parameter',
  INVALID_PRICE_QUERY: 'Invalid or missing "min" or "max" query parameters.',
  FETCH_DESSERTS_ERROR: 'Error fetching desserts',
  FILTER_PRICE_ERROR: 'Error filtering menus by price',
  MOST_FREQUENT_PLATES_ERROR: 'Error computing most frequent plates',
  FILTER_ALLERGENS_ERROR: 'Error filtering menus by allergens',
  PRICES_NOT_FOUND: 'Prices not found',
};
